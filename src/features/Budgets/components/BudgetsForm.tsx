"use client";
import { useId, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import getCategories from "@/features/categories/hooks/getCategories";
import { Button } from "@/components/ui/button";
import { getLocalMonthBoundaries } from "@/lib/date-utils";
import { parseMoneyInput } from "@/lib/money";
import createBudgetService from "../service/createBudget";
export default function BudgetForm({ close }: { close?: () => void }) {
  const id = useId();
  const cache = useQueryClient();
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: ["category"], queryFn: getCategories });
  const [categoryId, setCategoryId] = useState("");
  const [limit, setLimit] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    const amount = parseMoneyInput(limit);
    if (!amount || !categoryId) { setError("Elegí una categoría y un monto válido."); return; }
    const { currentMonth: month, currentYear: year } = getLocalMonthBoundaries();
    setBusy(true); setError("");
    try { await createBudgetService({ amount, categoryId, month, year }); await cache.invalidateQueries({ queryKey: ["dashboard"] }); toast.success("Presupuesto guardado"); close?.(); }
    catch { setError("No se pudo guardar el presupuesto. Intentá nuevamente."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="mt-5 flex flex-col gap-3 border-t border-border pt-4"><label htmlFor={id + "category"} className="text-xs">Categoría de gasto</label><select id={id + "category"} value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required className="vaulty-input text-sm"><option value="">{isLoading ? "Cargando…" : "Elegí una categoría"}</option>{data.filter((item) => item.type === "EXPENSE").map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{isError && <button type="button" onClick={() => void refetch()} className="text-sm text-primary">Reintentar carga de categorías</button>}<label htmlFor={id + "limit"} className="text-xs">Límite mensual · ARS</label><input id={id + "limit"} inputMode="decimal" value={limit} onChange={(event) => setLimit(event.target.value)} placeholder="Ej. 150.000" className="vaulty-input text-lg" required /><p className="text-xs text-muted-foreground">Si esta categoría ya tiene un presupuesto este mes, se actualizará su límite.</p>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}<div className="flex gap-2"><Button type="submit" disabled={busy || isLoading || isError}>{busy ? "Guardando…" : "Guardar presupuesto"}</Button>{close && <Button type="button" variant="ghost" disabled={busy} onClick={close}>Cancelar</Button>}</div></form>;
}
