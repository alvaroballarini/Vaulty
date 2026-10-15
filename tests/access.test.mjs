import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./load-typescript.mjs";
const { loginSchema } = loadTypeScript("src/features/auth/types/schemaAuth.ts");
const { createUserSchema } = loadTypeScript(
  "src/features/user/types/schemaUser.ts",
);
test("access normalizes emails and enforces registration boundaries on the server", () => {
  assert.equal(
    loginSchema.parse({ email: "  PERSON@Example.com ", password: "existing" })
      .email,
    "person@example.com",
  );
  assert.equal(
    createUserSchema.safeParse({
      email: "a@example.com",
      name: "  ",
      passwordHash: "password1",
    }).success,
    false,
  );
  for (const passwordHash of ["short", "x".repeat(129)])
    assert.equal(
      createUserSchema.safeParse({
        email: "a@example.com",
        name: "Ana",
        passwordHash,
      }).success,
      false,
    );
  assert.equal(
    createUserSchema.parse({
      email: "  ANA@example.com ",
      name: " Ana ",
      passwordHash: "password1",
    }).name,
    "Ana",
  );
});
function setup({ found = true, valid = true, sessionFails = false } = {}) {
  const cookies = [],
    sessions = [],
    lookups = [];
  const actions = loadTypeScript("src/features/auth/service/auth.service.ts", {
    "@/features/user/data/find": {
      default: async (email) => {
        lookups.push(email);
        return found ? { id: "owner", password: "hash" } : null;
      },
    },
    "../data/createSession": {
      default: async (data) => {
        if (sessionFails) throw new Error("unavailable");
        sessions.push(data);
      },
    },
    "next/headers": {
      cookies: async () => ({ set: (cookie) => cookies.push(cookie) }),
    },
    argon2: { default: { verify: async () => valid } },
    "node:crypto": {
      default: { randomBytes: () => Buffer.from("random-token") },
    },
    "./invalidateSession": { default: async () => {} },
    "../../user/data/create": { default: async () => ({ id: "new-owner" }) },
  });
  return { ...actions, cookies, sessions, lookups };
}
test("remember option controls persistence and every session cookie is httpOnly", async () => {
  for (const remember of [true, false]) {
    const mock = setup();
    assert.equal(
      (
        await mock.default({
          email: " ANA@example.com ",
          password: "password1",
          remember,
        })
      ).ok,
      true,
    );
    assert.equal(mock.lookups[0], "ana@example.com");
    const cookie = mock.cookies[0];
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.sameSite, "lax");
    assert.equal(cookie.path, "/");
    assert.equal(Boolean(cookie.expires), remember);
    const hours = (mock.sessions[0].expiresAt - Date.now()) / 3600000;
    assert.ok(hours > (remember ? 719 : 11) && hours <= (remember ? 720 : 12));
  }
});
test("incorrect credentials produce the same message and never create sessions", async () => {
  const a = setup({ found: false }),
    b = setup({ valid: false });
  const input = { email: "a@example.com", password: "wrong" };
  assert.deepEqual(await a.default(input), await b.default(input));
  assert.equal(a.sessions.length + b.sessions.length, 0);
});
test("registration distinguishes account creation from a failed session", async () => {
  const mock = setup({ found: false, sessionFails: true });
  const result = await mock.registerService({
    email: "a@example.com",
    name: "Ana",
    passwordHash: "password1",
  });
  assert.equal(result.ok, false);
  assert.match(result.error, /cuenta se creó/);
  assert.equal(mock.cookies.length, 0);
});
