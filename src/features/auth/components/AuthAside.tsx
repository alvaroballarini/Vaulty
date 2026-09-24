import { Wallet, ShieldCheck, TrendingUp, PieChart } from "lucide-react"

const highlights = [
  { icon: TrendingUp, title: "Seguimiento en tiempo real", desc: "Visualiza la evolución de tu dinero mes a mes." },
  { icon: PieChart, title: "Gastos por categoría", desc: "Entiende a dónde va cada peso de tu presupuesto." },
  { icon: ShieldCheck, title: "Datos protegidos", desc: "Cifrado de extremo a extremo en toda tu información." },
]

export function AuthAside() {
  return (
    <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
      {/* decorative dotted grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-0 h-full w-2/3 opacity-25"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
          maskImage: "linear-gradient(to left, black, transparent)",
        }}
      />

      <div className="relative flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
          <Wallet className="size-5" aria-hidden="true" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Vaulty</span>
      </div>

      <div className="relative max-w-md">
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight">
          Toma el control total de tus finanzas.
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-primary-foreground/80">
          Miles de personas ya organizan su dinero con Vaulty. Únete y empieza a construir un futuro financiero más sólido.
        </p>

        <ul className="mt-8 flex flex-col gap-5">
          {highlights.map((item) => (
            <li key={item.title} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
                <item.icon className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-sm leading-relaxed text-primary-foreground/70">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-primary-foreground/60">© {new Date().getFullYear()} Vaulty. Todos los derechos reservados.</p>
    </aside>
  )
}
