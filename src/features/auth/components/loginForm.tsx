"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, Lock, ArrowRight, LoaderCircle } from "lucide-react";
import loginService from "../service/auth.service";
import { loginSchema } from "../types/schemaAuth";
import { AuthField } from "./AuthField";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const cache = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError("");
    const parsed = loginSchema.safeParse({ email, password, remember });
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
        formRef.current
          ?.querySelector<HTMLInputElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const result = await loginService(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      cache.clear();
      router.replace("/");
      router.refresh();
    } catch {
      setError(
        "No pudimos conectarnos. Comprobá tu conexión y volvé a intentar.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <form ref={formRef} onSubmit={submit} className="space-y-5" noValidate>
      <fieldset disabled={loading} className="space-y-5">
        <legend className="sr-only">Datos de acceso</legend>
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
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          onChange={setPassword}
          error={errors.password}
          required
        />
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="size-4 accent-primary"
          />
          Mantener mi sesión por 30 días
        </label>
        {error && (
          <p role="alert" className="vaulty-error">
            {error}
          </p>
        )}
        <Button
          className="h-12 w-full justify-between px-4"
          type="submit"
          disabled={loading}
        >
          {loading ? "Iniciando sesión…" : "Iniciar sesión"}
          {loading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </Button>
      </fieldset>
      <div className="border-t border-border pt-5">
        <button
          type="button"
          disabled
          aria-describedby="recovery-note"
          className="min-h-11 text-sm text-muted-foreground disabled:cursor-not-allowed"
        >
          Recuperar contraseña{" "}
          <span className="ml-2 rounded-md border border-border px-2 py-1 text-xs">
            Próximamente
          </span>
        </button>
        <p
          id="recovery-note"
          className="mt-1 text-xs leading-relaxed text-muted-foreground"
        >
          La recuperación todavía no está disponible. Guardá tu contraseña en un
          lugar seguro.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        ¿Primera vez en Vaulty?{" "}
        <Link
          href="/register"
          className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
        >
          Creá tu cuenta
        </Link>
      </p>
    </form>
  );
}
