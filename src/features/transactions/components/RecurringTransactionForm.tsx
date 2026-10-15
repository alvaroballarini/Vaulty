"use client";
import { useState, useRef, useId } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useFormGuard } from "@/components/ui/form-dialog";
import getCategories from "@/features/categories/hooks/getCategories";
import getAccounts from "@/features/account/hook/getAccount";
import { saveSchedule } from "@/features/RecurringTransaction/service/manageRecurring";
import { ScheduledMovement } from "@/features/RecurringTransaction/types/management";
import { Frequency } from "@/generated/prisma/enums";
import { APP_TIMEZONE } from "@/lib/date-utils";
import { parseMoneyInput, formatMoneyInput } from "@/lib/money";
export function RecurringTransactionForm({
  isOpen,
  closeForm,
  initialData,
}: {
  isOpen: boolean;
  closeForm: () => void;
  initialData?: ScheduledMovement;
}) {
  const cache = useQueryClient();
  const id = useId();
  const guard = useRef(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const accounts = useQuery({
    queryKey: ["account"],
    queryFn: getAccounts,
    enabled: isOpen,
  });
  const categories = useQuery({
    queryKey: ["category"],
    queryFn: getCategories,
    enabled: isOpen,
  });
  const [type, setType] = useState<"INCOME" | "EXPENSE">(
    initialData?.type === "INCOME" ? "INCOME" : "EXPENSE",
  );
  const [amount, setAmount] = useState(
    initialData ? formatMoneyInput(initialData.expectedAmount) : "",
  );
  const [accountId, setAccount] = useState(initialData?.accountId ?? "");
  const [categoryId, setCategory] = useState(initialData?.categoryId ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [frequency, setFrequency] = useState<Frequency>(
    initialData?.frequency ?? "MONTHLY",
  );
  const [today] = useState(() => new Date());
  const tomorrow = formatInTimeZone(
    new Date(today.getTime() + 86400000),
    APP_TIMEZONE,
    "yyyy-MM-dd",
  );
  const [nextDate, setDate] = useState(
    initialData?.nextRunAt
      ? formatInTimeZone(
          new Date(initialData.nextRunAt),
          APP_TIMEZONE,
          "yyyy-MM-dd",
        )
      : tomorrow,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const snapshot = JSON.stringify({
    type,
    amount,
    accountId,
    categoryId,
    description,
    frequency,
    nextDate,
  });
  const [original] = useState(snapshot);
  const cancel = useFormGuard(snapshot !== original, busy);
  if (!isOpen) return null;
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (guard.current) return;
    const value = parseMoneyInput(amount);
    if (!value) {
      setError("Ingresá un monto válido mayor que cero.");
      amountRef.current?.focus();
      return;
    }
    guard.current = true;
    setBusy(true);
    setError("");
    try {
      await saveSchedule({
        id: initialData?.id,
        description,
        expectedAmount: value,
        type,
        frequency,
        accountId,
        categoryId,
        isActive: initialData?.isActive ?? true,
        nextDate,
      });
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["schedules"] }),
        cache.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      toast.success(
        initialData ? "Programación actualizada" : "Movimiento programado",
      );
      closeForm();
    } catch {
      setError(
        "No se pudo guardar. Elegí una fecha futura y revisá la cuenta, categoría y monto.",
      );
    } finally {
      guard.current = false;
      setBusy(false);
    }
  }
  const unavailable = accounts.isError || categories.isError;
  return (
    <form onSubmit={save} className="mt-2 space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(["EXPENSE", "INCOME"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={type === option ? "default" : "outline"}
              aria-pressed={type === option}
              onClick={() => {
                setType(option);
                setCategory("");
              }}
            >
              {option === "EXPENSE" ? "Gasto" : "Ingreso"}
            </Button>
          ))}
        </div>
        <label className="block text-sm" htmlFor={id + "name"}>
          Concepto
          <input
            id={id + "name"}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            maxLength={255}
            placeholder="Ej. Alquiler"
            className="vaulty-input mt-2"
          />
        </label>
        <label className="block text-sm">
          Monto estimado · ARS
          <input
            inputMode="decimal"
            ref={amountRef}
            aria-invalid={Boolean(error) && !parseMoneyInput(amount)}
            aria-describedby={error ? id + "error" : undefined}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            placeholder="Ej. 250.000"
            className="vaulty-input mt-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Cuenta
            <select
              required
              className="vaulty-input mt-2"
              value={accountId}
              onChange={(event) => setAccount(event.target.value)}
            >
              <option value="">
                {accounts.isLoading ? "Cargando…" : "Elegí una cuenta"}
              </option>
              {accounts.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Categoría
            <select
              required
              className="vaulty-input mt-2"
              value={categoryId}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">
                {categories.isLoading ? "Cargando…" : "Elegí una categoría"}
              </option>
              {categories.data
                ?.filter((item) => item.type === type)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm">
            Repetir
            <select
              className="vaulty-input mt-2"
              value={frequency}
              onChange={(event) =>
                setFrequency(event.target.value as Frequency)
              }
            >
              <option value="MONTHLY">Cada mes</option>
              <option value="WEEKLY">Cada semana</option>
              <option value="DAILY">Cada día</option>
            </select>
          </label>
          <label className="text-sm">
            Próxima fecha
            <input
              type="date"
              required
              min={formatInTimeZone(today, APP_TIMEZONE, "yyyy-MM-dd")}
              className="vaulty-input mt-2"
              value={nextDate}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          La próxima fecha define el día de la repetición. En meses más cortos
          se usa el último día. Los movimientos se registran automáticamente a
          partir del mediodía, hora argentina. Pueden demorar en aparecer.
        </p>
        {initialData && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Cambiar la fecha reemplaza el próximo vencimiento pendiente. Los
            movimientos ya registrados se conservan.
          </p>
        )}
      </fieldset>
      {unavailable && (
        <div role="alert" className="vaulty-error">
          No pudimos cargar tus opciones.
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              void accounts.refetch();
              void categories.refetch();
            }}
          >
            Reintentar
          </Button>
        </div>
      )}
      {accounts.data?.length === 0 && (
        <Link href="/cuentas" className="text-sm text-primary underline">
          Creá una cuenta para programar movimientos
        </Link>
      )}
      {error && (
        <p id={id + "error"} role="alert" className="vaulty-error">
          {error}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={cancel ?? closeForm}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            busy || unavailable || accounts.isLoading || categories.isLoading
          }
        >
          {busy ? "Guardando…" : "Guardar programación"}
        </Button>
      </div>
    </form>
  );
}
