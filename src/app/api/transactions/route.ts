import { NextRequest, NextResponse } from "next/server";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import prisma from "@/lib/prisma";
import { transactionFilters } from "@/features/transactions/service/transactionFilters";
export async function GET(request: NextRequest) {
  const auth = await getCurrentUser();
  if (!auth.authenticated)
    return NextResponse.json({ message: "Sesión vencida" }, { status: 401 });
  const { where, page, pageSize } = transactionFilters(
    request.nextUrl.searchParams,
    auth.session.userId,
  );
  const [items, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: {
        account: { select: { id: true, name: true } },
        category: true,
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);
  return NextResponse.json({
    items: items.map((item) => ({ ...item, amount: Number(item.amount) })),
    total,
    page,
    pageSize,
  });
}
