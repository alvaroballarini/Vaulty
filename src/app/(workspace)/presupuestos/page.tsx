"use client";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceShell";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormDialog } from "@/components/ui/form-dialog";
import BudgetForm from "@/features/Budgets/components/BudgetsForm";
import { budgetProgress } from "@/features/dashboard/type";
import { money } from "@/features/dashboard/components/Overview";
export default function Page() {
  const { data, hidden } = useWorkspace();
  const [editing, setEditing] = useState<budgetProgress | "new" | null>(null);
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {data.budgetProgress.length} categorías con presupuesto
        </p>
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Definir presupuesto
        </Button>
      </div>
      <section className="vaulty-panel max-w-5xl p-5 sm:p-7">
        {!data.budgetProgress.length ? (
          <div className="py-8">
            <h2 className="text-lg font-medium">Dale un límite a tus gastos</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Elegí una categoría y cuánto querés destinarle este mes. El
              progreso se actualiza con tus movimientos.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {data.budgetProgress.map((budget) => (
              <li key={budget.categoryId} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium">{budget.categoryName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {money(budget.spent, hidden)} de{" "}
                      {money(budget.limit, hidden)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setEditing(budget)}
                    aria-label={"Editar presupuesto de " + budget.categoryName}
                  >
                    <Pencil className="size-4" />
                    <span className="hidden sm:inline">Editar límite</span>
                  </Button>
                </div>
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
                  role="progressbar"
                  aria-label={"Uso del presupuesto de " + budget.categoryName}
                  aria-valuenow={
                    hidden
                      ? undefined
                      : Math.min(100, Math.round(budget.percentage))
                  }
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={
                      budget.percentage >= 80
                        ? "h-full bg-amber-300"
                        : "h-full bg-primary"
                    }
                    style={{
                      width: hidden
                        ? "0%"
                        : Math.min(100, budget.percentage) + "%",
                    }}
                  />
                </div>
                <p
                  className={
                    "mt-2 text-xs " +
                    (budget.isOverBudget
                      ? "text-amber-200"
                      : "text-muted-foreground")
                  }
                >
                  {hidden
                    ? "Importes ocultos"
                    : budget.isOverBudget
                      ? "Superaste el límite por " +
                        money(budget.spent - budget.limit)
                      : money(budget.limit - budget.spent) +
                        " disponibles este mes"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <FormDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing === "new"
                ? "Definir presupuesto"
                : "Editar límite mensual"}
            </DialogTitle>
            <DialogDescription>
              Este cambio se aplica al mes actual.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <BudgetForm
              key={editing === "new" ? "new" : editing.categoryId}
              initialData={
                editing === "new"
                  ? undefined
                  : { categoryId: editing.categoryId, amount: editing.limit }
              }
              close={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </FormDialog>
    </>
  );
}
