"use client";
import { useId, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import getCategories from "@/features/categories/hooks/getCategories";
import { Button } from "@/components/ui/button";
import { useFormGuard } from "@/components/ui/form-dialog";
import { getLocalMonthBoundaries } from "@/lib/date-utils";
import { parseMoneyInput, formatMoneyInput } from "@/lib/money";
import createBudgetService from "../service/createBudget";
export default function BudgetForm({
  close,
  initialData,
}: {
  close?: () => void;
  initialData?: { categoryId: string; amount: number };
}) {
  const id = useId();
  const amountRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const cache = useQueryClient();
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["category"], queryFn: getCategories });
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [limit, setLimit] = useState(
    initialData ? formatMoneyInput(initialData.amount) : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cancel = useFormGuard(
    categoryId !== (initialData?.categoryId ?? "") ||
      limit !== (initialData ? formatMoneyInput(initialData.amount) : ""),
    busy,
  );
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    const amount = parseMoneyInput(limit);
    if (!amount || !categoryId) {
      setError(
        !categoryId
          ? "Elegí una categoría de gasto."
          : "Ingresá un límite válido mayor que cero.",
      );
      if (!categoryId) categoryRef.current?.focus();
      else amountRef.current?.focus();
      return;
    }
    const { currentMonth: month, currentYear: year } =
      getLocalMonthBoundaries();
    setBusy(true);
    setError("");
    try {
      await createBudgetService({ amount, categoryId, month, year });
      await cache.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Presupuesto guardado");
      close?.();
    } catch {
      setError("No se pudo guardar el presupuesto. Intentá nuevamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={save}
      className="mt-5 flex flex-col gap-3 border-t border-border pt-4"
    >
      <label htmlFor={id + "category"} className="text-xs">
        Categoría de gasto
      </label>
      <select
        ref={categoryRef}
        id={id + "category"}
        value={categoryId}
        disabled={busy || Boolean(initialData)}
        aria-invalid={Boolean(error) && !categoryId}
        aria-describedby={error ? id + "error" : undefined}
        onChange={(event) => setCategoryId(event.target.value)}
        required
        className="vaulty-input text-sm"
      >
        <option value="">
          {isLoading ? "Cargando…" : "Elegí una categoría"}
        </option>
        {data
          .filter((item) => item.type === "EXPENSE")
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
      </select>
      {isError && (
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm text-primary"
        >
          Reintentar carga de categorías
        </button>
      )}
      <label htmlFor={id + "limit"} className="text-xs">
        Límite mensual · ARS
      </label>
      <input
        ref={amountRef}
        disabled={busy}
        aria-invalid={Boolean(error) && !parseMoneyInput(limit)}
        aria-describedby={error ? id + "error" : undefined}
        id={id + "limit"}
        inputMode="decimal"
        value={limit}
        onChange={(event) => setLimit(event.target.value)}
        placeholder="Ej. 150.000"
        className="vaulty-input text-lg"
        required
      />
      <p className="text-xs text-muted-foreground">
        Si esta categoría ya tiene un presupuesto este mes, se actualizará su
        límite.
      </p>
      {error && (
        <p id={id + "error"} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy || isLoading || isError}>
          {busy ? "Guardando…" : "Guardar presupuesto"}
        </Button>
        {close && (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={cancel ?? close}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
