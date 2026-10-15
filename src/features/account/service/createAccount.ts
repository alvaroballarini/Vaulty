"use server";
import prisma from "@/lib/prisma";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import { z } from "zod";
const schema = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(["BANK", "CASH", "CREDIT"]),
});
export async function createAccount(input: z.infer<typeof schema>) {
  const auth = await getCurrentUser();
  if (!auth.authenticated) throw new Error("Sesión vencida");
  const data = schema.parse(input);
  await prisma.account.create({
    data: { ...data, userId: auth.session.userId },
  });
}
export async function updateAccount(id: string, input: z.infer<typeof schema>) {
  const auth = await getCurrentUser();
  if (!auth.authenticated) throw new Error("Sesión vencida");
  z.string().cuid().parse(id);
  const data = schema.parse(input);
  const result = await prisma.account.updateMany({
    where: { id, userId: auth.session.userId },
    data,
  });
  if (result.count !== 1) throw new Error("Cuenta no encontrada");
}
