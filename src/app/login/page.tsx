import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "@/features/auth/components/loginForm";
export const metadata = { title: "Iniciar sesión — Vaulty" };
export default function LoginPage() {
  return (
    <AuthLayout
      title="Volvé a tu espacio."
      description="Tus cuentas, movimientos y próximos pasos, en un solo lugar."
    >
      <LoginForm />
    </AuthLayout>
  );
}
