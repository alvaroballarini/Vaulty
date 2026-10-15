import { VaultyLogo } from "@/components/VaultyLogo";
import { WalletCards, List, CalendarDays } from "lucide-react";

export function AuthAside() {
  return (
    <aside className="hidden min-h-svh flex-col justify-between border-r border-border bg-[#0d1813] p-10 lg:flex xl:p-16">
      <VaultyLogo />
      <div className="max-w-lg py-16">
        <h2 className="text-4xl font-medium leading-[1.15] tracking-tight xl:text-5xl">
          Más claridad.
          <br />
          <span className="text-primary">Cada día.</span>
        </h2>
        <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground">
          Un lugar para registrar lo que entra, entender lo que gastás y
          anticipar tus próximos pagos.
        </p>
        <div className="mt-12 space-y-5">
          {[
            { text: "Tus cuentas, en un mismo lugar", Icon: WalletCards },
            { text: "Movimientos simples de registrar", Icon: List },
            { text: "Presupuestos y pagos a la vista", Icon: CalendarDays },
          ].map(({ text, Icon }) => (
            <div
              key={text}
              className="flex items-center justify-between border-b border-border pb-5 text-sm"
            >
              <span>{text}</span>
              <Icon
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Vaulty · Finanzas personales en pesos argentinos
      </p>
    </aside>
  );
}
