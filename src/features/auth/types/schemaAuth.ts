import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Ingresá un correo válido.")),
  password: z.string().min(1, "Ingresá tu contraseña.").max(128),
  remember: z.boolean().optional(),
});

export type loginInput = z.infer<typeof loginSchema>;
