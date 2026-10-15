import Link from "next/link";
import { VaultyLogo } from "@/components/VaultyLogo";
export const metadata = { title: "Tus datos — Vaulty" };
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <VaultyLogo />
      <h1 className="mt-12 text-3xl font-semibold tracking-tight">
        Cómo se guardan tus datos
      </h1>
      <div className="mt-8 space-y-6 text-base leading-relaxed text-muted-foreground">
        <p>
          Vaulty es una herramienta de finanzas personales en desarrollo. Al
          crear una cuenta se guardan tu nombre, correo electrónico y una
          versión protegida de tu contraseña mediante Argon2.
        </p>
        <p>
          Las cuentas, categorías, movimientos, presupuestos y programaciones
          que registrás se almacenan en la base de datos de la aplicación y se
          asocian a tu usuario. Vaulty no se conecta con tu banco: los saldos se
          calculan a partir de lo que registrás.
        </p>
        <p>
          Para mantener el acceso se utiliza una cookie de sesión. El navegador
          también recuerda preferencias como la última cuenta elegida y si
          querés ocultar importes. Podés cerrar sesión desde el menú de tu
          perfil.
        </p>
        <p>
          La recuperación de contraseña todavía no está disponible. Guardá tus
          credenciales en un lugar seguro.
        </p>
      </div>
      <Link
        className="mt-10 inline-flex min-h-11 items-center text-primary underline underline-offset-4"
        href="/register"
      >
        Volver a crear cuenta
      </Link>
    </main>
  );
}
