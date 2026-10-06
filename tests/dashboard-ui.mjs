import { createRequire } from 'node:module';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = 'output/verification';
fs.mkdirSync(output, { recursive: true });
const accounts = [
 { id: 'cm000000000000000000000001', userId: 'demo', name: 'Banco', type: 'BANK', balance: 680500 },
 { id: 'cm000000000000000000000002', userId: 'demo', name: 'Mercado Pago', type: 'BANK', balance: 520300 },
 { id: 'cm000000000000000000000003', userId: 'demo', name: 'Efectivo', type: 'CASH', balance: 45000 },
];
const categories = [
 { id: 'cm000000000000000000000011', name: 'Alimentación', type: 'EXPENSE', icon: 'Utensils', color: '#34d399' },
 { id: 'cm000000000000000000000012', name: 'Transporte', type: 'EXPENSE', icon: 'Car', color: '#eabb62' },
 { id: 'cm000000000000000000000013', name: 'Ocio', type: 'EXPENSE', icon: 'Gamepad2', color: '#94dbc0' },
 { id: 'cm000000000000000000000014', name: 'Sueldo', type: 'INCOME', icon: 'Wallet', color: '#34d399' },
];
const transactions = ['Supermercado', 'SUBE', 'Sueldo'].map((description, i) => ({ id: `cm00000000000000000000002${i}`, accountId: accounts[i].id, account: accounts[i], categoryId: categories[i === 2 ? 3 : i].id, category: categories[i === 2 ? 3 : i], description, amount: [28450, 4800, 850000][i], type: i === 2 ? 'INCOME' : 'EXPENSE', date: `2026-10-0${6 - i}T15:00:00Z` }));
const dashboard = { user: { id: 'demo', name: 'Persona de prueba', email: 'demo@example.test' }, asOf: '2026-10-06T15:00:00Z', totalBalance: 1245800, totalPrevBalance: 920000, metrics: { income: { amount: 850000 }, expense: { amount: 524200 }, savings: { amount: 325800 } }, accounts, categories, transactions, budgetProgress: [{ categoryId: categories[0].id, categoryName: 'Alimentación', limit: 150000, spent: 130500, percentage: 87, isOverBudget: false }], paymentOutlook: { through: '2026-10-20', afterPayments: 924400, pendingExpenses: 321400, needsReview: false, upcoming: [{ id: 'internet', description: 'Internet', date: '2026-10-08T15:00:00Z', amount: 35000, type: 'EXPENSE' }, { id: 'visa', description: 'Tarjeta Visa', date: '2026-10-10T15:00:00Z', amount: 286400, type: 'EXPENSE' }, { id: 'salary', description: 'Sueldo', date: '2026-10-15T15:00:00Z', amount: 850000, type: 'INCOME' }] } };
const months = ['may', 'jun', 'jul', 'ago', 'sept', 'oct'].map((label, i) => ({ monthKey: `2026-${String(i+5).padStart(2, '0')}`, label: label + ' 2026', accumulatedBalance: [680000, 720000, 1000000, 930000, 1030000, 1245800][i], income: 850000, expense: 524200, netChange: 325800 }));
const history = { historyMonthly: { last6Months: months, lastYear: months, last3Years: months } };
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
await context.addCookies([{ name: 'session', value: 'isolated-ui-test', domain: '127.0.0.1', path: '/' }]);
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
let mode = 'normal';
let posts = 0;
await page.route('**/*', async route => {
 const request = route.request(); const pathname = new URL(request.url()).pathname;
 if (request.method() === 'POST') { posts++; return route.fulfill({ status: 503, body: 'Test: unavailable' }); }
 if (!pathname.startsWith('/api/')) return route.continue();
 let data;
 if (pathname === '/api/dashboard') {
   if (mode === 'error') return route.fulfill({ status: 500, body: '{}' });
   data = mode === 'empty' ? { ...dashboard, totalBalance: 0, accounts: [], transactions: [], budgetProgress: [], metrics: { income: { amount: 0 }, expense: { amount: 0 }, savings: { amount: 0 } }, paymentOutlook: { ...dashboard.paymentOutlook, afterPayments: 0, upcoming: [] } } : dashboard;
 } else if (pathname === '/api/dashboard/history') data = mode === 'empty' ? { historyMonthly: { last6Months: [], lastYear: [], last3Years: [] } } : history;
 else if (pathname === '/api/categories') data = mode === 'empty' ? [] : categories;
 else if (pathname === '/api/accounts') data = mode === 'empty' ? [] : accounts;
 else if (pathname === '/api/notification') data = { items: [], unreadCount: 0 };
 else throw new Error('Unmocked API: ' + pathname);
 return route.fulfill({ json: data });
});
try {
 await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
 await page.getByRole('heading', { name: 'Registro rápido', exact: true }).waitFor();
 await page.screenshot({ path: output + '/desktop.png', fullPage: true });
 assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'desktop overflow');
 await page.getByRole('button', { name: 'Ocultar importes', exact: true }).click();
 await page.getByText('Los importes están ocultos', { exact: true }).waitFor();
 assert.equal(await page.getByText('$ 1.245.800', { exact: true }).count(), 0);
 await page.getByRole('button', { name: 'Mostrar importes', exact: true }).click();
 await page.getByRole('button', { name: 'Cuentas', exact: true }).first().click();
 await page.getByRole('heading', { name: 'Tus cuentas', exact: true }).waitFor();
 await page.getByRole('button', { name: 'Agregar cuenta', exact: true }).click();
 await page.getByLabel('Nombre de la cuenta', { exact: true }).fill('Cuenta de prueba');
 await page.keyboard.press('Escape');
 await page.getByRole('button', { name: 'Opciones de Supermercado' }).click();
 await page.getByRole('menuitem', { name: 'Editar', exact: true }).click();
 const dialog = page.getByRole('dialog');
 assert.equal(await dialog.getByLabel('Monto · ARS', { exact: true }).inputValue(), '28.450');
 await page.keyboard.press('Escape');
 await page.getByRole('button', { name: 'Guardar gasto', exact: true }).click();
 await page.getByRole('alert').filter({ hasText: 'Ingresá un monto válido' }).waitFor();
 await page.getByLabel('Monto · ARS', { exact: true }).fill('18.500,50');
 await page.getByRole('button', { name: 'Alimentación', exact: true }).click();
 await page.getByRole('button', { name: 'Guardar gasto', exact: true }).click();
 await page.getByRole('alert').filter({ hasText: 'No pudimos confirmar el guardado' }).waitFor();
 assert.equal(await page.getByLabel('Monto · ARS', { exact: true }).inputValue(), '18.500,5');
 assert.equal(posts, 1);
 await page.getByRole('button', { name: 'Ingreso', exact: true }).click();
 await page.getByRole('button', { name: 'Sueldo', exact: true }).waitFor();
 assert.equal(await page.getByRole('button', { name: 'Alimentación', exact: true }).count(), 0);
 await page.getByRole('button', { name: 'Gasto', exact: true }).click();
 await page.getByLabel('Monto · ARS', { exact: true }).fill('');
 for (const width of [390, 768, 1024]) {
   await page.setViewportSize({ width, height: 844 });
   await page.reload({ waitUntil: 'networkidle' });
   await page.getByRole('button', { name: 'Alimentación', exact: true }).waitFor();
   await page.waitForFunction(() => document.documentElement.scrollWidth <= window.innerWidth);
   await page.screenshot({ path: output + `/width-${width}.png`, fullPage: true });
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `overflow ${width}`);
 }
 await page.setViewportSize({ width: 390, height: 844 });
 await page.getByRole('button', { name: 'Más', exact: true }).click();
 await page.getByRole('dialog').getByRole('button', { name: 'Presupuestos', exact: true }).click();
 await page.getByRole('heading', { name: 'Presupuestos de este mes' }).waitFor();
 await page.getByRole('button', { name: 'Definir presupuesto' }).click();
 await page.getByLabel('Límite mensual · ARS').fill('150.000');
 await page.screenshot({ path: output + '/budget-mobile.png' });
 await page.keyboard.press('Escape');
 mode = 'empty'; await page.reload({ waitUntil: 'networkidle' });
 await page.getByText('Todavía no hay movimientos.', { exact: false }).waitFor();
 await page.screenshot({ path: output + '/empty-mobile.png', fullPage: true });
 assert.equal(await page.getByRole('button', { name: 'Guardar gasto', exact: true }).isDisabled(), true);
 mode = 'error'; await page.reload({ waitUntil: 'networkidle' });
 await page.getByRole('heading', { name: 'No pudimos cargar tu resumen' }).waitFor();
 await page.screenshot({ path: output + '/error-mobile.png' });
 mode = 'normal'; await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
 await page.getByRole('heading', { name: 'Registro rápido', exact: true }).waitFor();
 assert.deepEqual(errors, []);
 console.log('PASS: responsive layouts, privacy, navigation, edit prefill, validation, failure draft preservation, type categories, empty/error/retry. No database writes.');
} finally { await browser.close(); }
