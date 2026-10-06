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
