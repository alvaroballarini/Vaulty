import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Ingresá un correo válido.")),
  passwordHash: z.string().min(8, "Usá al menos 8 caracteres.").max(128, "Usá hasta 128 caracteres."),

  name: z.string().trim().min(2, "Ingresá al menos 2 caracteres.").max(100),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export const updateUserSchema = z.object({
  id: z.string().cuid(),

  email: z.email().optional(),

  name: z.string().trim().min(2).max(100).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export const deleteUserSchema = z.object({
  id: z.string().cuid(),
});

export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
