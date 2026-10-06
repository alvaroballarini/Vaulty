import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "./date-utils";

type Schedule = {
  id: string;
  description: string;
  expectedAmount: number;
  type: string;
  frequency: string;
  dayOfMonth: number | null;
  nextRunAt: Date | string | null;
};
export type UpcomingPayment = {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
  overdue: boolean;
};
export type PaymentOutlook = {
  through: string;
  pendingExpenses: number;
  afterPayments: number | null;
  needsReview: boolean;
  upcoming: UpcomingPayment[];
};

// Count every occurrence in the next 14 calendar days, using cents for totals.
// Stale/missing schedule dates invalidate the estimate instead of overstating funds.
export function buildPaymentOutlook(
  schedules: Schedule[],
  balance: number,
  now: Date,
): PaymentOutlook {
  const today = formatInTimeZone(now, APP_TIMEZONE, "yyyy-MM-dd");
  const end = new Date(today + "T00:00:00Z");
  end.setUTCDate(end.getUTCDate() + 14);
  const through = end.toISOString().slice(0, 10);
  let needsReview = false;
  let expenseCents = 0;
  const upcoming: UpcomingPayment[] = [];
  for (const item of schedules) {
    if (!item.nextRunAt) {
      needsReview = true;
      continue;
    }
    let next = new Date(item.nextRunAt);
    if (!Number.isFinite(next.getTime())) {
      needsReview = true;
      continue;
    }
    for (let occurrence = 0; occurrence < 16; occurrence++) {
      const day = formatInTimeZone(next, APP_TIMEZONE, "yyyy-MM-dd");
      if (day > through) break;
      const overdue = day < today;
      if (overdue) needsReview = true;
      upcoming.push({
        id: `${item.id}-${day}`,
        description: item.description,
        amount: item.expectedAmount,
        type: item.type,
        date: next.toISOString(),
        overdue,
      });
      if (item.type === "EXPENSE" && !overdue)
        expenseCents += Math.round(item.expectedAmount * 100);
      if (overdue) break;
      const calendar = new Date(day + "T00:00:00Z");
      if (item.frequency === "MONTHLY") {
        const targetMonth = calendar.getUTCMonth() + 1;
        const year = calendar.getUTCFullYear();
        const lastDay = new Date(
          Date.UTC(year, targetMonth + 1, 0),
        ).getUTCDate();
        calendar.setUTCDate(1);
        calendar.setUTCMonth(targetMonth);
        calendar.setUTCDate(
          Math.min(item.dayOfMonth ?? Number(day.slice(-2)), lastDay),
        );
      } else if (item.frequency === "DAILY" || item.frequency === "WEEKLY") {
        calendar.setUTCDate(
          calendar.getUTCDate() + (item.frequency === "DAILY" ? 1 : 7),
        );
      } else {
        needsReview = true;
        break;
      }
      next = fromZonedTime(
        calendar.toISOString().slice(0, 10) +
          "T" +
          formatInTimeZone(next, APP_TIMEZONE, "HH:mm:ss"),
        APP_TIMEZONE,
      );
    }
  }
  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  return {
    through,
    pendingExpenses: expenseCents / 100,
    afterPayments: needsReview
      ? null
      : (Math.round(balance * 100) - expenseCents) / 100,
    needsReview,
    upcoming,
  };
}
