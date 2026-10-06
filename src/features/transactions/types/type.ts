import { TransactionType } from "@/generated/prisma/enums";

export interface transactionType {
  id: string;
  userId?: string;
  accountId?: string;
  categoryId?: string | null;
  recurringTransactionId?: string;
  amount: number;
  category: {
    name: string;
    color: string;
    icon: string;
  } | null;
  account?: { id: string; name: string };
  description: string | null;
  date: Date;
  type: TransactionType;
}
