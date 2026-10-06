"use client";
import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { EyeOff, ChartNoAxesCombined } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { historyMonthly } from "@/features/dashboard/type";
import { money } from "@/features/dashboard/components/Overview";
const chartConfig = { balance: { label: "Saldo", color: "var(--primary)" } } satisfies ChartConfig;
export interface MonthlyHistory { monthKey: string; label: string; income: number; expense: number; netChange: number; accumulatedBalance: number; }
export function MoneyEvolutionChart({ history, hidden = false, loading = false, error = false, onRetry }: { history?: historyMonthly; hidden?: boolean; loading?: boolean; error?: boolean; onRetry?: () => void }) {
  const [range, setRange] = useState<"6M" | "1A">("6M");
  const gradientId = useId().replaceAll(":", "");
  const items = (range === "6M" ? history?.last6Months : history?.lastYear) ?? [];
  const data = items.map((item) => ({ month: item.label.split(" ")[0], balance: item.accumulatedBalance }));
  const empty = items.every((item) => item.income === 0 && item.expense === 0 && item.accumulatedBalance === 0);
  return <section className="vaulty-panel h-full min-w-0 p-4 sm:p-5" aria-labelledby="evolution-title">
    <div className="flex items-center justify-between gap-2"><div><h2 id="evolution-title" className="text-sm font-semibold sm:text-base">Evolución del saldo</h2><p className="mt-1 text-[11px] text-muted-foreground">Saldo registrado al cierre de cada mes</p></div><div className="flex gap-1 rounded-lg border border-border p-1">{(["6M", "1A"] as const).map((value) => <button key={value} aria-label={value === "6M" ? "Últimos 6 meses" : "Último año"} aria-pressed={value === range} onClick={() => setRange(value)} className={cn("min-h-8 rounded-md px-3 text-xs", value === range ? "bg-primary/10 text-primary ring-1 ring-primary/40" : "text-muted-foreground")}>{value}</button>)}</div></div>
    {hidden || loading || error || empty ? <div className="flex h-[235px] flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">{hidden ? <><EyeOff className="size-6" />Los importes están ocultos</> : loading ? <span className="animate-pulse">Cargando tu evolución…</span> : error ? <><p>No pudimos cargar la evolución.</p><button className="min-h-10 text-primary underline" onClick={onRetry}>Reintentar</button></> : <><ChartNoAxesCombined className="size-7 text-primary/70" /><p>Tu historia financiera empieza acá.</p><p className="max-w-60 text-xs">Registrá movimientos para ver cómo cambia tu saldo.</p></>}</div> : <>
      <ChartContainer config={chartConfig} className="mt-5 h-[225px] w-full" aria-label="Gráfico del saldo acumulado en pesos argentinos">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 12, bottom: 0 }} accessibilityLayer>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickFormatter={(value) => new Intl.NumberFormat("es-AR", { notation: "compact", maximumFractionDigits: 1 }).format(value)} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => <span className="vaulty-number font-medium">{money(Number(value))}</span>} />} />
          <Area dataKey="balance" type="linear" stroke="var(--primary)" strokeWidth={2.5} fill={`url(#${gradientId})`} dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }} isAnimationActive={false} />
        </AreaChart>
      </ChartContainer>
      <details className="mt-3 text-xs text-muted-foreground"><summary className="cursor-pointer">Ver datos del gráfico</summary><ul className="mt-2 grid grid-cols-2 gap-2">{items.map((item) => <li key={item.monthKey}>{item.label}: {money(item.accumulatedBalance)}</li>)}</ul></details>
    </>}
  </section>;
}
