import { CalendarDays, ChevronRight, Plus, ChartPie } from "lucide-react";
import Link from "next/link";
import { DashboardType } from "../type";
import { money } from "./Overview";
import { APP_TIMEZONE } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
export function PlanningPanel({
  data,
  hidden,
  onSchedule,
  onBudgets,
}: {
  data: DashboardType;
  hidden: boolean;
  onSchedule: () => void;
  onBudgets: () => void;
}) {
  const outlook = data.paymentOutlook;
  const warning = [...data.budgetProgress].sort(
    (a, b) => b.percentage - a.percentage,
  )[0];
  return (
    <div className="flex h-full flex-col gap-3">
      <section
        data-tour="planning"
        className="vaulty-panel flex-1 p-4 sm:p-5"
        aria-labelledby="planning-title"
      >
        <div className="flex items-center justify-between gap-2">
          <h2
            id="planning-title"
            className="text-sm font-semibold sm:text-base"
          >
            Próximos pagos e ingresos
          </h2>
          <button
            onClick={onSchedule}
            aria-label="Programar un movimiento"
            className="flex size-11 items-center justify-center rounded-lg text-primary hover:bg-primary/10"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Próximos 14 días · Importes estimados
        </p>
        {outlook.needsReview && (
          <p
            role="status"
            className="my-3 rounded-lg bg-amber-400/10 p-2 text-xs text-amber-200"
          >
            Hay fechas vencidas o sin definir en tu planificación.
          </p>
        )}
        <ul className="max-h-56 overflow-y-auto">
          {outlook.upcoming.slice(0, 4).map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 border-t border-border/70 py-3"
            >
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {item.description || "Movimiento programado"}
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    item.overdue ? "text-amber-300" : "text-muted-foreground",
                  )}
                >
                  {item.overdue ? "Fecha pendiente · " : ""}
                  {new Intl.DateTimeFormat("es-AR", {
                    day: "numeric",
                    month: "short",
                    timeZone: APP_TIMEZONE,
                  }).format(new Date(item.date))}{" "}
                  · {item.type === "INCOME" ? "Ingreso" : "Gasto"}
                </p>
              </div>
              <span
                className={cn(
                  "vaulty-number shrink-0 text-xs font-medium",
                  item.type === "INCOME" ? "text-primary" : "text-destructive",
                )}
              >
                {hidden
                  ? "••••••"
                  : `${item.type === "INCOME" ? "+" : "−"}${money(item.amount)}`}
              </span>
            </li>
          ))}
        </ul>
        {!outlook.upcoming.length && (
          <div className="py-6 text-center">
            <CalendarDays className="mx-auto mb-2 size-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              No hay pagos previstos para estos días.
            </p>
            <button
              onClick={onSchedule}
              className="mt-2 min-h-9 text-xs text-primary"
            >
              Programar un movimiento
            </button>
          </div>
        )}
        {outlook.upcoming.length > 4 && (
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="cursor-pointer">
              Ver {outlook.upcoming.length - 4} más
            </summary>
            <ul className="mt-2 space-y-2">
              {outlook.upcoming.slice(4).map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.description} ·{" "}
                    {new Intl.DateTimeFormat("es-AR", {
                      day: "numeric",
                      month: "short",
                      timeZone: APP_TIMEZONE,
                    }).format(new Date(item.date))}
                  </span>
                  <span>
                    {hidden
                      ? "••••••"
                      : `${item.type === "INCOME" ? "+" : "−"}${money(item.amount)}`}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
        <Link
          href="/planificacion"
          className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm text-primary"
        >
          Gestionar planificación
          <ChevronRight className="size-4" />
        </Link>
      </section>
      <button
        data-tour="budgets"
        onClick={onBudgets}
        className={cn(
          "flex min-h-20 items-center gap-3 rounded-xl border p-4 text-left",
          warning && warning.percentage >= 80
            ? "border-amber-400/30 bg-amber-400/[0.07]"
            : "border-border bg-card",
        )}
      >
        <ChartPie
          className={cn(
            "size-5 shrink-0",
            warning && warning.percentage >= 80
              ? "text-amber-300"
              : "text-primary",
          )}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs">
            {warning
              ? `${warning.categoryName} · ${hidden ? "•••" : Math.round(warning.percentage) + "% utilizado"}`
              : "Dale un límite a tus gastos"}
          </span>
          {warning ? (
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-secondary">
              <span
                className={cn(
                  "block h-full rounded-full",
                  warning.percentage >= 80 ? "bg-amber-300" : "bg-primary",
                )}
                style={{
                  width: hidden
                    ? "0%"
                    : `${Math.min(100, warning.percentage)}%`,
                }}
              />
            </span>
          ) : (
            <span className="mt-1 block text-xs text-muted-foreground">
              Creá tu primer presupuesto mensual
            </span>
          )}
        </span>
        <span className="flex items-center text-xs text-amber-200">
          {warning ? "Revisar" : "Crear"}
          <ChevronRight className="size-4" />
        </span>
      </button>
    </div>
  );
}
