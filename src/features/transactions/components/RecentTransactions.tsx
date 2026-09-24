import {
  Home,
  ShoppingCart,
  Music,
  Car,
  HeartPulse,
  Briefcase,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "@/lib/finance-data";
import { cn } from "@/lib/utils";
import { transactionType } from "../types/type";
import { formatShortDate } from "@/lib/formats";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import deleteTransactionService from "../service/delete";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const iconFor: Record<string, typeof Home> = {
  Vivienda: Home,
  Alimentación: ShoppingCart,
  Ocio: Music,
  Transporte: Car,
  Salud: HeartPulse,
  Extra: Briefcase,
  Salario: Banknote,
};

interface PropsRecent {
  data?: transactionType[];
  isLoadingData?: boolean;
  onEdit?: (transaction: transactionType) => void;
}

function TransactionsSkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 border-b border-border py-3 last:border-0"
        >
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
          {/* Skeleton para el botón de opciones */}
          <Skeleton className="size-8 shrink-0 rounded-md" />
        </li>
      ))}
    </>
  );
}

export function RecentTransactions({
  data,
  isLoadingData,
  onEdit,
}: PropsRecent) {
  const queryClient = useQueryClient();

  const deleteTrans = async (id: string) => {
    try {
      await deleteTransactionService(id);
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      toast.success("Se elimino una transacción");
    } catch {
      toast.error("Hubo un error");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Últimos movimientos</h2>
        <button className="text-sm font-medium text-primary transition-opacity hover:opacity-80">
          Ver todos
        </button>
      </div>

      <ul className="mt-4 flex flex-col">
        {isLoadingData ? (
          <TransactionsSkeletonList rows={4} />
        ) : (
          <AnimatePresence initial={false}>
            {data?.map((t) => {
              const categoryName =
                typeof t.category === "object" ? t.category.name : t.category;
              const Icon = iconFor[categoryName] ?? Banknote;
              const isIncome = t.type === "INCOME";

              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.05 }}
                  className="group flex items-center gap-3 border-b border-border py-3 transition-colors hover:bg-muted/50 sm:px-2 last:border-0 overflow-hidden"
                >
                  {/* 1. Icono */}
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      isIncome
                        ? "bg-primary/15 text-primary"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <Icon className="size-[18px]" aria-hidden="true" />
                  </span>
                  {/* 2. Información */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {t.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {categoryName} · {formatShortDate(t.date)}
                    </p>
                  </div>
                  {/* 3. Contenedor de Monto + Acciones */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={cn(
                        "flex items-center gap-0.5 font-mono text-sm font-semibold tabular-nums",
                        isIncome ? "text-primary" : "text-foreground",
                      )}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="size-3.5" />
                      ) : (
                        <ArrowDownRight className="size-3.5 text-muted-foreground" />
                      )}
                      {isIncome ? "+" : "-"}
                      {formatCurrency(t.amount, { decimals: true })}
                    </span>

                    {/* Menú de Acciones */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus:opacity-100 data-[state=open]:opacity-100"
                            aria-label="Opciones de transacción"
                          > 
                            <MoreHorizontal className="size-4" />
                          </Button>
                        }
                      ></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onEdit?.(t)}>
                          {/* <TransactionDialog isEdit/> */}
                          <Pencil className="mr-2 size-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => deleteTrans(t.id)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        )}
      </ul>
    </div>
  );
}
