"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Button } from "./ui/button";
import getDashboard from "@/hooks/getDashboard";
import { DashboardType } from "@/features/dashboard/type";
import { UnauthorizedError } from "@/features/auth/types/authType";
import { ProductTour } from "@/features/onboarding/components/ProductTour";

const Workspace = createContext<{
  data: DashboardType;
  hidden: boolean;
} | null>(null);
export function useWorkspace() {
  const context = useContext(Workspace);
  if (!context) throw new Error("Workspace unavailable");
  return context;
}
const headings: Record<string, [string, string]> = {
  "/": [
    "Tu dinero, en perspectiva.",
    "Un vistazo a tus cuentas, movimientos y próximos pagos.",
  ],
  "/movimientos": [
    "Movimientos",
    "Buscá, revisá y corregí tu historial completo.",
  ],
  "/cuentas": ["Tus cuentas", "Organizá dónde está tu dinero."],
  "/presupuestos": [
    "Presupuestos",
    "Definí límites para los gastos de este mes.",
  ],
  "/planificacion": [
    "Planificación",
    "Administrá tus pagos e ingresos recurrentes.",
  ],
  "/registrar": [
    "Registrar movimiento",
    "Un paso más para mantener tus cuentas al día.",
  ],
};
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("vaulty-privacy", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("vaulty-privacy", callback);
  };
}
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [replayRequest, setReplayRequest] = useState(0);
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    staleTime: 30_000,
    retry: (count, error) => !(error instanceof UnauthorizedError) && count < 2,
  });
  const key = dashboard.data
    ? "vaulty:" + dashboard.data.user.id + ":hidden"
    : null;
  const hidden = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return key ? localStorage.getItem(key) === "true" : false;
      } catch {
        return false;
      }
    },
    () => false,
  );
  function toggle() {
    try {
      if (key) localStorage.setItem(key, String(!hidden));
    } catch {
      return;
    }
    window.dispatchEvent(new Event("vaulty-privacy"));
  }
  useEffect(() => {
    if (dashboard.error instanceof UnauthorizedError) router.replace("/login");
  }, [dashboard.error, router]);
  const [title, description] = headings[pathname] ?? headings["/"];
  return (
    <div className="vaulty-shell flex text-foreground">
      <a
        href="#contenido"
        className="sr-only z-50 rounded bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <Sidebar />
      <main
        id="contenido"
        className="min-w-0 flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:py-8 xl:px-10"
      >
        <div className="mx-auto max-w-[1440px]">
          <Topbar
            user={dashboard.data?.user}
            asOf={dashboard.data?.asOf}
            hidden={hidden}
            onToggle={toggle}
            title={title}
            description={description}
            onStartTour={
              dashboard.data && !dashboard.isError
                ? () => {
                    setReplayRequest((request) => request + 1);
                    if (pathname !== "/") router.push("/");
                  }
                : undefined
            }
          />
          {dashboard.isLoading ? (
            <div role="status" className="grid gap-5 md:grid-cols-2">
              <div className="vaulty-panel h-80 animate-pulse" />
              <div className="vaulty-panel h-80 animate-pulse" />
              <span className="sr-only">Cargando tu espacio…</span>
            </div>
          ) : !dashboard.data || dashboard.isError ? (
            <section role="alert" className="vaulty-panel p-8 text-center">
              <h2 className="text-lg font-semibold">
                No pudimos cargar tu espacio
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Comprobá tu conexión e intentá nuevamente.
              </p>
              <Button className="mt-5" onClick={() => void dashboard.refetch()}>
                Reintentar
              </Button>
            </section>
          ) : (
            <Workspace.Provider value={{ data: dashboard.data, hidden }}>
              {children}
              <ProductTour
                key={dashboard.data.user.id}
                user={dashboard.data.user}
                replayRequest={replayRequest}
              />
            </Workspace.Provider>
          )}
        </div>
      </main>
    </div>
  );
}
