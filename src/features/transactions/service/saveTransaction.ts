"use server";

import prisma from "@/lib/prisma";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import { createTransactionSchema } from "../types/schemaTransactions";
import { z } from "zod";

const schema = createTransactionSchema.extend({
  id: z.string().cuid().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .number()
    .positive()
    .max(9999999999.99)
    .refine(
      (amount) => Math.abs(amount * 100 - Math.round(amount * 100)) < 0.001,
      "Usá como máximo dos decimales.",
    ),
});

export type SaveTransactionInput = z.infer<typeof schema>;
export type SaveTransactionResult =
  { ok: true; id: string } | { ok: false; error: string };

export async function saveTransaction(
  input: SaveTransactionInput,
): Promise<SaveTransactionResult> {
  const auth = await getCurrentUser();
  if (!auth.authenticated)
    return { ok: false, error: "Tu sesión venció. Volvé a iniciar sesión." };
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: "Revisá el monto, la fecha y los campos del movimiento.",
    };
  const { id, accountId, categoryId, amount, date, type, description } =
    parsed.data;
  const userId = auth.session.userId;
  try {
    const [account, category] = await Promise.all([
      prisma.account.findFirst({
        where: { id: accountId, userId },
        select: { id: true },
      }),
      categoryId
        ? prisma.category.findFirst({
            where: { id: categoryId, userId, type },
            select: { id: true },
          })
        : null,
    ]);
    if (!account) return { ok: false, error: "Seleccioná una cuenta válida." };
    if (categoryId && !category)
      return {
        ok: false,
        error: "La categoría no corresponde a este movimiento.",
      };
    const data = {
      accountId,
      categoryId: categoryId || null,
      amount,
      date,
      type,
      description: description || null,
    };
    if (id) {
      const result = await prisma.transaction.updateMany({
        where: { id, userId },
        data,
      });
      if (!result.count)
        return { ok: false, error: "El movimiento ya no está disponible." };
      return { ok: true, id };
    }
    const result = await prisma.transaction.create({
      data: { ...data, userId },
      select: { id: true },
    });
    return { ok: true, id: result.id };
  } catch {
    return {
      ok: false,
      error:
        "No se pudo guardar. Tus datos siguen en el formulario; intentá nuevamente.",
    };
  }
}
