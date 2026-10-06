"use server";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import { CreateBudgetInput, createBudgetSchema } from "../types/schemaBudgets";
import prisma from "@/lib/prisma";
export default async function createBudgetService(input: CreateBudgetInput) {
  const auth = await getCurrentUser();
  if (!auth.authenticated) throw new Error("Sesión vencida");
  const { categoryId, amount, month, year } = createBudgetSchema.parse(input);
  if (
    amount > 9999999999.99 ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > 0.001
  )
    throw new Error("Monto inválido");
  const userId = auth.session.userId;
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId, type: "EXPENSE" },
    select: { id: true },
  });
  if (!category) throw new Error("Categoría inválida");
  await prisma.budget.upsert({
    where: {
      userId_categoryId_year_month: { userId, categoryId, year, month },
    },
    create: { userId, categoryId, year, month, amount },
    update: { amount },
  });
}
