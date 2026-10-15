import { RecurringTransaction } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import calculateNextRun from "../hooks/calculateNextRun";

export async function processRecurringTransactions() {
  const now = new Date();

  const recurringTransactions = await prisma.recurringTransaction.findMany({
    where: {
      isActive: true,
      nextRunAt: {
        lte: now,
      },
    },
    take: 10,
    orderBy: [{ nextRunAt: "asc" }, { id: "asc" }],
  });

  let processed = 0;
  let failed = 0;
  for (const recurring of recurringTransactions) {
    try {
      if (await processRecurringTransaction(recurring)) processed++;
    } catch (error) {
      failed++;

      console.error(`Failed recurring transaction ${recurring.id}`, error);
    }
  }

  return {
    found: recurringTransactions.length,
    processed,
    failed,
  };
}

async function processRecurringTransaction(recurring: RecurringTransaction) {
  return prisma.$transaction(async (tx) => {
    // Claim this exact occurrence before writing; concurrent runs and edits cannot duplicate it.
    const claimed = await tx.recurringTransaction.updateMany({
      where: {
        id: recurring.id,
        isActive: true,
        nextRunAt: recurring.nextRunAt,
        updatedAt: recurring.updatedAt,
      },
      data: {
        lastRunAt: recurring.nextRunAt,
        nextRunAt: calculateNextRun(recurring),
      },
    });
    if (claimed.count !== 1) return false;
    await tx.transaction.create({
      data: {
        userId: recurring.userId,
        accountId: recurring.accountId,
        categoryId: recurring.categoryId,
        description: recurring.description,
        amount: recurring.expectedAmount,
        date: recurring.nextRunAt!,
        type: recurring.type,
        recurringTransactionId: recurring.id,
      },
    });
    await tx.notification.create({
      data: {
        userId: recurring.userId,
        message: `Se registró el movimiento programado ${recurring.description}`,
        title: "Transacción programada",
        type: "RECURRING_DUE",
      },
    });

    return true;
  });
}
