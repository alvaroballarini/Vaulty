"use server";
import { APP_TIMEZONE, getLocalMonthBoundaries } from "@/lib/date-utils";
import { buildPaymentOutlook } from "@/lib/payment-outlook";
import prisma from "@/lib/prisma";
import getCurrentUser from "@/features/auth/service/getCurrentUser";
import invalidateSession from "@/features/auth/service/invalidateSession";
import { UnauthorizedError } from "@/features/auth/types/authType";
import getAllAccountsDb from "@/features/account/data/get";
import getAllCategoriesDb from "@/features/categories/data/get";
import getAllTransactionsDb from "@/features/transactions/data/get";

export async function getDashboardMetrics(date: Date = new Date()) {
  const auth = await getCurrentUser();
  if (!auth.authenticated) {
    if (
      auth.reason === "SESSION_EXPIRED" ||
      auth.reason === "SESSION_NOT_FOUND"
    ) {
      await invalidateSession();
    }
    throw new UnauthorizedError();
  }
  const userId = auth.session.userId;

  const {
    currentMonth,
    currentMonthStart,
    currentYear,
    prevMonthEnd,
    prevMonthStart,
  } = getLocalMonthBoundaries(date);
  // 🚀 TODO EN PARALELO: Únicamente consultas livianas e indexadas
  const [
    accounts,
    categories,
    recentTransactions,
    recurringSummary,
    globalTransactions,
    prevGlobalTransactions,
    currentMonthTransactions,
    prevMonthTransactions,
    currentMonthExpensesByCategory,
    budgets,
    user,
    accountTotals,
  ] = await Promise.all([
    getAllAccountsDb({ userId }),
    getAllCategoriesDb({ userId }),
    getAllTransactionsDb({ userId, limit: 10 }), // 💡 Recuerda agregar limit/take en este servicio
    getRecurringSummary(userId),

    // A. Saldo Total Histórico (acumulado hasta la fecha)
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { lte: date } },
      _sum: { amount: true },
    }),

    // B. Saldo acumulado al cierre del mes anterior
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: { lte: prevMonthEnd },
      },
      _sum: { amount: true },
    }),

    // C. Ingresos y Gastos del Mes Actual
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: { gte: currentMonthStart, lte: date },
      },
      _sum: { amount: true },
    }),

    // D. Ingresos y Gastos del Mes Anterior (para cálculo de % de variación)
    prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: { gte: prevMonthStart, lte: prevMonthEnd },
      },
      _sum: { amount: true },
    }),

    // E. Gastos por categoría del mes actual (para los presupuestos)
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: currentMonthStart, lte: date },
      },
      _sum: { amount: true },
    }),

    // F. Presupuestos del mes
    prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear },
      include: { category: true },
    }),
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, productTourSeenAt: true },
    }),
    prisma.transaction.groupBy({
      by: ["accountId", "type"],
      where: { userId, date: { lte: date } },
      _sum: { amount: true },
    }),
  ]);

  // --- CÁLCULOS Y PROCESAMIENTO ---
  // Totales Mes Actual
  const currentIncome = getAmount(currentMonthTransactions, "INCOME");
  const currentExpense = getAmount(currentMonthTransactions, "EXPENSE");
  const currentSavings = currentIncome - currentExpense;

  // Totales Mes Anterior
  const prevIncome = getAmount(prevMonthTransactions, "INCOME");
  const prevExpense = getAmount(prevMonthTransactions, "EXPENSE");
  const prevSavings = prevIncome - prevExpense;

  // Totales Globales
  const totalIncome = getAmount(globalTransactions, "INCOME");
  const totalExpense = getAmount(globalTransactions, "EXPENSE");
  const totalBalance = totalIncome - totalExpense;

  const totalPrevIncome = getAmount(prevGlobalTransactions, "INCOME");
  const totalPrevExpense = getAmount(prevGlobalTransactions, "EXPENSE");
  const totalPrevBalance = totalPrevIncome - totalPrevExpense;

  // Cálculo de Presupuestos
  let totalBudgetLimit = 0;
  let totalBudgetSpent = 0;
  const budgetProgress = budgets.map((budget) => {
    const spentInDB = currentMonthExpensesByCategory.find(
      (t) => t.categoryId === budget.categoryId,
    );
    const spentAmount = spentInDB?._sum.amount?.toNumber() || 0;
    const budgetLimit = budget.amount.toNumber();

    totalBudgetLimit += budgetLimit;
    totalBudgetSpent += spentAmount;

    return {
      categoryId: budget.categoryId,
      categoryName: budget.category.name,
      limit: budgetLimit,
      spent: spentAmount,
      percentage: budgetLimit > 0 ? (spentAmount / budgetLimit) * 100 : 0,
      isOverBudget: spentAmount > budgetLimit,
    };
  });

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number(
      (((current - previous) / Math.abs(previous)) * 100).toFixed(1),
    );
  };

  return {
    metrics: {
      income: {
        amount: currentIncome,
        percentageChange: calculateChange(currentIncome, prevIncome),
        periodLabel: "Este mes",
      },
      expense: {
        amount: currentExpense,
        percentageChange: calculateChange(currentExpense, prevExpense),
        periodLabel: "Este mes",
      },
      savings: {
        amount: currentSavings,
        percentageChange: calculateChange(currentSavings, prevSavings),
        periodLabel: "Este mes",
      },
      budget: {
        percentageUsed:
          totalBudgetLimit > 0
            ? Number(((totalBudgetSpent / totalBudgetLimit) * 100).toFixed(0))
            : 0,
        totalBudget: totalBudgetLimit,
        freeBudget: totalBudgetLimit - totalBudgetSpent,
        spentBudget: totalBudgetSpent,
      },
    },
    monthlySavings: currentSavings,
    totalPrevBalance,
    totalBalance,
    totalIncome,
    totalExpense,
    recurringTransaction: recurringSummary,
    budgetProgress,
    user,
    asOf: date.toISOString(),
    paymentOutlook: buildPaymentOutlook(
      recurringSummary.transactions,
      totalBalance,
      date,
    ),
    transactions: recentTransactions.map((item) => ({
      ...item,
      amount: Number(item.amount),
    })),
    categories,
    accounts: accounts.map((account) => ({
      ...account,
      balance: accountTotals
        .filter((item) => item.accountId === account.id)
        .reduce(
          (sum, item) =>
            sum +
            (item.type === "INCOME"
              ? Number(item._sum.amount)
              : item.type === "EXPENSE"
                ? -Number(item._sum.amount)
                : 0),
          0,
        ),
    })),
  };
}
async function getRecurringSummary(userId: string) {
  // 1. Obtener todas las transacciones recurrentes activas del usuario
  const recurringTransactions = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, color: true } },
    },
    orderBy: {
      dayOfMonth: "asc",
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  let nextIncomePayday: Date | null = null;

  // 2. Mapear y calcular los totales
  const formattedTransactions = recurringTransactions.map((item) => {
    const amount = Number(item.expectedAmount); // Convertir Decimal a Number
    const nextPayday = item.nextRunAt;
    if (item.type === "INCOME") {
      totalIncome += amount;

      // Guardar la fecha de cobro de sueldo/ingreso más cercana en el futuro
      if (nextPayday && (!nextIncomePayday || nextPayday < nextIncomePayday)) {
        nextIncomePayday = nextPayday;
      }
    } else if (item.type === "EXPENSE") {
      totalExpense += amount;
    }

    return {
      ...item,
      expectedAmount: amount,
      nextPayday,
    };
  });

  // 3. Sueldo neto = Total Ingresos - Total Gastos
  const sueldoNeto = totalIncome - totalExpense;

  return {
    summary: {
      sueldoNeto,
      totalIncome,
      totalExpense,
      nextPayday: nextIncomePayday, // Próxima fecha global en que ingresa dinero
    },
    transactions: formattedTransactions,
  };
}

