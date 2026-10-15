"use client";
import { useWorkspace } from "@/components/WorkspaceShell";
import { AccountsPanel } from "@/features/dashboard/components/AccountsPanel";
export default function Page() {
  const { data, hidden } = useWorkspace();
  return (
    <section className="vaulty-panel max-w-4xl p-5 sm:p-7">
      <AccountsPanel accounts={data.accounts} hidden={hidden} />
    </section>
  );
}
