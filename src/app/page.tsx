"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Zap } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Overview, PaymentEstimate, money } from "@/features/dashboard/components/Overview";
import { AccountsPanel } from "@/features/dashboard/components/AccountsPanel";
import { PlanningPanel } from "@/features/dashboard/components/PlanningPanel";
import { TransactionForm, TransactionType } from "@/features/transactions/components/TransactionForm";
import { RecurringTransactionForm } from "@/features/transactions/components/RecurringTransactionForm";
import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { MoneyEvolutionChart } from "@/features/RecurringTransaction/components/MoneyEvolutionChart";
import BudgetForm from "@/features/Budgets/components/BudgetsForm";
import { UnauthorizedError } from "@/features/auth/types/authType";
import getDashboard from "@/hooks/getDashboard";
import getDashboardHistory from "@/hooks/getDashboardHistory";

export default function Page() {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [panel, setPanel] = useState<"cuentas" | "presupuestos" | "recurring" | "edit" | null>(null);
  const [editing, setEditing] = useState<TransactionType | null>(null);
  const [newBudget, setNewBudget] = useState(false);
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard, staleTime: 30_000, retry: (count, error) => !(error instanceof UnauthorizedError) && count < 2 });
  const history = useQuery({ queryKey: ["dashboardTest"], queryFn: getDashboardHistory, staleTime: 30_000, enabled: Boolean(dashboard.data), retry: 1 });
  const data = dashboard.data;
  useEffect(() => { if (dashboard.error instanceof UnauthorizedError) router.replace("/login"); }, [dashboard.error, router]);
  function navigate(id: string) {
    if (id === "cuentas" || id === "presupuestos") { setNewBudget(false); setPanel(id); }
    else document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }
  function close() { setPanel(null); setEditing(null); setNewBudget(false); }
  return <div className="vaulty-shell flex text-foreground">
    <a href="#contenido" className="sr-only z-50 rounded bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>
    <Sidebar onNavigate={navigate} />
    <main id="contenido" className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:px-7 lg:pb-8 lg:pt-8 xl:px-8">
      <div id="inicio" className="vaulty-section mx-auto max-w-[1440px]">
        <Topbar user={data?.user} asOf={data?.asOf} hidden={hidden} onToggle={() => setHidden(!hidden)} />
        <h1 className="mb-4 text-xl font-semibold tracking-tight lg:hidden">Tu dinero, en perspectiva.</h1>
        {dashboard.isLoading ? <div role="status" aria-label="Cargando tu resumen" className="grid gap-4 md:grid-cols-2"><div className="vaulty-panel h-80 animate-pulse" /><div className="vaulty-panel h-80 animate-pulse" /><div className="vaulty-panel h-60 animate-pulse md:col-span-2" /><span className="sr-only">Cargando tu resumen…</span></div> : !data || dashboard.isError ? <section role="alert" className="vaulty-panel p-8 text-center"><h2 className="text-lg font-semibold">No pudimos cargar tu resumen</h2><p className="mt-2 text-sm text-muted-foreground">Comprobá tu conexión e intentá nuevamente.</p><Button className="mt-5" onClick={() => void dashboard.refetch()}>Reintentar</Button></section> : <div className="vaulty-dashboard-grid">
          <div className="min-w-0 [grid-area:overview]"><Overview data={data} hidden={hidden} onAccounts={() => setPanel("cuentas")} /></div>
          <div className="min-w-0 [grid-area:estimate]"><PaymentEstimate outlook={data.paymentOutlook} hidden={hidden} /></div>
          <section id="registro" className="vaulty-panel vaulty-section min-w-0 border-primary/30 p-4 [grid-area:entry] sm:p-5" aria-labelledby="quick-title"><div className="mb-4 flex items-center justify-between"><h2 id="quick-title" className="text-base font-semibold">Registro rápido</h2><Zap className="size-4 text-primary" /></div><TransactionForm key={data.user.id} preferenceKey={`vaulty:${data.user.id}:last-account`} isOpen inline />{!data.accounts.length && <button onClick={() => setPanel("cuentas")} className="mt-3 min-h-10 text-sm text-primary underline">Crear una cuenta para empezar</button>}</section>
          <div id="planificacion" className="vaulty-section min-w-0 [grid-area:planning]"><PlanningPanel data={data} hidden={hidden} onSchedule={() => setPanel("recurring")} onBudgets={() => { setNewBudget(false); setPanel("presupuestos"); }} /></div>
          <div className="min-w-0 [grid-area:chart]"><MoneyEvolutionChart history={history.data?.historyMonthly} hidden={hidden} loading={history.isLoading} error={history.isError} onRetry={() => void history.refetch()} /></div>
          <div id="movimientos" className="vaulty-section min-w-0 [grid-area:ledger]"><RecentTransactions data={data.transactions} hidden={hidden} onEdit={(item) => { if (item.type !== "TRANSFER") { setEditing({ ...item, type: item.type }); setPanel("edit"); } }} /></div>
        </div>}
      </div>
    </main>
    <Dialog open={Boolean(panel)} onOpenChange={(open) => { if (!open) close(); }}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{panel === "cuentas" ? "Tus cuentas" : panel === "presupuestos" ? "Presupuestos de este mes" : panel === "recurring" ? "Programar un movimiento" : "Editar movimiento"}</DialogTitle><DialogDescription>{panel === "recurring" ? "Organizá los pagos e ingresos que se repiten." : panel === "presupuestos" ? "Decidí cuánto destinar a cada categoría." : panel === "edit" ? "Revisá los datos antes de guardar." : "Tu dinero, organizado por cuenta."}</DialogDescription></DialogHeader>
      {panel === "cuentas" && data && <AccountsPanel accounts={data.accounts} hidden={hidden} />}
      {panel === "presupuestos" && data && <div><ul className="space-y-4">{data.budgetProgress.map((budget) => <li key={budget.categoryId}><div className="flex justify-between gap-2 text-sm"><span>{budget.categoryName}</span><span className="text-xs text-muted-foreground">{money(budget.spent, hidden)} / {money(budget.limit, hidden)}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary"><div className={budget.percentage >= 80 ? "h-full bg-amber-300" : "h-full bg-primary"} style={{ width: hidden ? "0%" : `${Math.min(100, budget.percentage)}%` }} /></div>{budget.isOverBudget && <p className="mt-1 text-xs text-amber-200">Límite superado</p>}</li>)}</ul>{!data.budgetProgress.length && <p className="text-sm text-muted-foreground">Todavía no definiste límites para este mes.</p>}{newBudget ? <BudgetForm close={() => setNewBudget(false)} /> : <Button variant="outline" className="mt-5" onClick={() => setNewBudget(true)}><Plus className="size-4" />Definir presupuesto</Button>}</div>}
      {panel === "recurring" && <RecurringTransactionForm isOpen closeForm={close} />}
      {panel === "edit" && editing && <TransactionForm key={editing.id} isOpen initialData={editing} closeForm={close} />}
    </DialogContent></Dialog>
  </div>;
}
