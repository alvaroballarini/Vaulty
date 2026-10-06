"use client";
import { Bell, CheckCheck, Circle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import getNotificationApi from "@/features/notification/hook/getNotificationApi";
import markAsReadApi from "@/features/notification/hook/markAsReadApi";
import markAllAsReadService from "@/features/notification/service/markAllAsReadService";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner";
export default function NotificationCenter({ hiddenAmounts = false }: { hiddenAmounts?: boolean }) {
  const cache = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["notifications"], queryFn: getNotificationApi, staleTime: 30_000 });
  const mutation = useMutation({
    mutationFn: async (id?: string) => { if (id) await markAsReadApi(id); else await markAllAsReadService(); },
    onSuccess: () => cache.invalidateQueries({ queryKey: ["notifications"] }),
    onError: () => toast.error("No se pudo actualizar la notificación."),
  });
  return <Popover><PopoverTrigger render={<button aria-label={`Notificaciones. ${data?.unreadCount ?? 0} sin leer.`} className="relative flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"><Bell className="size-5" />{Boolean(data?.unreadCount) && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />}</button>} />
    <PopoverContent align="end" className="w-[min(360px,calc(100vw-2rem))] p-0">
      <div className="flex items-center justify-between gap-2 border-b border-border p-4"><h2 className="text-sm font-semibold">Notificaciones</h2>{Boolean(data?.unreadCount) && <button disabled={mutation.isLoading} onClick={() => mutation.mutate(undefined)} className="flex min-h-9 items-center gap-1 text-xs text-primary"><CheckCheck className="size-4" />Marcar leídas</button>}</div>
      <div className="max-h-80 overflow-y-auto p-2">
        {hiddenAmounts ? <p className="p-4 text-sm text-muted-foreground">Mostrá los importes para leer tus notificaciones.</p> : isLoading ? <p className="p-4 text-sm text-muted-foreground">Cargando…</p> : isError ? <button onClick={() => void refetch()} className="p-4 text-sm text-primary">No se pudieron cargar. Reintentar</button> : !data?.items.length ? <p className="p-4 text-sm text-muted-foreground">Estás al día. No hay notificaciones.</p> : data.items.map((item) => <button key={item.id} disabled={mutation.isLoading} onClick={() => mutation.mutate(item.id)} className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-secondary"><Circle className={`mt-1 size-2 shrink-0 ${item.isRead ? "text-muted-foreground" : "fill-primary text-primary"}`} /><span><span className="block text-sm font-medium">{item.title}</span><span className="mt-1 block text-xs text-muted-foreground">{item.message}</span></span></button>)}
      </div>
    </PopoverContent>
  </Popover>;
}
