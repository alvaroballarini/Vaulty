"use client";
import { useState } from "react";
import {
  House,
  List,
  WalletCards,
  ChartPie,
  CalendarDays,
  Ellipsis,
  Sprout,
} from "lucide-react";
import { VaultyLogo } from "./VaultyLogo";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const links = [
  { id: "inicio", label: "Inicio", Icon: House },
  { id: "movimientos", label: "Movimientos", Icon: List },
  { id: "cuentas", label: "Cuentas", Icon: WalletCards },
  { id: "presupuestos", label: "Presupuestos", Icon: ChartPie },
  { id: "planificacion", label: "Planificación", Icon: CalendarDays },
];
export function Sidebar({ onNavigate }: { onNavigate: (id: string) => void }) {
  const [active, setActive] = useState("inicio");
  const [more, setMore] = useState(false);
  function navigate(id: string) {
    setActive(id);
    setMore(false);
    onNavigate(id);
  }
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-[212px] shrink-0 flex-col border-r border-border/60 bg-sidebar/85 px-4 py-8 lg:flex xl:w-[230px]">
        <a
          href="#inicio"
          onClick={() => navigate("inicio")}
          aria-label="Vaulty, ir al inicio"
          className="px-3"
        >
          <VaultyLogo />
        </a>
        <nav
          aria-label="Navegación principal"
          className="mt-10 flex flex-col gap-2"
        >
          {links.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={active === id ? "location" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors",
                active === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-primary/10 bg-primary/5 p-4">
          <Sprout className="mb-3 size-5 text-primary" />
          <p className="text-sm font-medium">Un hábito, más claridad.</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Cada movimiento te ayuda a entender mejor tu dinero.
          </p>
        </div>
        <p className="mt-4 px-3 text-[11px] text-muted-foreground">
          Vaulty · Finanzas personales
        </p>
      </aside>
      <nav
        aria-label="Navegación móvil"
        className="vaulty-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-sidebar/95 px-2 pt-2 backdrop-blur-xl lg:hidden"
      >
        {links.slice(0, 3).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            aria-current={active === id ? "location" : undefined}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[10px]",
              active === id ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
        <button
          onClick={() => setMore(true)}
          className={cn(
            "flex min-h-12 flex-col items-center justify-center gap-1 text-[10px]",
            ["planificacion", "presupuestos"].includes(active)
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          <Ellipsis className="size-5" />
          Más
        </button>
      </nav>
      <Dialog open={more} onOpenChange={setMore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Más en Vaulty</DialogTitle>
          </DialogHeader>
          {links.slice(3).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => navigate(id)}
              className="flex min-h-12 items-center gap-3 rounded-lg px-3 text-left hover:bg-secondary"
            >
              <Icon className="size-5 text-primary" />
              {label}
            </button>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}
