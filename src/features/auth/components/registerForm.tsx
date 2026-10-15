"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { User, Mail, Lock, ArrowRight, LoaderCircle } from "lucide-react";
import { registerService } from "../service/auth.service";
import { createUserSchema } from "@/features/user/types/schemaUser";
import { AuthField } from "./AuthField";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const router = useRouter();
  const cache = useQueryClient();
  const ref = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError("");
    const parsed = createUserSchema.safeParse({
      name,
      email,
      passwordHash: password,
    });
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      requestAnimationFrame(() =>
        ref.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await registerService(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      cache.clear();
      router.replace("/");
      router.refresh();
    } catch {
      setError(
        "No pudimos conectarnos. Tus datos siguen acá; comprobá tu conexión y reintentá.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <form ref={ref} onSubmit={submit} className="space-y-5" noValidate>
      <fieldset disabled={loading} className="space-y-5">
        <legend className="sr-only">Crear tu cuenta</legend>
        <AuthField
          label="Tu nombre"
          name="name"
          icon={User}
          autoComplete="name"
          placeholder="Cómo querés que te llamemos"
          value={name}
          onChange={setName}
          error={errors.name}
          required
        />
        <AuthField
          label="Correo electrónico"
          name="email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
          required
        />
        <AuthField
          label="Contraseña"
          name="password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          placeholder="Al menos 8 caracteres"
          value={password}
          onChange={setPassword}
          error={errors.passwordHash}
          required
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Usá entre 8 y 128 caracteres. La recuperación de contraseña estará
          disponible más adelante.
        </p>
        {error && (
          <p role="alert" className="vaulty-error">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full justify-between px-4"
        >
          {loading ? "Creando cuenta…" : "Crear mi cuenta"}
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </Button>
      </fieldset>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Empezás con cuentas y categorías listas para tu primer movimiento.{" "}
        <Link
          href="/privacidad"
          className="text-primary underline underline-offset-4"
        >
          Cómo se guardan tus datos
        </Link>
        .
      </p>
      <p className="border-t border-border pt-4 text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center font-medium text-primary hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}
