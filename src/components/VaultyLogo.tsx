import { cn } from "@/lib/utils";

export function VaultyLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg viewBox="0 0 40 36" className="h-8 w-9 shrink-0" fill="none" aria-hidden="true">
        <path d="M2 3h10l13 29h-9L2 3Z" fill="#34d399" />
        <path d="M28 3h10L25 32h-9L28 3Z" fill="#6ee7b7" />
        <path d="m20 20 5 12h-9l-1-2 5-10Z" fill="#16a772" />
      </svg>
      <span className="text-[27px] font-semibold tracking-tight text-foreground">Vaulty</span>
    </span>
  );
}
