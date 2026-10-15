"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  List,
  WalletCards,
  ChartPie,
  CalendarDays,
  Ellipsis,
  Plus,
} from "lucide-react";
import { VaultyLogo } from "./VaultyLogo";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
const links = [
  { href: "/", label: "Inicio", Icon: House },
  { href: "/movimientos", label: "Movimientos", Icon: List },
  { href: "/cuentas", label: "Cuentas", Icon: WalletCards },
  { href: "/presupuestos", label: "Presupuestos", Icon: ChartPie },
  { href: "/planificacion", label: "Planificación", Icon: CalendarDays },
];
export function Sidebar() {
  const pathname = usePathname();
  const [more, setMore] = useState(false);
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-[212px] shrink-0 flex-col border-r border-border/60 bg-sidebar px-4 py-8 lg:flex xl:w-[230px]">
        <Link href="/" aria-label="Vaulty, ir al inicio" className="px-3">
          <VaultyLogo />
        </Link>
        <Link
          href="/registrar"
          aria-current={pathname === "/registrar" ? "page" : undefined}
          className="mt-10 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Registrar
        </Link>
        <nav
          aria-label="Navegación principal"
          className="mt-5 flex flex-col gap-1"
        >
          {links.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-5 px-3">
          <p className="text-xs text-muted-foreground">
            Tu espacio financiero personal
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pesos argentinos · ARS
          </p>
        </div>
      </aside>
      <nav
        aria-label="Navegación móvil"
        className="vaulty-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-sidebar px-2 pt-2 lg:hidden"
      >
        {[
          links[0],
          links[1],
          { href: "/registrar", label: "Registrar", Icon: Plus },
        ].map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-xs",
              pathname === href ? "text-primary" : "text-muted-foreground",
              href === "/registrar" && "bg-primary/10 text-primary",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
        <button
          onClick={() => setMore(true)}
          aria-expanded={more}
          className={cn(
            "flex min-h-12 flex-col items-center justify-center gap-1 text-xs",
            links.slice(2).some((link) => link.href === pathname)
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
            <DialogTitle>Organizá tu dinero</DialogTitle>
            <DialogDescription>
              Cuentas, límites y movimientos recurrentes.
            </DialogDescription>
          </DialogHeader>
          {links.slice(2).map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMore(false)}
              aria-current={pathname === href ? "page" : undefined}
              className="flex min-h-12 items-center gap-3 rounded-lg px-3 hover:bg-secondary"
            >
              <Icon className="size-5 text-primary" />
              {label}
            </Link>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}
