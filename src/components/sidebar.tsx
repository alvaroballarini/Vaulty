"use client";

import { useState } from "react";
import {
  LayoutGrid,
  ArrowLeftRight,
  PieChart,
  Target,
  Wallet,
  CreditCard,
  Settings,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Resumen", icon: LayoutGrid, active: true },
  { label: "Movimientos", icon: ArrowLeftRight },
  { label: "Análisis", icon: PieChart },
  { label: "Presupuestos", icon: Wallet },
  { label: "Objetivos", icon: Target },
  { label: "Tarjetas", icon: CreditCard },
];

const secondary = [
  { label: "Ajustes", icon: Settings },
  { label: "Ayuda", icon: LifeBuoy },
];

export function Sidebar() {
  const [active, setActive] = useState("Resumen");

  return (
    <aside className="hidden lg:flex lg:w-64 xl:w-72 shrink-0 flex-col gap-8 border-r border-border bg-sidebar px-5 py-6">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Wallet className="size-5" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Vaulty</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Principal">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Menú
        </p>
        {nav.map((item) => {
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="size-[18px]" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}

        <p className="px-3 pb-2 pt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          General
        </p>
        {secondary.map((item) => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <item.icon className="size-[18px]" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="rounded-2xl bg-secondary p-4">
        <p className="text-sm font-medium">Vaulty Premium</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Desbloquea informes avanzados y categorías ilimitadas.
        </p>
        <button className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          Mejorar plan
        </button>
      </div>
    </aside>
  );
}
