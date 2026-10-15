import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  CreditCard,
  Info,
  Landmark,
  Wallet,
} from "lucide-react";
import { DashboardType } from "../type";
import { cn } from "@/lib/utils";
import { PaymentOutlook } from "@/lib/payment-outlook";
import { APP_TIMEZONE } from "@/lib/date-utils";

export function money(value: number, hidden = false) {
  return hidden
    ? "••••••"
    : new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
}
export function Overview({
  data,
  hidden,
  onAccounts,
}: {
  data: DashboardType;
  hidden: boolean;
  onAccounts: () => void;
}) {
  const metrics = [
    {
      label: "Ingresos",
      value: data.metrics.income.amount,
      Icon: ArrowUp,
      color: "text-primary bg-primary/15",
    },
    {
      label: "Gastos",
      value: data.metrics.expense.amount,
      Icon: ArrowDown,
      color: "text-destructive bg-destructive/15",
    },
    {
      label: "Balance del mes",
      value: data.metrics.savings.amount,
      Icon: ChartNoAxesColumnIncreasing,
      color: "text-primary bg-primary/15",
    },
  ];
  return (
    <section
      className="vaulty-panel h-full min-w-0 p-4 sm:p-6"
      aria-labelledby="balance-title"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id="balance-title" className="text-sm font-medium sm:text-base">
          Saldo en tus cuentas
        </h2>
        <span className="text-xs tracking-wider text-muted-foreground">
          ARS
        </span>
      </div>
      <p className="vaulty-number mt-2 break-all text-[clamp(2rem,3.6vw,3.4rem)] font-semibold leading-tight">
        {money(data.totalBalance, hidden)}
      </p>
      <button
        onClick={onAccounts}
        className="mt-5 grid w-full grid-cols-3 gap-2 text-left"
        aria-label="Ver todas mis cuentas"
      >
        {data.accounts.slice(0, 3).map((account) => {
          const Icon =
            account.type === "CASH"
              ? Banknote
              : account.type === "CREDIT"
                ? CreditCard
                : Landmark;
          return (
            <span
              key={account.id}
              className="min-w-0 border-r border-border pr-2 last:border-0 sm:px-2"
            >
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="hidden size-4 shrink-0 sm:block" />
                <span className="truncate">{account.name}</span>
              </span>
              <span className="vaulty-number mt-1.5 block truncate text-xs font-medium sm:text-base">
                {money(account.balance ?? 0, hidden)}
              </span>
            </span>
          );
        })}
        {!data.accounts.length && (
          <span className="col-span-3 flex items-center gap-2 text-sm text-primary">
            Agregá tu primera cuenta <ChevronRight className="size-4" />
          </span>
        )}
      </button>
      {data.accounts.length > 3 && (
        <button
          onClick={onAccounts}
          className="mt-2 min-h-11 text-xs text-primary"
        >
          Ver las {data.accounts.length} cuentas
        </button>
      )}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-5">
        {metrics.map(({ label, value, Icon, color }) => (
          <div
            key={label}
            className="flex min-w-0 flex-col gap-2 xl:flex-row xl:items-center"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                color,
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground sm:text-xs">
                {label}
              </p>
              <p
                className={cn(
                  "vaulty-number mt-1 break-all text-sm font-semibold sm:text-base",
                  label === "Balance del mes" &&
                    (value < 0 ? "text-destructive" : "text-primary"),
                )}
              >
                {money(value, hidden)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Saldos según movimientos registrados · Ingresos y gastos de este mes
      </p>
    </section>
  );
}
export function PaymentEstimate({
  outlook,
  hidden,
}: {
  outlook: PaymentOutlook;
  hidden: boolean;
}) {
  const through = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    timeZone: APP_TIMEZONE,
  }).format(new Date(outlook.through + "T12:00:00Z"));
  return (
    <section
      className="h-full rounded-xl border border-primary/25 bg-primary/[0.055] p-4"
      aria-label="Estimación después de pagos"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wallet className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm">Disponible tras pagos</p>
          <p
            className={cn(
              "vaulty-number mt-1 text-xl font-semibold sm:text-2xl",
              outlook.afterPayments !== null &&
                outlook.afterPayments < 0 &&
                "text-destructive",
            )}
          >
            {outlook.afterPayments === null
              ? "Revisá vencimientos"
              : money(outlook.afterPayments, hidden)}
          </p>
        </div>
      </div>
      <details className="mt-2 text-xs text-muted-foreground">
        <summary className="flex min-h-7 cursor-pointer list-none items-center gap-1.5">
          <Info className="size-3.5" />
          Estimado hasta el {through}
        </summary>
        <p className="mt-2 leading-relaxed">
          {outlook.needsReview
            ? "Hay movimientos programados con fechas pendientes o vencidas. La estimación estará disponible cuando estén actualizados."
            : "Saldo registrado menos gastos programados de los próximos 14 días. No incluye ingresos futuros, gastos no programados ni pagos sin registrar."}
        </p>
      </details>
      {outlook.needsReview && (
        <Link
          href="/planificacion"
          className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
        >
          Revisar planificación
        </Link>
      )}
    </section>
  );
}
