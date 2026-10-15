"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Zap } from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceShell";
import {
  Overview,
  PaymentEstimate,
} from "@/features/dashboard/components/Overview";
import { PlanningPanel } from "@/features/dashboard/components/PlanningPanel";
import {
  TransactionForm,
  TransactionType,
} from "@/features/transactions/components/TransactionForm";
import { EditTransactionDialog } from "@/features/transactions/components/EditTransactionDialog";
import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { MoneyEvolutionChart } from "@/features/RecurringTransaction/components/MoneyEvolutionChart";
import getDashboardHistory from "@/hooks/getDashboardHistory";
export default function Page() {
  const { data, hidden } = useWorkspace();
  const router = useRouter();
  const [editing, setEditing] = useState<TransactionType | null>(null);
  const history = useQuery({
    queryKey: ["dashboardTest"],
    queryFn: getDashboardHistory,
    staleTime: 30_000,
    retry: 1,
  });
  return (
    <>
      <div className="vaulty-dashboard-grid">
        <div className="min-w-0 [grid-area:overview]">
          <Overview
            data={data}
            hidden={hidden}
            onAccounts={() => router.push("/cuentas")}
          />
        </div>
        <div className="min-w-0 [grid-area:estimate]">
          <PaymentEstimate outlook={data.paymentOutlook} hidden={hidden} />
        </div>
        <section
          className="vaulty-panel min-w-0 border-primary/25 p-4 [grid-area:entry] sm:p-6"
          aria-labelledby="quick-title"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 id="quick-title" className="text-base font-semibold">
              Registro rápido
            </h2>
            <Zap className="size-4 text-primary" />
          </div>
          <TransactionForm
            key={data.user.id}
            preferenceKey={`vaulty:${data.user.id}:last-account`}
            isOpen
            inline
          />
          {!data.accounts.length && (
            <Link
              href="/cuentas"
              className="mt-3 inline-flex min-h-11 items-center text-sm text-primary underline"
            >
              Crear una cuenta para empezar
            </Link>
          )}
        </section>
        <div className="min-w-0 [grid-area:planning]">
          <PlanningPanel
            data={data}
            hidden={hidden}
            onSchedule={() => router.push("/planificacion")}
            onBudgets={() => router.push("/presupuestos")}
          />
        </div>
        <div className="min-w-0 [grid-area:chart]">
          <MoneyEvolutionChart
            history={history.data?.historyMonthly}
            hidden={hidden}
            loading={history.isLoading}
            error={history.isError}
            onRetry={() => void history.refetch()}
          />
        </div>
        <div className="min-w-0 [grid-area:ledger]">
          <RecentTransactions
            data={data.transactions}
            hidden={hidden}
            onEdit={(item) => {
              if (item.type !== "TRANSFER")
                setEditing({ ...item, type: item.type });
            }}
          />
          <Link
            href="/movimientos"
            className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm text-primary"
          >
            Ver todos los movimientos
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      <EditTransactionDialog item={editing} close={() => setEditing(null)} />
    </>
  );
}
