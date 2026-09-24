import { AuthAside } from "@/features/auth/components/AuthAside"
import { RegisterForm } from "@/features/auth/components/registerForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Crear cuenta — Vaulty",
  description: "Regístrate gratis y toma el control de tus finanzas con Vaulty.",
}

export default function RegisterPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <AuthAside />
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight">Crea tu cuenta</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Empieza gratis. Sin tarjeta de crédito.
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </main>
  )
}
