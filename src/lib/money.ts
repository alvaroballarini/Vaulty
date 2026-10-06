/** Accept ARS grouping and either decimal separator; reject malformed input. */
export function parseMoneyInput(input: string): number | null {
  const value = input.trim().replace(/^\$\s*/, "");
  let normalized: string;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(value)) {
    normalized = value.replaceAll(".", "").replace(",", ".");
  } else if (/^\d+(,\d{1,2})?$/.test(value)) {
    normalized = value.replace(",", ".");
  } else if (/^\d+\.\d{1,2}$/.test(value)) {
    normalized = value;
  } else return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 && amount <= 9999999999.99 ? amount : null;
}

export function formatMoneyInput(value: number): string {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value);
}