export const getDashboardHistory = async () => {
  const auth = await getCurrentUser();
  if (!auth.authenticated) {
    if (
      auth.reason === "SESSION_EXPIRED" ||
      auth.reason === "SESSION_NOT_FOUND"
    ) {
      await invalidateSession();
    }
    throw new UnauthorizedError();
  }

  const userId = auth.session.userId;
  const date = new Date();
  const { currentYear, currentMonth, historyStartDate } =
    getLocalMonthBoundaries(date);
  const [globalTransactions, monthlyHistoryRaw] = await Promise.all([
    // A. Saldo Total Histórico
    prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, date: { lte: date } },
      _sum: { amount: true },
    }), // E. Totales mensuales (Sirve para gráfico histórico Y para extraer datos de mes actual/anterior)
    prisma.$queryRaw<{ monthKey: string; type: string; total: number }[]>`
      SELECT 
  TO_CHAR("date" AT TIME ZONE 'UTC' AT TIME ZONE ${APP_TIMEZONE}, 'YYYY-MM') as "monthKey",
  "type",
  SUM("amount")::float as total
FROM "Transaction"
WHERE "userId" = ${userId}
  AND "date" >= ${historyStartDate}
  AND "date" <= ${date}
GROUP BY 1, 2
ORDER BY 1 ASC
    `,
  ]);

  const monthlyMap = new Map<string, { income: number; expense: number }>();
  monthlyHistoryRaw.forEach((row) => {
    const monthKey = row.monthKey;
    const current = monthlyMap.get(monthKey) || { income: 0, expense: 0 };

    if (row.type === "INCOME") current.income += Number(row.total);
    if (row.type === "EXPENSE") current.expense += Number(row.total);

    monthlyMap.set(monthKey, current);
  });
  const totalIncome = getAmount(globalTransactions, "INCOME");
  const totalExpense = getAmount(globalTransactions, "EXPENSE");
  const totalBalance = totalIncome - totalExpense;

  const last36MonthsHistory = [];
  let runningBalance = totalBalance;

  for (let i = 0; i < 36; i++) {
    const targetDate = new Date(Date.UTC(currentYear, currentMonth - 1 - i, 1));
    const monthKey = targetDate.toISOString().slice(0, 7);
    const monthLabel = new Intl.DateTimeFormat("es-AR", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(targetDate);

    const monthData = monthlyMap.get(monthKey) || { income: 0, expense: 0 };
    const netChange = monthData.income - monthData.expense;

    last36MonthsHistory.unshift({
      monthKey,
      label: monthLabel,
      income: monthData.income,
      expense: monthData.expense,
      netChange,
      accumulatedBalance: Number(runningBalance.toFixed(2)),
    });

    runningBalance -= netChange;
  }
  return {
    historyMonthly: {
      last6Months: last36MonthsHistory.slice(-6),
      lastYear: last36MonthsHistory.slice(-12),
      last3Years: last36MonthsHistory,
    },
  };
};

const getAmount = (arr: TransactionGroupByResult[], type: string) =>
  arr.find((t) => t.type === type)?._sum.amount?.toNumber() || 0;
type TransactionGroupByResult = {
  type: string;
  _sum: { amount?: { toNumber: () => number } | null };
};
