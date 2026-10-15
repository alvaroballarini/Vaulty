import { WorkspaceShell } from "@/components/WorkspaceShell";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
