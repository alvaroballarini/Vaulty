"use client";
import { useRef, useState } from "react";
import { Wallet, Plus, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { accountType } from "@/features/account/type/type";
import {
  createAccount,
  updateAccount,
} from "@/features/account/service/createAccount";
import { Button } from "@/components/ui/button";
import { money } from "./Overview";
export function AccountsPanel({
  accounts,
  hidden,
}: {
  accounts: accountType[];
  hidden: boolean;
}) {
  const cache = useQueryClient();
  const [adding, setAdding] = useState(!accounts.length);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<accountType["type"]>("BANK");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!name.trim()) {
      setError("Ingresá un nombre para la cuenta.");
      nameRef.current?.focus();
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (editing) await updateAccount(editing, { name, type });
      else await createAccount({ name, type });
      await Promise.all([
        cache.invalidateQueries({ queryKey: ["account"] }),
        cache.invalidateQueries({ queryKey: ["dashboard"] }),
        cache.invalidateQueries({ queryKey: ["transactions"] }),
        cache.invalidateQueries({ queryKey: ["schedules"] }),
      ]);
      setName("");
      setAdding(false);
      toast.success(editing ? "Cuenta actualizada" : "Cuenta creada");
      setEditing(null);
    } catch {
      setError("No se pudo guardar la cuenta. Intentá nuevamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Saldos calculados con tus movimientos. Para reflejar dinero que ya
        tenías, registrá un ingreso con la nota «Saldo inicial».
      </p>
      <ul>
        {accounts.map((account) => (
          <li
            key={account.id}
            className="flex items-center gap-3 border-b border-border py-3"
          >
            <Wallet className="size-4 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{account.name}</p>
              <p className="text-xs text-muted-foreground">
                {account.type === "CASH"
                  ? "Efectivo"
                  : account.type === "CREDIT"
                    ? "Crédito"
                    : "Banco / billetera"}
              </p>
            </div>
            <span className="vaulty-number text-sm">
              {money(account.balance ?? 0, hidden)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={busy}
              aria-label={`Editar cuenta ${account.name}`}
              onClick={() => {
                setEditing(account.id);
                setName(account.name);
                setType(account.type);
                setAdding(true);
                setError("");
              }}
            >
              <Pencil className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
      {adding ? (
        <form onSubmit={save} className="mt-5 flex flex-col gap-3">
          <h2 className="font-medium">
            {editing ? "Editar cuenta" : "Nueva cuenta"}
          </h2>
          <label className="text-xs">
            Nombre de la cuenta
            <input
              ref={nameRef}
              disabled={busy}
              aria-invalid={Boolean(error) && !name.trim()}
              aria-describedby={error ? "account-form-error" : undefined}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              required
              placeholder="Ej. Mercado Pago"
              className="vaulty-input mt-1 text-sm"
            />
          </label>
          <label className="text-xs">
            Tipo
            <select
              disabled={busy}
              value={type}
              onChange={(event) =>
                setType(event.target.value as accountType["type"])
              }
              className="vaulty-input mt-1 text-sm"
            >
              <option value="BANK">Banco / billetera</option>
              <option value="CASH">Efectivo</option>
              <option value="CREDIT">Crédito</option>
            </select>
          </label>
          {error && (
            <p
              id="account-form-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button disabled={busy} type="submit">
              {busy ? "Guardando…" : "Guardar cuenta"}
            </Button>
            <Button
              disabled={busy}
              type="button"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                setEditing(null);
                setName("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setAdding(true);
            setEditing(null);
            setName("");
            setType("BANK");
            setError("");
          }}
        >
          <Plus className="size-4" />
          Agregar cuenta
        </Button>
      )}
    </div>
  );
}
