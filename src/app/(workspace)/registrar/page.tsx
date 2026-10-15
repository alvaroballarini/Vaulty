"use client";
import Link from "next/link";
import { useWorkspace } from "@/components/WorkspaceShell";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";
export default function Page() {
  const { data } = useWorkspace();
  return (
    <section className="vaulty-panel max-w-2xl p-5 sm:p-7">
      <TransactionForm
        isOpen
        inline
        preferenceKey={`vaulty:${data.user.id}:last-account`}
      />
      {!data.accounts.length && (
        <Link
          href="/cuentas"
          className="mt-4 inline-flex min-h-11 items-center text-primary"
        >
          Crear una cuenta para empezar
        </Link>
      )}
    </section>
  );
}
