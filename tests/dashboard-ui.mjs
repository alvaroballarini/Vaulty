import { createRequire } from "node:module";
import fs from "node:fs";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const output = "output/verification";
fs.mkdirSync(output, { recursive: true });
const accounts = [
  {
    id: "cm000000000000000000000001",
    userId: "demo",
    name: "Banco",
    type: "BANK",
    balance: 680500,
  },
  {
    id: "cm000000000000000000000002",
    userId: "demo",
    name: "Mercado Pago",
    type: "BANK",
    balance: 520300,
  },
  {
    id: "cm000000000000000000000003",
    userId: "demo",
    name: "Efectivo",
    type: "CASH",
    balance: 45000,
  },
];
const categories = [
  {
    id: "cm000000000000000000000011",
    name: "Alimentación",
    type: "EXPENSE",
    icon: "Utensils",
    color: "#34d399",
  },
  {
    id: "cm000000000000000000000012",
    name: "Transporte",
    type: "EXPENSE",
    icon: "Car",
    color: "#eabb62",
  },
  {
    id: "cm000000000000000000000013",
    name: "Ocio",
    type: "EXPENSE",
    icon: "Gamepad2",
    color: "#94dbc0",
  },
  {
    id: "cm000000000000000000000014",
    name: "Sueldo",
    type: "INCOME",
    icon: "Wallet",
    color: "#34d399",
  },
];
const transactions = ["Supermercado", "SUBE", "Sueldo"].map(
  (description, i) => ({
    id: `cm00000000000000000000002${i}`,
    accountId: accounts[i].id,
    account: accounts[i],
    categoryId: categories[i === 2 ? 3 : i].id,
    category: categories[i === 2 ? 3 : i],
    description,
    amount: [28450, 4800, 850000][i],
    type: i === 2 ? "INCOME" : "EXPENSE",
    date: `2026-10-0${6 - i}T15:00:00Z`,
  }),
);
const dashboard = {
  user: {
    id: "demo",
    name: "Persona de prueba",
    email: "demo@example.test",
    productTourSeenAt: null,
  },
  asOf: "2026-10-06T15:00:00Z",
  totalBalance: 1245800,
  totalPrevBalance: 920000,
  metrics: {
    income: { amount: 850000 },
    expense: { amount: 524200 },
    savings: { amount: 325800 },
  },
  accounts,
  categories,
  transactions,
  budgetProgress: [
    {
      categoryId: categories[0].id,
      categoryName: "Alimentación",
      limit: 150000,
      spent: 130500,
      percentage: 87,
      isOverBudget: false,
    },
  ],
  paymentOutlook: {
    through: "2026-10-20",
    afterPayments: 924400,
    pendingExpenses: 321400,
    needsReview: false,
    upcoming: [
      {
        id: "internet",
        description: "Internet",
        date: "2026-10-08T15:00:00Z",
        amount: 35000,
        type: "EXPENSE",
      },
      {
        id: "visa",
        description: "Tarjeta Visa",
        date: "2026-10-10T15:00:00Z",
        amount: 286400,
        type: "EXPENSE",
      },
      {
        id: "salary",
        description: "Sueldo",
        date: "2026-10-15T15:00:00Z",
        amount: 850000,
        type: "INCOME",
      },
    ],
  },
};
const months = ["may", "jun", "jul", "ago", "sept", "oct"].map((label, i) => ({
  monthKey: `2026-${String(i + 5).padStart(2, "0")}`,
  label: label + " 2026",
  accumulatedBalance: [680000, 720000, 1000000, 930000, 1030000, 1245800][i],
  income: 850000,
  expense: 524200,
  netChange: 325800,
}));
const history = {
  historyMonthly: { last6Months: months, lastYear: months, last3Years: months },
};
const browser = await chromium.launch({
  channel: process.env.BROWSER_CHANNEL || "chromium",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
  reducedMotion: "reduce",
});
await context.addCookies([
  {
    name: "session",
    value: "isolated-ui-test",
    domain: "127.0.0.1",
    path: "/",
  },
]);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.stack || error.message));
let mode = "normal";
let posts = 0;
let actionMode = "failure";
let dashboardReads = 0;
let onboardingPhase = true;
let tourSaveFails = false;
let tourWrites = 0;
await page.route("**/*", async (route) => {
  const request = route.request();
  const pathname = new URL(request.url()).pathname;
  if (request.method() === "POST") {
    if (onboardingPhase) {
      tourWrites++;
      if (tourSaveFails)
        return route.fulfill({ status: 503, body: "Test: offline" });
      dashboard.user.productTourSeenAt = "2026-10-16T12:00:00.000Z";
      return route.fulfill({
        status: 200,
        contentType: "text/x-component",
        body: '0:{"a":"$@1","f":null,"b":"test"}\n1:{"ok":true,"seenAt":"2026-10-16T12:00:00.000Z"}\n',
      });
    }
    posts++;
    if (actionMode === "success")
      return route.fulfill({
        status: 200,
        contentType: "text/x-component",
        body: '0:{"a":"$@1","f":null,"b":"test"}\n1:{"ok":true,"id":"test-saved"}\n',
      });
    return route.fulfill({ status: 503, body: "Test: unavailable" });
  }
  if (!pathname.startsWith("/api/")) return route.continue();
  let data;
  if (pathname === "/api/dashboard") {
    dashboardReads++;
    if (mode === "error") return route.fulfill({ status: 500, body: "{}" });
    data =
      mode === "empty"
        ? {
            ...dashboard,
            totalBalance: 0,
            accounts: [],
            transactions: [],
            budgetProgress: [],
            metrics: {
              income: { amount: 0 },
              expense: { amount: 0 },
              savings: { amount: 0 },
            },
            paymentOutlook: {
              ...dashboard.paymentOutlook,
              afterPayments: 0,
              upcoming: [],
            },
          }
        : dashboard;
  } else if (pathname === "/api/dashboard/history")
    data =
      mode === "empty"
        ? { historyMonthly: { last6Months: [], lastYear: [], last3Years: [] } }
        : history;
  else if (pathname === "/api/categories")
    data = mode === "empty" ? [] : categories;
  else if (pathname === "/api/accounts")
    data = mode === "empty" ? [] : accounts;
  else if (pathname === "/api/notification")
    data = { items: [], unreadCount: 0 };
  else if (pathname === "/api/transactions")
    data = { items: transactions, total: 23, pageSize: 20 };
  else if (pathname === "/api/schedules")
    data = [
      {
        id: "cm000000000000000000000031",
        description: "Internet",
        expectedAmount: 35000,
        type: "EXPENSE",
        frequency: "MONTHLY",
        dayOfMonth: 8,
        dayOfWeek: null,
        nextRunAt: "2026-10-08T15:00:00Z",
        isActive: true,
        accountId: accounts[0].id,
        categoryId: categories[0].id,
        account: accounts[0],
        category: categories[0],
      },
    ];
  else throw new Error("Unmocked API: " + pathname);
  return route.fulfill({ json: data });
});
try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const tour = page.locator("[data-product-tour]");
  const nextStep = () =>
    tour.getByRole("button", { name: "Siguiente", exact: true }).click();
  async function checkTourLayout() {
    await page.waitForFunction(() => {
      const card = document
        .querySelector("[data-product-tour]")
        ?.getBoundingClientRect();
      const spot = document
        .querySelector("[data-tour-spotlight]")
        ?.getBoundingClientRect();
      return (
        card &&
        spot &&
        spot.height > 0 &&
        card.top >= 0 &&
        card.left >= 0 &&
        card.right <= innerWidth &&
        card.bottom <= innerHeight &&
        (card.right <= spot.left ||
          card.left >= spot.right ||
          card.top >= spot.bottom ||
          card.bottom <= spot.top)
      );
    });
    // Let scrolling, measurement and the browser paint settle before captures.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
        ),
    );
    assert.equal(
      await tour.evaluate((el) => {
        const card = el.getBoundingClientRect();
        const title = el.querySelector("h2")?.getBoundingClientRect();
        const target = document
          .querySelector(`[data-tour="${el.dataset.tourTarget}"]`)
          ?.getBoundingClientRect();
        const spot = document
          .querySelector("[data-tour-spotlight]")
          ?.getBoundingClientRect();
        return (
          title &&
          title.top >= card.top &&
          title.bottom <= card.bottom &&
          target &&
          spot &&
          Math.abs(spot.top - Math.max(8, target.top - 6)) < 2 &&
          [...el.querySelectorAll("button")].every((button) => {
            const rect = button.getBoundingClientRect();
            return (
              rect.top >= card.top &&
              rect.bottom <= card.bottom &&
              rect.left >= card.left &&
              rect.right <= card.right
            );
          })
        );
      }),
      true,
      "title and every tour control remain visible; spotlight follows the current target",
    );
  }
  await tour
    .getByRole("heading", { name: "Tu dinero, de un vistazo" })
    .waitFor();
  await checkTourLayout();
  await page.screenshot({ path: output + "/tour-desktop.png" });
  await nextStep();
  await tour.getByRole("heading", { name: "Organizá tus cuentas" }).waitFor();
  await tour.getByRole("button", { name: "Atrás", exact: true }).click();
  await tour
    .getByRole("heading", { name: "Tu dinero, de un vistazo" })
    .waitFor();
  for (let i = 0; i < 6; i++) {
    await nextStep();
    await checkTourLayout();
  }
  await tour.getByRole("button", { name: "Empezar", exact: true }).click();
  await tour.waitFor({ state: "hidden" });
  assert.equal(tourWrites, 1);
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await tour.count(), 0, "a completed tour must not reappear");
  // Server state survives clearing browser storage (equivalent to a new device).
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await tour.count(),
    0,
    "server receipt prevents a second automatic tour",
  );
  await page.goto("http://127.0.0.1:3000/cuentas", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Mi perfil", exact: true }).click();
  await page.getByRole("menuitem", { name: "Ver recorrido guiado" }).click();
  await tour
    .getByRole("heading", { name: "Tu dinero, de un vistazo" })
    .waitFor();
  await page.keyboard.press("Escape");
  await tour.waitFor({ state: "hidden" });
  assert.equal(
    await page
      .getByRole("button", { name: "Mi perfil", exact: true })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  assert.equal(tourWrites, 1, "replaying does not rewrite the receipt");
  // A second user in the same browser gets their own tour. A failed acknowledgement
  // is kept locally, and then retried without displaying the tour again.
  dashboard.user = {
    ...dashboard.user,
    id: "tour-mobile",
    productTourSeenAt: null,
  };
  tourSaveFails = true;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await tour
    .getByRole("heading", { name: "Tu dinero, de un vistazo" })
    .waitFor();
  for (let i = 0; i < 7; i++) {
    await checkTourLayout();
    if (i === 0 || i === 2)
      await page.screenshot({ path: output + `/tour-mobile-${i + 1}.png` });
    if (i < 6) await nextStep();
  }
  await page.setViewportSize({ width: 320, height: 640 });
  await checkTourLayout();
  await page.screenshot({ path: output + "/tour-narrow.png" });
  await tour.getByRole("button", { name: "Omitir recorrido" }).click();
  tourSaveFails = false;
  const writesBeforeRetry = tourWrites;
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(
    await tour.count(),
    0,
    "skipped tour must not reappear after a failed save",
  );
  assert.equal(
    tourWrites,
    writesBeforeRetry + 1,
    "pending acknowledgement is retried",
  );
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1024, height: 768 },
    { width: 1100, height: 600 },
  ]) {
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "Mi perfil", exact: true }).click();
    await page.getByRole("menuitem", { name: "Ver recorrido guiado" }).click();
    await tour
      .getByRole("heading", { name: "Tu dinero, de un vistazo" })
      .waitFor();
    for (let i = 0; i < 7; i++) {
      await checkTourLayout();
      if (i === 2) {
        await page.screenshot({ path: output + `/tour-${viewport.width}.png` });
      }
      if (i < 6) await nextStep();
    }
    await tour.getByRole("button", { name: "Empezar", exact: true }).click();
    await tour.waitFor({ state: "hidden" });
  }
  dashboard.user.id = "demo";
  onboardingPhase = false;
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.reload({ waitUntil: "networkidle" });
  console.log(
    "PASS: first entry, seven anchored steps, back/finish/skip/Escape, profile replay, per-user persistence, server receipt, offline retry and mobile tour. All writes mocked.",
  );
  await page
    .getByRole("heading", { name: "Registro rápido", exact: true })
    .waitFor();
  await page.screenshot({ path: output + "/desktop.png", fullPage: true });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
    "desktop overflow",
  );
  await page
    .getByRole("button", { name: "Ocultar importes", exact: true })
    .click();
  await page.getByText("Los importes están ocultos", { exact: true }).waitFor();
  assert.equal(await page.getByText("$ 1.245.800", { exact: true }).count(), 0);
  await page
    .getByRole("button", { name: "Mostrar importes", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Cuentas", exact: true })
    .first()
    .click();
  await page
    .getByRole("heading", { name: "Tus cuentas", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Agregar cuenta", exact: true })
    .click();
  await page.getByLabel("Nombre de la cuenta", { exact: true }).fill("   ");
  await page
    .getByRole("button", { name: "Guardar cuenta", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Ingresá un nombre para la cuenta." })
    .waitFor();
  await page
    .getByLabel("Nombre de la cuenta", { exact: true })
    .fill("Cuenta de prueba");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("link", { name: "Inicio", exact: true }).first().click();
  await page.getByRole("button", { name: "Opciones de Supermercado" }).click();
  await page.getByRole("menuitem", { name: "Editar", exact: true }).click();
  const dialog = page.getByRole("dialog");
  assert.equal(
    await dialog.getByLabel("Monto · ARS", { exact: true }).inputValue(),
    "28.450",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Guardar gasto", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Ingresá un monto válido" })
    .waitFor();
  await page.getByLabel("Monto · ARS", { exact: true }).fill("18.500,50");
  await page.getByRole("button", { name: "Alimentación", exact: true }).click();
  await page
    .getByRole("button", { name: "Guardar gasto", exact: true })
    .click();
  await page
    .getByRole("alert")
    .filter({ hasText: "No pudimos confirmar el guardado" })
    .waitFor();
  assert.equal(
    await page.getByLabel("Monto · ARS", { exact: true }).inputValue(),
    "18.500,5",
  );
  assert.equal(posts, 1);
  actionMode = "success";
  const readsBeforeSave = dashboardReads;
  await page
    .getByRole("button", { name: "Guardar gasto", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector("input[inputmode=decimal]")?.value === "",
  );
  assert.ok(
    dashboardReads > readsBeforeSave,
    "successful save refreshes dashboard",
  );
  assert.equal(posts, 2);
  actionMode = "failure";
  await page.getByRole("button", { name: "Ingreso", exact: true }).click();
  await page.getByRole("button", { name: "Sueldo", exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Alimentación", exact: true })
      .count(),
    0,
  );
  await page.getByRole("button", { name: "Gasto", exact: true }).click();
  await page.getByLabel("Monto · ARS", { exact: true }).fill("");
  for (const width of [390, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    await page.reload({ waitUntil: "networkidle" });
    await page
      .getByRole("button", { name: "Alimentación", exact: true })
      .waitFor();
    await page.waitForFunction(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    await page.screenshot({
      path: output + `/width-${width}.png`,
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
      `overflow ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Más", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Presupuestos", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Presupuestos", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Definir presupuesto" }).click();
  await page.getByLabel("Límite mensual · ARS").fill("150.000");
  await page.screenshot({ path: output + "/budget-mobile.png" });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Seguir editando", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Límite mensual · ARS").inputValue(),
    "150.000",
  );
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page
    .getByRole("button", { name: "Descartar cambios", exact: true })
    .click();
  mode = "empty";
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page
    .getByText("Todavía no hay movimientos.", { exact: false })
    .waitFor();
  await page.screenshot({ path: output + "/empty-mobile.png", fullPage: true });
  assert.equal(
    await page
      .getByRole("button", { name: "Guardar gasto", exact: true })
      .isDisabled(),
    true,
  );
  mode = "error";
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("heading", { name: "No pudimos cargar tu espacio" })
    .waitFor();
  await page.screenshot({ path: output + "/error-mobile.png" });
  mode = "normal";
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await page
    .getByRole("heading", { name: "Registro rápido", exact: true })
    .waitFor();
  await page.getByRole("link", { name: "Registrar", exact: true }).click();
  await page
    .getByRole("heading", { name: "Registrar movimiento", exact: true })
    .waitFor();
  await page.screenshot({
    path: output + "/register-movement-mobile.png",
    fullPage: true,
  });
  await page.goto("http://127.0.0.1:3000/movimientos", {
    waitUntil: "networkidle",
  });
  await page.getByLabel("Buscar movimientos").fill("supermercado");
  await page
    .getByRole("button", { name: "Aplicar filtros", exact: true })
    .click();
  await page.getByRole("button", { name: "Siguiente", exact: true }).click();
  await page.getByText("23 movimientos · Página 2 de 2").waitFor();
  await page.screenshot({
    path: output + "/history-mobile.png",
    fullPage: true,
  });
  await page.goto("http://127.0.0.1:3000/presupuestos", {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("button", { name: "Editar presupuesto de Alimentación" })
    .click();
  assert.equal(
    await page.getByLabel("Límite mensual · ARS").inputValue(),
    "150.000",
  );
  await page.keyboard.press("Escape");
  await page.goto("http://127.0.0.1:3000/planificacion", {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("button", { name: "Editar Internet", exact: true })
    .click();
  assert.equal(
    await page.getByLabel("Concepto", { exact: true }).inputValue(),
    "Internet",
  );
  await page.getByLabel("Próxima fecha", { exact: true }).fill("2099-01-08");
  await page.screenshot({
    path: output + "/schedule-mobile.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Descartar cambios", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ocultar importes", exact: true })
    .click();
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Mostrar importes", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Mostrar importes", exact: true })
    .click();
  await context.clearCookies();
  await page.goto("http://127.0.0.1:3000/login", { waitUntil: "networkidle" });
  assert.equal(
    await page
      .getByRole("button", { name: /Recuperar contraseña/ })
      .isDisabled(),
    true,
  );
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await page.locator('input[aria-invalid="true"]').first().waitFor();
  await page.screenshot({ path: output + "/login-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: output + "/login-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Creá tu cuenta", exact: true }).click();
  await page
    .getByRole("heading", { name: "Empezá a ordenar tu dinero.", exact: true })
    .waitFor();
  await page.screenshot({
    path: output + "/register-desktop.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: successful save resets draft and refreshes data, responsive layouts, privacy, navigation, edit prefill, validation, failure draft preservation, type categories, empty/error/retry. No database writes.",
  );
} catch (error) {
  console.error(
    "UI state:",
    page.url(),
    await page.locator("body").innerText(),
    errors,
  );
  await page.screenshot({
    path: output + "/failure-current.png",
    fullPage: true,
  });
  throw error;
} finally {
  await browser.close();
}
