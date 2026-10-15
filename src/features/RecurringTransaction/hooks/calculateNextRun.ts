import type { DayOfWeek, Frequency } from "@/generated/prisma/enums";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/date-utils";
const days: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];
function localParts(date: Date) {
  return formatInTimeZone(date, APP_TIMEZONE, "yyyy-MM-dd")
    .split("-")
    .map(Number);
}
function atNoon(year: number, month: number, day: number) {
  const calendar = new Date(Date.UTC(year, month - 1, day));
  return fromZonedTime(
    calendar.toISOString().slice(0, 10) + "T12:00:00",
    APP_TIMEZONE,
  );
}
function monthDate(year: number, month: number, day: number) {
  return atNoon(
    year,
    month,
    Math.min(day, new Date(Date.UTC(year, month, 0)).getUTCDate()),
  );
}
export default function calculateNextRun(recurring: {
  frequency: Frequency;
  nextRunAt: Date | null;
  dayOfMonth?: number | null;
}): Date {
  if (!recurring.nextRunAt) throw new Error("Fecha pendiente");
  const [year, month, day] = localParts(recurring.nextRunAt);
  switch (recurring.frequency) {
    case "DAILY":
      return atNoon(year, month, day + 1);
    case "WEEKLY":
      return atNoon(year, month, day + 7);
    case "MONTHLY":
      return monthDate(year, month + 1, recurring.dayOfMonth ?? day);
  }
}
export function calculateNextRunStart(
  frequency: Frequency,
  dayOfWeek?: DayOfWeek | null,
  dayOfMonth?: number | null,
  from: Date = new Date(),
): Date {
  const [year, month, day] = localParts(from);
  if (frequency === "DAILY") return atNoon(year, month, day + 1);
  if (frequency === "WEEKLY") {
    if (!dayOfWeek) throw new Error("Elegí un día de la semana");
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return atNoon(
      year,
      month,
      day + ((days.indexOf(dayOfWeek) - weekday + 7) % 7 || 7),
    );
  }
  if (!dayOfMonth) throw new Error("Elegí un día del mes");
  const candidate = monthDate(year, month, dayOfMonth);
  return candidate > from ? candidate : monthDate(year, month + 1, dayOfMonth);
}
export function scheduleFromDate(date: string, frequency: Frequency) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Fecha inválida");
  const nextRunAt = fromZonedTime(date + "T12:00:00", APP_TIMEZONE);
  if (
    !Number.isFinite(nextRunAt.getTime()) ||
    formatInTimeZone(nextRunAt, APP_TIMEZONE, "yyyy-MM-dd") !== date
  )
    throw new Error("Fecha inválida");
  const [year, month, day] = date.split("-").map(Number);
  return {
    nextRunAt,
    dayOfMonth: frequency === "MONTHLY" ? day : null,
    dayOfWeek:
      frequency === "WEEKLY"
        ? days[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
        : null,
  };
}
