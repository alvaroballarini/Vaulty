"use client";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { APP_TIMEZONE } from "@/lib/date-utils";
import { money } from "@/features/dashboard/components/Overview";
import { transactionType } from "../types/type";
import deleteTransactionService from "../service/delete";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
interface Props {
  data?: transactionType[];
  isLoadingData?: boolean;
  onEdit?: (transaction: transactionType) => void;
  hidden?: boolean;
}
export function RecentTransactions({
  data = [],
  isLoadingData,
  onEdit,
  hidden = false,
}: Props) {
  const cache = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<transactionType | null>(null);
  const [busy, setBusy] = useState(false);
  const filtered = data.filter((item) =>
    [item.description, item.category?.name, item.account?.name].some((text) =>
      text?.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es")),
    ),
  );
  async function remove() {
    if (!deleting || busy) return;
    setBusy(true);
    try {
      await deleteTransactionService(deleting.id);
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["dashboard"] }),
        cache.invalidateQueries({ queryKey: ["dashboardTest"] }),
        cache.invalidateQueries({ queryKey: ["transactions"] }),
      ]);
      setDeleting(null);
      toast.success("Movimiento eliminado");
    } catch {
      toast.error("No se pudo eliminar. Intentá nuevamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="vaulty-panel min-w-0 p-4 sm:p-5"
      aria-labelledby="movements-title"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 id="movements-title" className="text-base font-semibold">
            Últimos movimientos
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tus {data.length} movimientos más recientes
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
          <input
            aria-label="Buscar entre los últimos movimientos"
            type="search"
            placeholder="Buscar en recientes"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="vaulty-input pl-9 text-xs sm:w-56"
          />
        </div>
      </div>
      <div className="mt-4 hidden grid-cols-[2fr_1fr_1fr_1fr_44px] gap-4 border-b border-border pb-2 text-xs text-muted-foreground md:grid">
        <span>Descripción / cuenta</span>
        <span>Categoría</span>
        <span>Fecha</span>
        <span className="text-right">Monto · ARS</span>
        <span className="sr-only">Acciones</span>
      </div>
      <ul className="mt-1">
        {isLoadingData ? (
          <li
            className="h-40 animate-pulse rounded-lg bg-secondary/50"
            aria-label="Cargando movimientos"
          />
        ) : (
          filtered.map((item) => {
            const income = item.type === "INCOME";
            const transfer = item.type === "TRANSFER";
            const Icon = transfer
              ? ArrowLeftRight
              : income
                ? ArrowUpRight
                : ArrowDownLeft;
            const date = new Intl.DateTimeFormat("es-AR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              timeZone: APP_TIMEZONE,
            }).format(new Date(item.date));
            return (
              <li
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_36px] items-center gap-2 border-b border-border/65 py-3 last:border-0 md:grid-cols-[2fr_1fr_1fr_1fr_44px] md:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "hidden size-9 shrink-0 items-center justify-center rounded-lg sm:flex",
                      income
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.description ||
                        item.category?.name ||
                        "Sin descripción"}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      <span className="hidden md:inline">
                        {item.account?.name ?? "Cuenta"}
                      </span>
                      <span className="md:hidden">
                        {item.category?.name ?? "Sin categoría"} · {date}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="hidden truncate text-xs text-muted-foreground md:block">
                  {item.category?.name ?? "Sin categoría"}
                </span>
                <time
                  dateTime={new Date(item.date).toISOString()}
                  className="hidden text-xs text-muted-foreground md:block"
                >
                  {date}
                </time>
                <span
                  className={cn(
                    "vaulty-number text-right text-xs font-medium sm:text-sm",
                    income
                      ? "text-primary"
                      : transfer
                        ? "text-muted-foreground"
                        : "text-destructive",
                  )}
                >
                  {hidden
                    ? "••••••"
                    : `${transfer ? "" : income ? "+" : "−"}${money(item.amount)}`}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Opciones de ${item.description || item.category?.name || "movimiento"}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    {!transfer && (
                      <DropdownMenuItem onClick={() => onEdit?.(item)}>
                        <Pencil className="size-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setDeleting(item)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })
        )}
        {!isLoadingData && !filtered.length && (
          <li className="py-10 text-center text-sm text-muted-foreground">
            {search
              ? "No hay coincidencias entre tus movimientos recientes."
              : "Todavía no hay movimientos. Empezá con el registro rápido."}
          </li>
        )}
      </ul>
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar este movimiento?</DialogTitle>
            <DialogDescription>
              Se quitará del historial y se recalcularán tus saldos. Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm">
            {deleting?.description || deleting?.category?.name || "Movimiento"}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? "Eliminando…" : "Eliminar movimiento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
