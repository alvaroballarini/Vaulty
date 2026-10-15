import { NextResponse } from "next/server";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import prisma from "@/lib/prisma";
export async function GET() {
  const auth = await getCurrentUser();
  if (!auth.authenticated)
    return NextResponse.json({ message: "Sesión vencida" }, { status: 401 });
  const items = await prisma.recurringTransaction.findMany({
    where: { userId: auth.session.userId },
    include: {
      account: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: [{ isActive: "desc" }, { nextRunAt: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(
    items.map((item) => ({
      ...item,
      expectedAmount: Number(item.expectedAmount),
    })),
  );
}
