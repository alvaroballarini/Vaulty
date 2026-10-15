"use server";

import findUserByEmail from "@/features/user/data/find";
import createSessionDb from "../data/createSession";
import { loginInput, loginSchema } from "../types/schemaAuth";
import { cookies } from "next/headers";
import argon2 from "argon2";
import crypto from "node:crypto";
import invalidateSession from "./invalidateSession";
import createUser from "../../user/data/create";
import {
  CreateUserInput,
  createUserSchema,
} from "@/features/user/types/schemaUser";

export type AuthActionResult = { ok: true } | { ok: false; error: string };

async function startSession(userId: string, remember: boolean) {
  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(
    Date.now() + (remember ? 30 * 24 : 12) * 60 * 60 * 1000,
  );
  await createSessionDb({ token, expiresAt, userId });
  const cookieStore = await cookies();
  cookieStore.set({
    name: "session",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember ? { expires: expiresAt } : {}),
  });
}

export default async function loginService(
  input: loginInput,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Revisá tu correo y contraseña." };
  try {
    const { email, password, remember } = parsed.data;
    const user = await findUserByEmail(email);
    if (!user || !(await argon2.verify(user.password, password)))
      return {
        ok: false,
        error:
          "El correo o la contraseña no coinciden. Revisalos e intentá nuevamente.",
      };
    await startSession(user.id, Boolean(remember));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "No pudimos iniciar sesión. Intentá nuevamente en unos instantes.",
    };
  }
}

export async function registerService(
  input: CreateUserInput,
): Promise<AuthActionResult> {
  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error:
        "Revisá tus datos. La contraseña debe tener entre 8 y 128 caracteres.",
    };
  try {
    if (await findUserByEmail(parsed.data.email))
      return {
        ok: false,
        error:
          "No pudimos crear la cuenta con esos datos. Si ya te registraste, iniciá sesión.",
      };
    const user = await createUser(parsed.data);
    try {
      await startSession(user.id, true);
    } catch {
      return {
        ok: false,
        error:
          "Tu cuenta se creó, pero no pudimos abrir la sesión. Iniciá sesión con tus datos.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "No pudimos crear la cuenta. Revisá los datos e intentá nuevamente; si ya tenés cuenta, iniciá sesión.",
    };
  }
}

export async function logoutService() {
  await invalidateSession();
}
