import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const APP_TIMEZONE = "America/Argentina/Buenos_Aires";

export function getLocalMonthBoundaries(baseDate: Date = new Date(), timezone = APP_TIMEZONE) {
  const year = Number(formatInTimeZone(baseDate, timezone, "yyyy"));
  const month = Number(formatInTimeZone(baseDate, timezone, "MM")) - 1;
  const start = (offset: number) => {
    const calendar = new Date(Date.UTC(year, month + offset, 1));
    return fromZonedTime(calendar.toISOString().slice(0, 10) + "T00:00:00", timezone);
  };
  return {
    currentMonth: month + 1, currentYear: year, currentDate: new Date(baseDate),
    currentMonthStart: start(0), currentMonthEnd: new Date(start(1).getTime() - 1),
    prevMonthStart: start(-1), prevMonthEnd: new Date(start(0).getTime() - 1),
    historyStartDate: start(-35),
  };
}
