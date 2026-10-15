import Link from "next/link";
import { VaultyLogo } from "@/components/VaultyLogo";
import { AuthAside } from "./AuthAside";
export function AuthLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1fr_1fr]">
      <AuthAside />
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/login"
            className="mb-12 inline-block lg:hidden"
            aria-label="Vaulty, inicio de sesión"
          >
            <VaultyLogo />
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mb-8 mt-3 text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
          {children}
        </div>
      </div>
    </main>
  );
}
