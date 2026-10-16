// A per-user fallback prevents repeated prompts while the server is offline.
// Pending acknowledgements are retried on the next workspace visit.
type TourReceipt = "pending" | "synced";
const receipts = new Map<string, TourReceipt>();
const keyFor = (userId: string) => `vaulty:${userId}:product-tour`;

export function readTourReceipt(userId: string): TourReceipt | null {
  try {
    const value = localStorage.getItem(keyFor(userId));
    if (value === "pending" || value === "synced") return value;
  } catch {
    // Private browsing can make storage unavailable; retain this session's state.
  }
  return receipts.get(userId) ?? null;
}

export function writeTourReceipt(userId: string, value: TourReceipt) {
  receipts.set(userId, value);
  try {
    localStorage.setItem(keyFor(userId), value);
  } catch {
    // Persistence on the account remains the primary source of truth.
  }
}
