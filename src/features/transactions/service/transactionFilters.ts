import type { Prisma } from "@/generated/prisma/client";
import { fromZonedTime } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/date-utils";
export function transactionFilters(params: URLSearchParams, userId: string) {
  const page = Math.min(
    100_000,
    Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1),
  );
  const where: Prisma.TransactionWhereInput = { userId };
  const q = params.get("q")?.trim().slice(0, 100);
  if (q)
    where.OR = [
      { description: { contains: q, mode: "insensitive" } },
      { account: { name: { contains: q, mode: "insensitive" } } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  const type = params.get("type");
  if (type === "INCOME" || type === "EXPENSE" || type === "TRANSFER")
    where.type = type;
  for (const field of ["accountId", "categoryId"] as const) {
    const value = params.get(field);
    if (value) where[field] = value;
  }
  const date: Prisma.DateTimeFilter = {};
  for (const [param, field, time] of [
    ["from", "gte", "T00:00:00.000"],
    ["to", "lte", "T23:59:59.999"],
  ] as const) {
    const value = params.get(param);
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const parsed = fromZonedTime(value + time, APP_TIMEZONE);
      if (Number.isFinite(parsed.getTime())) date[field] = parsed;
    }
  }
  if (Object.keys(date).length) where.date = date;
  return { where, page, pageSize: 20 };
}
