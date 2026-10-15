import type { DayOfWeek, Frequency } from "@/generated/prisma/enums";
export interface ScheduledMovement {
  id: string;
  description: string;
  expectedAmount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  frequency: Frequency;
  dayOfMonth: number | null;
  dayOfWeek: DayOfWeek | null;
  nextRunAt: string | null;
  isActive: boolean;
  accountId: string;
  categoryId: string;
  account: { name: string };
  category: { name: string };
}
