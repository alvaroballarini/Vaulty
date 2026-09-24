import { AuthAside } from "@/features/auth/components/AuthAside"
import { LoginForm } from "@/features/auth/components/loginForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Iniciar sesión — Vaulty",
  description: "Accede a tu panel financiero de Vaulty.",
}

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <AuthAside />
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Inicia sesión para continuar gestionando tus finanzas.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
