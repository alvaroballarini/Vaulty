"use client";

import { useId, useRef, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, LoaderCircle, Plus, Wallet } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { toast } from "sonner";
import getCategories from "@/features/categories/hooks/getCategories";
import getAccounts from "@/features/account/hook/getAccount";
import CategoryFormPopover from "@/features/categories/components/CategoryFormPopover";
import { saveTransaction } from "../service/saveTransaction";
import { parseMoneyInput, formatMoneyInput } from "@/lib/money";
import { APP_TIMEZONE } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type TxType = "EXPENSE" | "INCOME";
export interface TransactionType {
  id: string; amount: number; date: Date | string; type: TxType;
  accountId?: string; categoryId?: string | null; description?: string | null;
}
interface Props {
  isOpen: boolean;
  closeForm?: () => void;
  initialData?: TransactionType | null;
  inline?: boolean;
  preferenceKey?: string;
}

export function TransactionForm({ isOpen, closeForm, initialData, inline = false, preferenceKey }: Props) {
  const queryClient = useQueryClient();
  const prefix = useId();
  const amountRef = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);
  const { data: categories = [], isLoading: loadingCategories, isError: categoryError, refetch: reloadCategories } = useQuery({
    queryKey: ["category"], queryFn: getCategories, staleTime: 60_000, enabled: isOpen,
  });
  const { data: accounts = [], isLoading: loadingAccounts, isError: accountError, refetch: reloadAccounts } = useQuery({
    queryKey: ["account"], queryFn: getAccounts, staleTime: 60_000, enabled: isOpen,
  });
  const [type, setType] = useState<TxType>(initialData?.type ?? "EXPENSE");
  const [amount, setAmount] = useState(initialData ? formatMoneyInput(Number(initialData.amount)) : "");
  const [category, setCategory] = useState(initialData?.categoryId ?? "");
  const [account, setAccount] = useState(() => {
    if (initialData?.accountId) return initialData.accountId;
    try { return preferenceKey && typeof window !== "undefined" ? localStorage.getItem(preferenceKey) ?? "" : ""; } catch { return ""; }
  });
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [dateMode, setDateMode] = useState(initialData ? "custom" : "today");
  const [date, setDate] = useState(initialData ? formatInTimeZone(new Date(initialData.date), APP_TIMEZONE, "yyyy-MM-dd") : "");
  const [showNote, setShowNote] = useState(Boolean(initialData?.description));
  const [showAll, setShowAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const accountId = accounts.some((item) => item.id === account) ? account : accounts[0]?.id ?? "";
  const options = categories.filter((item) => item.type === type);
  const visibleCategories = showAll ? options : options.slice(0, 3);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError(null);
    const value = parseMoneyInput(amount);
    if (value === null) { setError("Ingresá un monto válido, por ejemplo 18.500,50."); amountRef.current?.focus(); return; }
    if (!accountId) { setError("Necesitás una cuenta para registrar el movimiento."); return; }
    const categoryId = options.some((item) => item.id === category) ? category : null;
    if (!categoryId) { setError("Elegí una categoría para organizar este movimiento."); return; }
    if (dateMode === "custom" && !date) { setError("Elegí la fecha del movimiento."); return; }
    const now = new Date();
    const movementDate = dateMode === "today" ? now : dateMode === "yesterday"
      ? fromZonedTime(formatInTimeZone(new Date(now.getTime() - 86400000), APP_TIMEZONE, "yyyy-MM-dd") + "T12:00:00", APP_TIMEZONE)
      : initialData && date === formatInTimeZone(new Date(initialData.date), APP_TIMEZONE, "yyyy-MM-dd")
        ? new Date(initialData.date) : fromZonedTime(date + "T12:00:00", APP_TIMEZONE);
    submitting.current = true;
    setSaving(true);
    try {
      const result = await saveTransaction({ id: initialData?.id, amount: value, type, accountId, categoryId, description, date: movementDate });
      if (!result.ok) { setError(result.error); return; }
      try { if (preferenceKey) localStorage.setItem(preferenceKey, accountId); } catch { /* Optional preference storage. */ }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboardTest"] }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
      toast.success(initialData ? "Movimiento actualizado" : "Movimiento guardado");
      setAmount(""); setDescription(""); setShowNote(false); setDateMode("today"); setDate("");
      if (inline) amountRef.current?.focus(); else closeForm?.();
    } catch { setError("No pudimos confirmar el guardado. Revisá los últimos movimientos antes de reintentar."); }
    finally { submitting.current = false; setSaving(false); }
  }

  if (!isOpen) return null;
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" aria-label={initialData ? "Editar movimiento" : "Registro rápido"}>
      <fieldset disabled={saving} className="flex min-w-0 flex-col gap-3.5 disabled:opacity-70">
        <legend className="sr-only">Datos del movimiento</legend>
        <div className="grid grid-cols-2 rounded-lg border border-border bg-background/50 p-1">
          {([{ key: "EXPENSE", label: "Gasto", Icon: ArrowDownLeft }, { key: "INCOME", label: "Ingreso", Icon: ArrowUpRight }] as const).map(({ key, label, Icon }) => (
            <button key={key} type="button" aria-pressed={type === key} onClick={() => { setType(key); setCategory(""); setError(null); }}
              className={cn("flex min-h-10 items-center justify-center gap-2 rounded-md border text-sm transition-colors", type === key ? "border-primary/70 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              <Icon className="size-4" />{label}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor={prefix + "-amount"} className="mb-1.5 block text-xs text-muted-foreground">Monto · ARS</label>
          <div className="flex items-center rounded-lg border border-input bg-background/50 px-3 focus-within:border-primary">
            <span className="text-3xl font-semibold" aria-hidden="true">$</span>
            <input id={prefix + "-amount"} ref={amountRef} inputMode="decimal" autoComplete="off" maxLength={20}
              value={amount} placeholder="0" aria-describedby={error ? prefix + "-error" : undefined}
              onChange={(event) => { setAmount(event.target.value); setError(null); }}
              onBlur={() => { const value = parseMoneyInput(amount); if (value !== null) setAmount(formatMoneyInput(value)); }}
              className="vaulty-number h-14 w-full min-w-0 bg-transparent px-2 text-[32px] font-semibold outline-none placeholder:text-muted-foreground/60" />
          </div>
        </div>
        {(categoryError || accountError) ? (
          <div role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm">
            No pudimos cargar tus cuentas o categorías.
            <button type="button" className="mt-2 block text-primary underline" onClick={() => { void reloadCategories(); void reloadAccounts(); }}>Reintentar</button>
          </div>
        ) : (
          <>
            <div role="group" aria-label="Categoría" className="flex flex-wrap gap-2">
              {loadingCategories ? <span className="text-sm text-muted-foreground">Cargando categorías…</span> : visibleCategories.map((item) => (
                <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setError(null); }}
                  className={cn("flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm", category === item.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/30 text-muted-foreground hover:border-primary/50")}>
                  {category === item.id && <Check className="size-3.5" />}{item.name}
                </button>
              ))}
              {options.length > 3 && <button type="button" aria-expanded={showAll} onClick={() => setShowAll(!showAll)} className="min-h-11 rounded-lg border border-border px-3 text-xs text-muted-foreground">{showAll ? "Menos" : "Más"}</button>}
              <CategoryFormPopover type={type} buttonVariant="outline" />
              {!loadingCategories && options.length === 0 && <p className="w-full text-xs text-muted-foreground">Creá tu primera categoría con el botón +.</p>}
            </div>
            <div className="relative">
              <label htmlFor={prefix + "-account"} className="sr-only">Cuenta</label>
              <Wallet className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <select id={prefix + "-account"} value={accountId} onChange={(event) => setAccount(event.target.value)} className="vaulty-input appearance-none pl-10 pr-9 text-sm" disabled={loadingAccounts || accounts.length === 0}>
                {accounts.length === 0 && <option value="">{loadingAccounts ? "Cargando cuentas…" : "No hay cuentas disponibles"}</option>}
                {accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-muted-foreground" />
            </div>
          </>
        )}
        <div className="relative">
          <label htmlFor={prefix + "-day"} className="sr-only">Fecha</label>
          <CalendarDays className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <select id={prefix + "-day"} value={dateMode} onChange={(event) => setDateMode(event.target.value)} className="vaulty-input appearance-none pl-10 pr-9 text-sm">
            <option value="today">Hoy</option><option value="yesterday">Ayer</option><option value="custom">Otra fecha</option>
          </select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-muted-foreground" />
        </div>
        {dateMode === "custom" && <label className="text-xs text-muted-foreground">Fecha del movimiento<input type="date" className="vaulty-input mt-1 text-sm" value={date} onChange={(event) => setDate(event.target.value)} required /></label>}
        {showNote ? <label className="text-xs text-muted-foreground">Nota (opcional)<input autoComplete="off" maxLength={255} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej. Compra del supermercado" className="vaulty-input mt-1 text-sm" /></label>
          : <button type="button" onClick={() => setShowNote(true)} className="flex min-h-9 items-center gap-1.5 text-left text-xs text-muted-foreground hover:text-primary"><Plus className="size-3.5" />Agregar nota (opcional)</button>}
        {error && <p id={prefix + "-error"} role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving || loadingAccounts || loadingCategories || accountError || categoryError || !accounts.length} className="h-12 w-full rounded-lg text-sm font-semibold hover:bg-primary/90">
          {saving && <LoaderCircle className="mr-2 size-4 animate-spin" />}{saving ? "Guardando…" : initialData ? "Guardar cambios" : type === "EXPENSE" ? "Guardar gasto" : "Guardar ingreso"}
        </Button>
        {!inline && <button type="button" onClick={closeForm} className="min-h-9 text-sm text-muted-foreground">Cancelar</button>}
      </fieldset>
    </form>
  );
}
