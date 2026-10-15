import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { RegisterForm } from "@/features/auth/components/registerForm";
export const metadata = { title: "Crear cuenta — Vaulty" };
export default function RegisterPage() {
  return (
    <AuthLayout
      title="Empezá a ordenar tu dinero."
      description="Creá tu cuenta y registrá tu primer movimiento."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
