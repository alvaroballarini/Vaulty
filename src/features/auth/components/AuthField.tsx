"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AuthFieldProps {
  label: string;
  type?: string;
  name: string;
  placeholder?: string;
  icon: LucideIcon;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

export function AuthField({
  label,
  type = "text",
  name,
  placeholder,
  icon: Icon,
  autoComplete,
  required,
  error,
  value,
  onChange,
}: AuthFieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id={id}
          name={name}
          maxLength={isPassword ? 128 : name === "name" ? 100 : 254}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-12 w-full rounded-lg border bg-background pl-11 pr-11 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground",
            "focus:border-ring focus:ring-2 focus:ring-ring/30",
            error ? "border-destructive" : "border-input",
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-0.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? (
              <EyeOff className="size-[18px]" />
            ) : (
              <Eye className="size-[18px]" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
