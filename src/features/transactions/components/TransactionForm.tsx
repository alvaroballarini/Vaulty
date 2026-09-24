import CategoryFormPopover from "@/features/categories/components/CategoryFormPopover";
import { expenseCategories, incomeCategories } from "@/lib/finance-data";
import createTransactionsService from "../service/createTransactions";
// IMPORTANTE: Asegúrate de importar o crear este servicio de actualización
import getCategories from "@/features/categories/hooks/getCategories";
import { ArrowDownRight, ArrowUpRight, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getAccounts from "@/features/account/hook/getAccount";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type TxType = "EXPENSE" | "INCOME";

export interface TransactionType {
  id: string;
  userId?: string;
  accountId?: string;
  categoryId?: string;
  recurringTransactionId?: string;
  amount: number;
  category: {
    name: string;
    color: string;
    icon: string;
  };
  description: string;
  date: Date;
  type: TxType;
}

interface Props {
  isOpen: boolean;
  closeForm: () => void;
  initialData?: TransactionType | null; // Prop para recibir la data a editar
}

export function TransactionForm({ isOpen, closeForm, initialData }: Props) {
  const queryClient = useQueryClient();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["category"],
    queryFn: getCategories,
    staleTime: Infinity,
  });

  const { data: accounts, isLoading: isLoadingAccount } = useQuery({
    queryKey: ["account"],
    queryFn: getAccounts,
    staleTime: Infinity,
  });

  const [isLoadingSubmit, setIsLoadingSubmit] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializamos los estados
  const [type, setType] = useState<TxType>(initialData?.type || "EXPENSE");
  const [amount, setAmount] = useState<string>(
    initialData?.amount?.toString() || "",
  );
  const [category, setCategory] = useState<string>(
    initialData?.categoryId || "",
  );
  const [account, setAccount] = useState<string>(initialData?.accountId || "");
  const [name, setName] = useState<string>(initialData?.description || "");

  const amountRef = useRef<HTMLInputElement>(null);

  // Efecto para sincronizar la data inicial cuando se abre el formulario
  useEffect(() => {
  }, [isOpen, initialData]);

  // Cierra con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeForm]);

  if (!isOpen) return null;

  function selectType(next: TxType) {
    setType(next);
    setCategory(
      next === "EXPENSE" ? expenseCategories[0] : incomeCategories[0],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoadingSubmit(true);
    setError(null);

    const value = Number.parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      setError("Introduce un monto válido mayor que 0.");
      amountRef.current?.focus();
      setIsLoadingSubmit(false);
      return;
    }

    try {
      if (initialData) {
        // MODO EDICIÓN
        // await updateTransactionsService({
        //   id: initialData.id, // Pasamos el ID para saber qué actualizar
        //   amount: value,
        //   date: initialData.date, // Mantenemos la fecha original o podés actualizarla a new Date()
        //   type: type,
        //   accountId: account,
        //   categoryId: category,
        //   description: name,
        // });
        toast.success("Se actualizó la transacción");
      } else {
        // MODO CREACIÓN
        await createTransactionsService({
          amount: value,
          date: new Date(),
          type: type,
          accountId: account,
          categoryId: category,
          description: name,
        });
        toast.success("Se creó una transacción");
      }

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      closeForm();
    } catch {
      toast.warning("Hubo un error");
    } finally {
      setIsLoadingSubmit(false); // Reseteamos el estado de carga
    }
  }

  const isValid: boolean =
    amount.length > 0 &&
    account.length > 0 &&
    category.length > 0 &&
    !isLoadingSubmit;

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      {/* Tipo de movimiento */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1">
        {(
          [
            { key: "EXPENSE", label: "Gasto", Icon: ArrowDownRight },
            { key: "INCOME", label: "Ingreso", Icon: ArrowUpRight },
          ] as const
        ).map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => selectType(key)}
            className={cn(
              "flex h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors",
              type === key
                ? key === "EXPENSE"
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Monto */}
      <div>
        <label
          htmlFor="tx-amount"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Monto
        </label>
        <div className="flex items-center rounded-xl border border-border bg-secondary px-4 focus-within:border-primary">
          <span className="text-xl font-semibold text-muted-foreground">$</span>
          <input
            id="tx-amount"
            ref={amountRef}
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9.,]/g, ""));
              setError(null);
            }}
            placeholder="0,00"
            className="h-14 w-full bg-transparent px-2 font-mono text-2xl font-semibold tabular-nums outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-primary">{error}</p>}
      </div>

      {/* Cuenta */}
      <div>
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Cuenta
        </span>
        <div className="grid grid-cols-2 gap-2">
          {isLoadingAccount ? (
            <>
              <Skeleton className="h-15 w-50 flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors" />
              <Skeleton className="h-15 w-50 flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors" />
            </>
          ) : (
            accounts?.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAccount(a.id)}
                className={cn(
                  "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors",
                  account === a.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary hover:border-muted-foreground/40",
                )}
              >
                <span className="text-sm font-medium">{a.name}</span>
                <span className="text-xs text-muted-foreground">{a.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Categoría */}
      <div>
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Categoría
        </span>
        <div className="flex flex-wrap gap-2">
          {isLoadingCategories ? (
            <>
              <Skeleton className="flex h-8 w-24 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors" />
              <Skeleton className="flex h-8 w-24 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors" />
              <Skeleton className="flex h-8 w-24 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors" />
              <Skeleton className="flex h-8 w-24 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors" />
            </>
          ) : (
            categories?.map((c, key) => {
              const active = category === c.id;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {active && <Check className="size-3.5 text-primary" />}
                  {c.name}
                </button>
              );
            })
          )}
          {/* Opcional: Asegurarse de pasar el type seleccionado al popover */}
          <CategoryFormPopover type={type} />
        </div>
      </div>

      {/* Concepto (opcional) */}
      <div>
        <label
          htmlFor="tx-name"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Concepto <span className="text-muted-foreground/60">(opcional)</span>
        </label>
        <input
          id="tx-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Cena con amigos"
          className="h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
        />
      </div>

      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={closeForm}
          className="h-11 flex-1 rounded-xl border border-border bg-secondary text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
        >
          Cancelar
        </button>
        <Button
          type="submit"
          disabled={!isValid}
          className="h-11 flex-[1.5] rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {initialData ? "Actualizar transacción" : "Guardar transacción"}
        </Button>
      </div>
    </form>
  );
}
