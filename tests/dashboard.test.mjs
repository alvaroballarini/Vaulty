import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./load-typescript.mjs";
const { getLocalMonthBoundaries } = loadTypeScript("src/lib/date-utils.ts");
const { buildPaymentOutlook } = loadTypeScript("src/lib/payment-outlook.ts");
const schedule = (extra = {}) => ({
  id: "a",
  description: "Pago",
  expectedAmount: 0.1,
  type: "EXPENSE",
  frequency: "WEEKLY",
  dayOfMonth: null,
  nextRunAt: "2026-10-06T12:00:00Z",
  ...extra,
});

test("month boundaries follow Argentina even while UTC is in the next month", () => {
  const data = getLocalMonthBoundaries(new Date("2026-03-01T01:00:00Z"));
  assert.equal(data.currentMonth, 2);
  assert.equal(
    data.currentMonthStart.toISOString(),
    "2026-02-01T03:00:00.000Z",
  );
  assert.equal(data.currentMonthEnd.toISOString(), "2026-03-01T02:59:59.999Z");
  assert.equal(data.prevMonthStart.toISOString(), "2026-01-01T03:00:00.000Z");
});

test("payment outlook includes repeated expenses, excludes income and retains cents", () => {
  const result = buildPaymentOutlook(
    [schedule(), schedule({ id: "b", type: "INCOME", expectedAmount: 100 })],
    1,
    new Date("2026-10-06T15:00:00Z"),
  );
  assert.equal(result.pendingExpenses, 0.3);
  assert.equal(result.afterPayments, 0.7);
  assert.equal(result.upcoming.length, 6);
});

test("missing or overdue scheduling prevents an unsupported available balance", () => {
  for (const nextRunAt of [null, "2026-10-01T12:00:00Z"]) {
    const result = buildPaymentOutlook(
      [schedule({ nextRunAt })],
      100,
      new Date("2026-10-06T15:00:00Z"),
    );
    assert.equal(result.afterPayments, null);
    assert.equal(result.needsReview, true);
  }
});

test("monthly schedules clamp the 31st to February, daily dates cross year-end", () => {
  const monthly = buildPaymentOutlook(
    [
      schedule({
        frequency: "MONTHLY",
        dayOfMonth: 31,
        nextRunAt: "2028-02-29T12:00:00Z",
      }),
    ],
    0,
    new Date("2028-02-20T15:00:00Z"),
  );
  assert.equal(monthly.upcoming.length, 1);
  assert.equal(monthly.afterPayments, -0.1);
  const daily = buildPaymentOutlook(
    [schedule({ frequency: "DAILY", nextRunAt: "2026-12-31T12:00:00Z" })],
    10,
    new Date("2026-12-31T15:00:00Z"),
  );
  assert.equal(daily.upcoming.length, 15);
  assert.equal(daily.upcoming[1].date.slice(0, 10), "2027-01-01");
});
