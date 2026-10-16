import { TransactionType } from "@/generated/prisma/enums";
import { accountType } from "../account/type/type";
import { Category } from "../categories/type/type";
import { transactionType } from "../transactions/types/type";

export interface DashboardType {
  user: {
    id: string;
    name: string | null;
    email: string;
    productTourSeenAt: string | null;
  };
  asOf: string;
  paymentOutlook: import("@/lib/payment-outlook").PaymentOutlook;
  metrics: DashboardMetrics;
  transactions: transactionType[];
  categories: Category[];
  accounts: accountType[];
  totalBalance: number;
  totalPrevBalance: number;
  totalIncome: number;
  totalExpense: number;
  budgetProgress: budgetProgress[];
  recurringTransaction: salaryType;
  historyMonthly: historyMonthly;
}

export interface historyMonthly {
  last6Months: {
    monthKey: string;
    label: string;
    income: number;
    expense: number;
    netChange: number;
    accumulatedBalance: number;
  }[];
  lastYear: {
    monthKey: string;
    label: string;
    income: number;
    expense: number;
    netChange: number;
    accumulatedBalance: number;
  }[];
  last3Years: {
    monthKey: string;
    label: string;
    income: number;
    expense: number;
    netChange: number;
    accumulatedBalance: number;
  }[];
}

export interface budgetProgress {
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  percentage: number;
  isOverBudget: boolean;
}

export interface salaryType {
  summary: {
    sueldoNeto: number;
    totalIncome: number;
    totalExpense: number;
    nextPayday: Date;
  };
  transactions: recurringTransactionType[];
}

export interface recurringTransactionType {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string;
  description: string;
  expectedAmount: number;
  type: TransactionType;
  frequency: string;
  dayOfMonth: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface DashboardMetrics {
  income: MetricCard;
  expense: MetricCard;
  savings: MetricCard;
  budget: GlobalBudgetSummary;
}
export interface MetricCard {
  amount: number;
  percentageChange: number; // Ej: 12.4 representa +12,4%, -4.1 representa -4,1%
  periodLabel?: string; // Ej: "Este mes"
}

export interface GlobalBudgetSummary {
  percentageUsed: number; // Ej: 76 (%)
  totalBudget: number; // Ej: 4200
  freeBudget: number; // Ej: 1020
  spentBudget: number; // Ej: 3180
}
