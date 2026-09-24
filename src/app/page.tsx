"use client";
import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { MoneyEvolutionChart } from "@/features/RecurringTransaction/components/MoneyEvolutionChart";
import { SalaryCard } from "@/features/RecurringTransaction/components/SalaryCard";
import { CategoryChart } from "@/features/categories/components/CategoryChart";
import { Budgets } from "@/features/Budgets/components/BudgetsLineChart";
import { BalanceCard } from "@/features/user/component/BalanceCard";
import { Goals } from "@/features/goals/components/GoalsLineChart";
import { UnauthorizedError } from "@/features/auth/types/authType";
import getDashboardHistory from "@/hooks/getDashboardHistory";
import { StatCards } from "@/components/statCards";
import { useQuery } from "@tanstack/react-query";
import getDashboard from "@/hooks/getDashboard";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { transactionType } from "@/features/transactions/types/type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";
import { RecurringTransactionForm } from "@/features/transactions/components/RecurringTransactionForm";
type DialogType = "transaction" | "recurring" | null;

export default function Page() {
  const router = useRouter();

  const {
    data: dashboard,
    isLoading: isLoadingDashboard,
    error: queryError,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    staleTime: 20,
  });
  const {
    data: dashboardTest,
  } = useQuery({
    queryKey: ["dashboardTest"],
    queryFn: getDashboardHistory,
    staleTime: 20,
  });
  useEffect(() => {
    if (queryError instanceof UnauthorizedError) {
      router.replace("/login");
    }
  }, [queryError, router]);
  const onEdit = (data: transactionType) => {
    console.log(data);
    setDialogType("transaction");
  };
  // console.log(dashboard);
  const [dialogType, setDialogType] = useState<DialogType>(null);

  const isOpen = dialogType !== null;
  const close = () => {
    setDialogType(null);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 px-5 py-6 md:px-8">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {/* Columna principal */}
            <div className="flex flex-col gap-5 xl:col-span-2">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <BalanceCard
                  balance={dashboard?.totalBalance}
                  prevBalance={dashboard?.totalPrevBalance}
                  isLoadingDashboard={isLoadingDashboard}
                />
                <SalaryCard
                  isLoading={isLoadingDashboard}
                  recurringTransaction={dashboard?.recurringTransaction}
                />
              </div>

              <StatCards data={dashboard?.metrics} />
              <MoneyEvolutionChart history={dashboardTest?.historyMonthly} />

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <CategoryChart />
                <Budgets
                  budgets={dashboard?.budgetProgress || []}
                  isLoading={isLoadingDashboard}
                />
              </div>
            </div>

            {/* Columna lateral */}
            <div className="flex flex-col gap-5">
              <RecentTransactions
                data={dashboard?.transactions}
                isLoadingData={isLoadingDashboard}
                onEdit={onEdit}
              />
              <Goals />
            </div>
          </div>
        </main>
      </div>
      <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "transaction"
                ? "Nueva transacción"
                : "Nueva transacción programada"}
            </DialogTitle>
          </DialogHeader>

          {dialogType === "transaction" && (
            <TransactionForm isOpen={isOpen} closeForm={close} />
          )}

          {dialogType === "recurring" && (
            <RecurringTransactionForm isOpen={isOpen} closeForm={close} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
