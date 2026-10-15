"use client";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import UserDropdown from "@/features/user/component/userDropdown";
import NotificationCenter from "./NotificationCenter";
import { VaultyLogo } from "./VaultyLogo";
import { APP_TIMEZONE } from "@/lib/date-utils";
export function Topbar({
  user,
  hidden,
  onToggle,
  asOf,
  title = "Tu dinero, en perspectiva.",
  description,
}: {
  user?: { name: string | null; email: string };
  hidden: boolean;
  onToggle: () => void;
  asOf?: string;
  title?: string;
  description?: string;
}) {
  const date = asOf
    ? new Intl.DateTimeFormat("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: APP_TIMEZONE,
      }).format(new Date(asOf))
    : "";
  return (
    <header className="mb-7">
      <div className="mb-5 flex items-center justify-between gap-3 lg:mb-6">
        <Link href="/" className="lg:hidden" aria-label="Vaulty, inicio">
          <VaultyLogo />
        </Link>
        <p className="hidden text-xs text-muted-foreground lg:block">{date}</p>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={onToggle}
            aria-label={hidden ? "Mostrar importes" : "Ocultar importes"}
            aria-pressed={hidden}
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {hidden ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
          <NotificationCenter hiddenAmounts={hidden} />
          <UserDropdown user={user} />
        </div>
      </div>
      <h1 className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-semibold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
