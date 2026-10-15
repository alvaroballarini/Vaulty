import { DayOfWeek, Frequency } from "@/generated/prisma/enums";
import { z } from "zod";

export const createRecurringTransactionSchema = z.object({
  accountId: z.string().cuid(),

  categoryId: z.string().cuid(),

  description: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria")
    .max(255),

  expectedAmount: z.coerce.number().positive("El monto debe ser mayor a 0"),

  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),

  frequency: z.nativeEnum(Frequency),

  dayOfWeek: z.nativeEnum(DayOfWeek).nullable().optional(),

  dayOfMonth: z.coerce
    .number()
    .int("El día debe ser un número entero")
    .min(1, "El día debe ser como mínimo 1")
    .max(31, "El día debe ser como máximo 31")
    .nullable()
    .optional(),

  isActive: z.boolean().default(true),
});

export type CreateRecurringTransactionInput = z.infer<
  typeof createRecurringTransactionSchema
>;

export const updateRecurringTransactionSchema = z.object({
  id: z.string().cuid(),

  accountId: z.string().cuid().optional(),

  categoryId: z.string().cuid().optional(),

  description: z
    .string()
    .trim()
    .min(1, "La descripción no puede estar vacía")
    .max(255)
    .optional(),

  expectedAmount: z.coerce
    .number()
    .positive("El monto debe ser mayor a 0")
    .optional(),

  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]).optional(),

  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).optional(),

  dayOfWeek: z
    .enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ])
    .nullable()
    .optional(),

  dayOfMonth: z.coerce
    .number()
    .int("El día debe ser un número entero")
    .min(1, "El día debe ser como mínimo 1")
    .max(31, "El día debe ser como máximo 31")
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
});

export type UpdateRecurringTransactionInput = z.infer<
  typeof updateRecurringTransactionSchema
>;

export const deleteRecurringTransactionSchema = z.object({
  id: z.string().cuid(),
});

export type DeleteRecurringTransactionInput = z.infer<
  typeof deleteRecurringTransactionSchema
>;
