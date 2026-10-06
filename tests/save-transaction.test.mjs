import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./load-typescript.mjs";

const input = {
  accountId: "cm000000000000000000000001",
  categoryId: "cm000000000000000000000011",
  amount: 18500.5,
  date: new Date("2026-10-06T15:00:00Z"),
  type: "EXPENSE",
  description: " Compra ",
};
function setup({
  authenticated = true,
  ownedAccount = true,
  validCategory = true,
  updateCount = 1,
  fail = false,
} = {}) {
  const writes = [];
  const reads = [];
  const prisma = {
    account: {
      findFirst: async (query) => {
        reads.push(query);
        return ownedAccount ? { id: input.accountId } : null;
      },
    },
    category: {
      findFirst: async (query) => {
        reads.push(query);
        return validCategory ? { id: input.categoryId } : null;
      },
    },
    transaction: {
      create: async (query) => {
        if (fail) throw new Error("Database unavailable");
        writes.push(query);
        return { id: "created" };
      },
      updateMany: async (query) => {
        writes.push(query);
        return { count: updateCount };
      },
    },
  };
  const { saveTransaction } = loadTypeScript(
    "src/features/transactions/service/saveTransaction.ts",
    {
      "@/lib/prisma": { default: prisma },
      "@/features/auth/service/getCurrentUser": {
        default: async () => ({ authenticated, session: { userId: "owner" } }),
      },
    },
  );
  return { saveTransaction, writes, reads };
}

test("unauthenticated callers cannot read or write transaction data", async () => {
  const { saveTransaction, writes, reads } = setup({ authenticated: false });
  assert.equal((await saveTransaction(input)).ok, false);
  assert.deepEqual(writes, []);
  assert.deepEqual(reads, []);
});

test("server rejects invalid money/date and cross-account or wrong-type category references", async () => {
  for (const extra of [
    { amount: 0 },
    { amount: -10 },
    { amount: 0.001 },
    { amount: 1e12 },
    { date: "invalid" },
    { type: "TRANSFER" },
  ]) {
    const { saveTransaction, writes } = setup();
    assert.equal((await saveTransaction({ ...input, ...extra })).ok, false);
    assert.deepEqual(writes, []);
  }
  for (const options of [{ ownedAccount: false }, { validCategory: false }]) {
    const { saveTransaction, writes, reads } = setup(options);
    assert.equal((await saveTransaction(input)).ok, false);
    assert.deepEqual(writes, []);
    assert.equal(reads[0].where.userId, "owner");
    assert.equal(reads[1].where.userId, "owner");
    assert.equal(reads[1].where.type, "EXPENSE");
  }
});

test("creation uses authenticated ownership and only validated fields", async () => {
  const { saveTransaction, writes } = setup();
  assert.deepEqual(
    await saveTransaction({
      ...input,
      userId: "attacker",
      unexpected: "ignored",
    }),
    { ok: true, id: "created" },
  );
  assert.equal(writes[0].data.userId, "owner");
  assert.equal(writes[0].data.amount, 18500.5);
  assert.equal(writes[0].data.description, "Compra");
  assert.equal(writes[0].data.unexpected, undefined);
});

test("editing scopes the update to the owner and reports missing records", async () => {
  const { saveTransaction, writes } = setup({ updateCount: 0 });
  const id = "cm000000000000000000000099";
  assert.equal((await saveTransaction({ ...input, id })).ok, false);
  assert.deepEqual(writes[0].where, { id, userId: "owner" });
});

test("database failure never returns a successful save", async () => {
  const { saveTransaction } = setup({ fail: true });
  const result = await saveTransaction(input);
  assert.equal(result.ok, false);
  assert.match(result.error, /No se pudo guardar/);
});

test("deletion does not return non-serializable database values", async () => {
  const calls = [];
  const { default: remove } = loadTypeScript(
    "src/features/transactions/service/delete.ts",
    {
      "@/features/auth/service/getCurrentUser": {
        default: async () => ({
          authenticated: true,
          session: { userId: "owner" },
        }),
      },
      "../data/delete": {
        default: async (query) => {
          calls.push(query);
          return { amount: { toNumber: () => 10 } };
        },
      },
    },
  );
  assert.equal(await remove("transaction-id"), undefined);
  assert.deepEqual(calls, [{ userId: "owner", id: "transaction-id" }]);
});
