import prisma from "@/lib/prisma";

function findUserByEmail(email: string) {
  if (!email) return;

  return prisma.user.findFirst({ where: { email: { equals: email.trim(), mode: "insensitive" } } });
}

export default findUserByEmail;
