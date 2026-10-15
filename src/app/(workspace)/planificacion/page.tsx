"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "@/components/WorkspaceShell";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormDialog } from "@/components/ui/form-dialog";
import { ScheduledMovement } from "@/features/RecurringTransaction/types/management";
import { setScheduleActive } from "@/features/RecurringTransaction/service/manageRecurring";
import { RecurringTransactionForm } from "@/features/transactions/components/RecurringTransactionForm";
import { money } from "@/features/dashboard/components/Overview";
import { APP_TIMEZONE } from "@/lib/date-utils";
export default function Page() {
  const { data, hidden } = useWorkspace();
  const cache = useQueryClient();
  const [editing, setEditing] = useState<ScheduledMovement | "new" | null>(
    null,
  );
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const schedules = useQuery<ScheduledMovement[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await fetch("/api/schedules");
      if (!res.ok) throw new Error("No se pudo cargar");
      return res.json();
    },
  });
  const due = (item: ScheduledMovement) =>
    item.isActive &&
    (!item.nextRunAt || new Date(item.nextRunAt) <= new Date(data.asOf));
  async function toggle(item: ScheduledMovement) {
    if (busy) return;
    setBusy(item.id);
    try {
      await setScheduleActive(item.id, !item.isActive);
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["schedules"] }),
        cache.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
      toast.success(
        item.isActive ? "Programación pausada" : "Programación reanudada",
      );
    } catch {
      toast.error("No se pudo actualizar. Intentá nuevamente.");
    } finally {
      setBusy(null);
    }
  }
  const items =
    schedules.data?.filter(
      (item) =>
        filter === "all" ||
        (filter === "active" && item.isActive) ||
        (filter === "paused" && !item.isActive) ||
        (filter === "review" && due(item)),
    ) ?? [];
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-3 text-sm">
          Mostrar
          <select
            className="vaulty-input w-auto"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="paused">Pausadas</option>
            <option value="review">Por revisar</option>
          </select>
        </label>
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          Programar movimiento
        </Button>
      </div>
      <section className="vaulty-panel p-5 sm:p-7">
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Pausá lo que ya no se repite o editá la próxima fecha. Al reanudar una
          programación vencida, continuará desde su próxima fecha futura; los
          períodos pausados no se registran.
        </p>
        {schedules.isLoading ? (
          <p role="status">Cargando tu planificación…</p>
        ) : schedules.isError ? (
          <div role="alert">
            <p>No pudimos cargar tus programaciones.</p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => void schedules.refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : !items.length ? (
          <div className="py-8">
            <h2 className="font-medium">
              {schedules.data?.length
                ? "Sin programaciones en este estado"
                : "Anticipá tus pagos e ingresos"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {schedules.data?.length
                ? "Elegí otro filtro para ver el resto."
                : "Agregá alquiler, servicios, sueldo o cualquier movimiento que se repita."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 xl:flex-row xl:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="break-words font-medium">
                      {item.description}
                    </h2>
                    <span
                      className={
                        "rounded px-2 py-1 text-xs " +
                        (!item.isActive
                          ? "bg-secondary text-muted-foreground"
                          : due(item)
                            ? "bg-amber-400/10 text-amber-200"
                            : "bg-primary/10 text-primary")
                      }
                    >
                      {!item.isActive
                        ? "Pausada"
                        : due(item)
                          ? "Revisar fecha"
                          : "Activa"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.account.name} · {item.category.name} ·{" "}
                    {item.frequency === "MONTHLY"
                      ? "Mensual"
                      : item.frequency === "WEEKLY"
                        ? "Semanal"
                        : "Diaria"}
                  </p>
                  <p
                    className={
                      "mt-1 text-xs " +
                      (due(item) ? "text-amber-200" : "text-muted-foreground")
                    }
                  >
                    {item.nextRunAt
                      ? "Próxima fecha: " +
                        new Intl.DateTimeFormat("es-AR", {
                          dateStyle: "medium",
                          timeZone: APP_TIMEZONE,
                        }).format(new Date(item.nextRunAt))
                      : "Sin próxima fecha definida"}
                  </p>
                </div>
                <p
                  className={
                    "vaulty-number text-lg " +
                    (item.type === "INCOME"
                      ? "text-primary"
                      : "text-foreground")
                  }
                >
                  {hidden
                    ? "••••••"
                    : (item.type === "INCOME" ? "+" : "−") +
                      money(item.expectedAmount)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(item)}
                    aria-label={"Editar " + item.description}
                  >
                    <Pencil className="size-4" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={Boolean(busy)}
                    onClick={() => void toggle(item)}
                    aria-label={
                      (item.isActive ? "Pausar " : "Reanudar ") +
                      item.description
                    }
                  >
                    {item.isActive ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    {busy === item.id
                      ? "Guardando…"
                      : item.isActive
                        ? "Pausar"
                        : "Reanudar"}
                  </Button>
                </div>
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing === "new"
                ? "Programar movimiento"
                : "Editar programación"}
            </DialogTitle>
            <DialogDescription>
              Organizá lo que se repite y su próxima fecha.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <RecurringTransactionForm
              key={editing === "new" ? "new" : editing.id}
              isOpen
              initialData={editing === "new" ? undefined : editing}
              closeForm={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </FormDialog>
    </>
  );
}
