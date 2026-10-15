"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "@/components/WorkspaceShell";
import { Button } from "@/components/ui/button";
import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { EditTransactionDialog } from "@/features/transactions/components/EditTransactionDialog";
import { TransactionType } from "@/features/transactions/components/TransactionForm";
import { transactionType } from "@/features/transactions/types/type";
type Filters = {
  q: string;
  type: string;
  accountId: string;
  categoryId: string;
  from: string;
  to: string;
};
const empty: Filters = {
  q: "",
  type: "",
  accountId: "",
  categoryId: "",
  from: "",
  to: "",
};
export default function Page() {
  const { data, hidden } = useWorkspace();
  const [draft, setDraft] = useState(empty);
  const [filters, setFilters] = useState(empty);
  const [page, setPage] = useState(1);
  const [advanced, setAdvanced] = useState(false);
  const filterCount = Object.entries(draft).filter(
    ([key, value]) => key !== "q" && value,
  ).length;
  const [editing, setEditing] = useState<TransactionType | null>(null);
  const query = useQuery<{
    items: transactionType[];
    total: number;
    pageSize: number;
  }>({
    queryKey: ["transactions", filters, page],
    queryFn: async () => {
      const res = await fetch(
        "/api/transactions?" +
          new URLSearchParams({ ...filters, page: String(page) }),
      );
      if (!res.ok) throw new Error("No se pudo cargar");
      return res.json();
    },
    staleTime: 15_000,
  });
  function field(name: keyof Filters, value: string) {
    setDraft({ ...draft, [name]: value });
  }
  return (
    <div className="space-y-5">
      <form
        className="vaulty-panel space-y-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters(draft);
          setPage(1);
        }}
      >
        <label className="block text-sm">
          Buscar movimientos
          <input
            type="search"
            value={draft.q}
            onChange={(event) => field("q", event.target.value)}
            className="vaulty-input mt-2"
            placeholder="Descripción, cuenta o categoría"
            maxLength={100}
          />
        </label>
        <button
          type="button"
          aria-expanded={advanced}
          aria-controls="advanced-filters"
          onClick={() => setAdvanced(!advanced)}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-primary"
        >
          {advanced ? "Ocultar filtros avanzados" : "Más filtros"}
          {filterCount > 0 && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs">
              {filterCount}
            </span>
          )}
        </button>
        <div id="advanced-filters" hidden={!advanced}>
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-5">
            <label className="text-sm">
              Tipo
              <select
                className="vaulty-input mt-2"
                value={draft.type}
                onChange={(event) => field("type", event.target.value)}
              >
                <option value="">Todos</option>
                <option value="EXPENSE">Gastos</option>
                <option value="INCOME">Ingresos</option>
                <option value="TRANSFER">Transferencias</option>
              </select>
            </label>
            <label className="text-sm">
              Cuenta
              <select
                className="vaulty-input mt-2"
                value={draft.accountId}
                onChange={(event) => field("accountId", event.target.value)}
              >
                <option value="">Todas las cuentas</option>
                {data.accounts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Categoría
              <select
                className="vaulty-input mt-2"
                value={draft.categoryId}
                onChange={(event) => field("categoryId", event.target.value)}
              >
                <option value="">Todas las categorías</option>
                {data.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Desde
              <input
                type="date"
                className="vaulty-input mt-2"
                value={draft.from}
                max={draft.to || undefined}
                onChange={(event) => field("from", event.target.value)}
              />
            </label>
            <label className="text-sm">
              Hasta
              <input
                type="date"
                className="vaulty-input mt-2"
                value={draft.to}
                min={draft.from || undefined}
                onChange={(event) => field("to", event.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit">Aplicar filtros</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraft(empty);
              setFilters(empty);
              setPage(1);
            }}
          >
            Limpiar
          </Button>
        </div>
      </form>
      {query.isError ? (
        <div role="alert" className="vaulty-panel p-6">
          <p>No pudimos cargar tus movimientos.</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => void query.refetch()}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <RecentTransactions
          data={query.data?.items}
          isLoadingData={query.isLoading}
          hidden={hidden}
          fullHistory
          onEdit={(item) => {
            if (item.type !== "TRANSFER")
              setEditing({ ...item, type: item.type });
          }}
        />
      )}
      {query.data && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <p>
            {query.data.total} movimientos · Página {page} de{" "}
            {Math.max(1, Math.ceil(query.data.total / query.data.pageSize))}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1 || query.isFetching}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={
                page * query.data.pageSize >= query.data.total ||
                query.isFetching
              }
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
      <EditTransactionDialog item={editing} close={() => setEditing(null)} />
    </div>
  );
}
