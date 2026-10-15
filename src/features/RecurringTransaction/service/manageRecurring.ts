"use server";
import { z } from "zod";
import { formatInTimeZone } from "date-fns-tz";
import { APP_TIMEZONE } from "@/lib/date-utils";
import prisma from "@/lib/prisma";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import { createRecurringTransactionSchema } from "../types/schemaRecurringTransaction";
import {
  calculateNextRunStart,
  scheduleFromDate,
} from "../hooks/calculateNextRun";
const schema = createRecurringTransactionSchema.extend({
  id: z.string().cuid().optional(),
  nextDate: z.string(),
});
export async function saveSchedule(input: z.infer<typeof schema>) {
  const auth = await getCurrentUser();
  if (!auth.authenticated) throw new Error("Sesión vencida");
  const { id, nextDate, ...data } = schema.parse(input);
  if (
    data.type === "TRANSFER" ||
    data.expectedAmount > 9999999999.99 ||
    Math.abs(
      data.expectedAmount * 100 - Math.round(data.expectedAmount * 100),
    ) > 0.001
  )
    throw new Error("Monto inválido");
  const schedule = scheduleFromDate(nextDate, data.frequency);
  if (schedule.nextRunAt <= new Date())
    throw new Error("Elegí una próxima fecha futura.");
  const userId = auth.session.userId;
  return prisma.$transaction(async (tx) => {
    const [account, category] = await Promise.all([
      tx.account.findFirst({
        where: { id: data.accountId, userId },
        select: { id: true },
      }),
      tx.category.findFirst({
        where: { id: data.categoryId, userId, type: data.type },
        select: { id: true },
      }),
    ]);
    if (!account || !category) throw new Error("Cuenta o categoría inválida");
    if (id) {
      const existing = await tx.recurringTransaction.findFirst({
        where: { id, userId },
      });
      if (!existing) throw new Error("Programación no encontrada");
      if (
        existing.frequency === data.frequency &&
        existing.nextRunAt &&
        formatInTimeZone(existing.nextRunAt, APP_TIMEZONE, "yyyy-MM-dd") ===
          nextDate
      ) {
        schedule.dayOfMonth = existing.dayOfMonth;
        schedule.dayOfWeek = existing.dayOfWeek;
      }
      const updated = await tx.recurringTransaction.updateMany({
        where: { id, userId, updatedAt: existing.updatedAt },
        data: { ...data, ...schedule },
      });
      if (updated.count !== 1)
        throw new Error(
          "La programación cambió. Volvé a abrirla antes de editar.",
        );
    } else
      await tx.recurringTransaction.create({
        data: { ...data, ...schedule, userId },
      });
  });
}
export async function setScheduleActive(id: string, active: boolean) {
  z.string().cuid().parse(id);
  z.boolean().parse(active);
  const auth = await getCurrentUser();
  if (!auth.authenticated) throw new Error("Sesión vencida");
  const userId = auth.session.userId;
  return prisma.$transaction(async (tx) => {
    const item = await tx.recurringTransaction.findFirst({
      where: { id, userId },
    });
    if (!item) throw new Error("Programación no encontrada");
    const nextRunAt =
      active && (!item.nextRunAt || item.nextRunAt <= new Date())
        ? calculateNextRunStart(item.frequency, item.dayOfWeek, item.dayOfMonth)
        : item.nextRunAt;
    const updated = await tx.recurringTransaction.updateMany({
      where: { id, userId, updatedAt: item.updatedAt },
      data: { isActive: active, ...(active ? { nextRunAt } : {}) },
    });
    if (updated.count !== 1)
      throw new Error("La programación cambió. Intentá nuevamente.");
  });
}
