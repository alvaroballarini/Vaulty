import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./load-typescript.mjs";
const calendar = loadTypeScript(
  "src/features/RecurringTransaction/hooks/calculateNextRun.ts",
);
test("monthly schedules retain their day after short months and year boundaries", () => {
  let nextRunAt = new Date("2027-01-31T15:00:00Z");
  nextRunAt = calendar.default({
    frequency: "MONTHLY",
    dayOfMonth: 31,
    nextRunAt,
  });
  assert.equal(nextRunAt.toISOString(), "2027-02-28T15:00:00.000Z");
  nextRunAt = calendar.default({
    frequency: "MONTHLY",
    dayOfMonth: 31,
    nextRunAt,
  });
  assert.equal(nextRunAt.toISOString(), "2027-03-31T15:00:00.000Z");
  assert.equal(
    calendar
      .default({
        frequency: "MONTHLY",
        dayOfMonth: 31,
        nextRunAt: new Date("2026-12-31T15:00:00Z"),
      })
      .toISOString(),
    "2027-01-31T15:00:00.000Z",
  );
  assert.equal(
    calendar
      .default({
        frequency: "MONTHLY",
        dayOfMonth: 31,
        nextRunAt: new Date("2028-01-31T15:00:00Z"),
      })
      .toISOString(),
    "2028-02-29T15:00:00.000Z",
  );
});
test("calendar uses Argentina date boundaries and validates impossible dates", () => {
  assert.equal(
    calendar
      .calculateNextRunStart(
        "DAILY",
        null,
        null,
        new Date("2026-10-16T01:00:00Z"),
      )
      .toISOString(),
    "2026-10-16T15:00:00.000Z",
  );
  assert.throws(() => calendar.scheduleFromDate("2027-02-31", "MONTHLY"));
  assert.equal(
    calendar.scheduleFromDate("2026-10-19", "WEEKLY").dayOfWeek,
    "MONDAY",
  );
});
test("history filters preserve owner scope and apply full Argentina days", () => {
  const { transactionFilters } = loadTypeScript(
    "src/features/transactions/service/transactionFilters.ts",
  );
  const { where, page, pageSize } = transactionFilters(
    new URLSearchParams(
      "q=market&type=EXPENSE&from=2026-10-01&to=2026-10-15&page=-5&userId=other",
    ),
    "owner",
  );
  assert.equal(where.userId, "owner");
  assert.equal(where.type, "EXPENSE");
  assert.equal(where.OR.length, 3);
  assert.equal(where.date.gte.toISOString(), "2026-10-01T03:00:00.000Z");
  assert.equal(where.date.lte.toISOString(), "2026-10-16T02:59:59.999Z");
  assert.equal(page, 1);
  assert.equal(pageSize, 20);
});
const input = {
  id: "cm000000000000000000000001",
  accountId: "cm000000000000000000000002",
  categoryId: "cm000000000000000000000003",
  description: "Alquiler",
  expectedAmount: 250000,
  type: "EXPENSE",
  frequency: "MONTHLY",
  isActive: true,
  nextDate: "2099-01-31",
};
function manager({ authenticated = true, owned = true } = {}) {
  const reads = [],
    writes = [];
  const tx = {
    account: {
      findFirst: async (query) => {
        reads.push(query);
        return owned ? { id: input.accountId } : null;
      },
    },
    category: {
      findFirst: async (query) => {
        reads.push(query);
        return owned ? { id: input.categoryId } : null;
      },
    },
    recurringTransaction: {
      findFirst: async () => ({
        frequency: "MONTHLY",
        nextRunAt: new Date("2099-02-28T15:00:00Z"),
        dayOfMonth: 31,
        dayOfWeek: null,
        updatedAt: new Date(),
      }),
      updateMany: async (query) => {
        writes.push(query);
        return { count: 1 };
      },
      create: async (query) => writes.push(query),
    },
  };
  const actions = loadTypeScript(
    "src/features/RecurringTransaction/service/manageRecurring.ts",
    {
      "@/lib/prisma": { default: { $transaction: async (fn) => fn(tx) } },
      "@/features/auth/service/getCurrentUser": {
        default: async () => ({ authenticated, session: { userId: "owner" } }),
      },
    },
  );
  return { ...actions, reads, writes };
}
test("schedule editing validates auth, ownership, precision and future dates", async () => {
  for (const options of [{ authenticated: false }, { owned: false }]) {
    const mock = manager(options);
    await assert.rejects(() => mock.saveSchedule(input));
    assert.equal(mock.writes.length, 0);
  }
  for (const extra of [
    { expectedAmount: 0.001 },
    { expectedAmount: 1e12 },
    { nextDate: "2001-01-01" },
    { type: "TRANSFER" },
  ]) {
    const mock = manager();
    await assert.rejects(() => mock.saveSchedule({ ...input, ...extra }));
    assert.equal(mock.writes.length, 0);
  }
  const mock = manager();
  await mock.saveSchedule(input);
  assert.equal(mock.writes[0].where.userId, "owner");
  assert.equal(mock.writes[0].data.dayOfMonth, 31);
  assert.ok(mock.reads.every((query) => query.where.userId === "owner"));
});
test("editing an amount preserves the monthly anchor through February", async () => {
  const mock = manager();
  await mock.saveSchedule({
    ...input,
    nextDate: "2099-02-28",
    expectedAmount: 300000,
  });
  assert.equal(mock.writes[0].data.dayOfMonth, 31);
});

test("pausing does not overwrite the next occurrence and resume is scoped to the owner", async () => {
  const mock = manager();
  await mock.setScheduleActive(input.id, false);
  assert.equal(mock.writes[0].where.userId, "owner");
  assert.equal(mock.writes[0].data.isActive, false);
  assert.equal(Object.hasOwn(mock.writes[0].data, "nextRunAt"), false);
});

test("recurring processor claims each occurrence before creating a ledger entry", async () => {
  const recurring = {
    id: input.id,
    userId: "owner",
    accountId: input.accountId,
    categoryId: input.categoryId,
    description: "Alquiler",
    expectedAmount: 250000,
    type: "EXPENSE",
    frequency: "MONTHLY",
    dayOfMonth: 31,
    nextRunAt: new Date("2026-01-31T15:00:00Z"),
    updatedAt: new Date("2026-01-01T15:00:00Z"),
  };
  let claimed = false;
  const entries = [];
  const tx = {
    recurringTransaction: {
      updateMany: async (query) => {
        assert.equal(query.where.updatedAt, recurring.updatedAt);
        if (claimed) return { count: 0 };
        claimed = true;
        return { count: 1 };
      },
    },
    transaction: { create: async (query) => entries.push(query) },
    notification: { create: async () => {} },
  };
  const { processRecurringTransactions } = loadTypeScript(
    "src/features/RecurringTransaction/service/processRecurringTransactions.ts",
    {
      "@/lib/prisma": {
        default: {
          recurringTransaction: { findMany: async () => [recurring] },
          $transaction: async (fn) => fn(tx),
        },
      },
    },
  );
  const results = await Promise.all([
    processRecurringTransactions(),
    processRecurringTransactions(),
  ]);
  assert.equal(entries.length, 1);
  assert.equal(
    results.reduce((sum, item) => sum + item.processed, 0),
    1,
  );
  assert.equal(entries[0].data.date, recurring.nextRunAt);
});
