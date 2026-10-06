"use client";
import { Eye, EyeOff } from "lucide-react";
import UserDropdown from "@/features/user/component/userDropdown";
import NotificationCenter from "./NotificationCenter";
import { VaultyLogo } from "./VaultyLogo";
import { APP_TIMEZONE } from "@/lib/date-utils";
export function Topbar({ user, hidden, onToggle, asOf }: { user?: { name: string | null; email: string }; hidden: boolean; onToggle: () => void; asOf?: string }) {
  const date = asOf ? new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: APP_TIMEZONE }).format(new Date(asOf)) : "Tu resumen personal";
  return <header className="mb-5 flex items-center justify-between gap-3">
    <div className="hidden lg:block"><h1 className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-semibold tracking-tight">Tu dinero, en perspectiva.</h1><p className="mt-1 text-sm capitalize text-muted-foreground">{date}</p></div>
    <a href="#inicio" className="lg:hidden" aria-label="Vaulty, inicio"><VaultyLogo /></a>
    <div className="flex items-center gap-1 sm:gap-2">
      <button onClick={onToggle} aria-label={hidden ? "Mostrar importes" : "Ocultar importes"} aria-pressed={hidden} className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">{hidden ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button>
      <NotificationCenter hiddenAmounts={hidden} />
      <UserDropdown user={user} />
    </div>
  </header>;
}
