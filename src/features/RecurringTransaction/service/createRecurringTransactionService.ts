"use server";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import { CreateRecurringTransactionInput, createRecurringTransactionSchema } from "../types/schemaRecurringTransaction";
import createRecurringTransaction from "../data/create";
import prisma from "@/lib/prisma";
export default async function createRecurringTransactionService(input: CreateRecurringTransactionInput) {
  const auth = await getCurrentUser();
  if (!auth.authenticated) throw new Error("Sesión vencida");
  const data = createRecurringTransactionSchema.parse(input);
  if (data.type === "TRANSFER" || data.expectedAmount > 9999999999.99 || Math.abs(data.expectedAmount * 100 - Math.round(data.expectedAmount * 100)) > 0.001) throw new Error("Movimiento inválido");
  if (data.frequency === "MONTHLY" && !data.dayOfMonth || data.frequency === "WEEKLY" && !data.dayOfWeek) throw new Error("Fecha incompleta");
  const userId = auth.session.userId;
  const [account, category] = await Promise.all([
    prisma.account.findFirst({ where: { id: data.accountId, userId }, select: { id: true } }),
    prisma.category.findFirst({ where: { id: data.categoryId, userId, type: data.type }, select: { id: true } }),
  ]);
  if (!account || !category) throw new Error("Cuenta o categoría inválida");
  await createRecurringTransaction({ ...data, userId });
}
