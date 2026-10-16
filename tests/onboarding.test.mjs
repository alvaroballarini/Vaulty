import test from "node:test";
import assert from "node:assert/strict";
import { loadTypeScript } from "./load-typescript.mjs";

test("tour acknowledgement only updates the authenticated user and preserves the first date", async () => {
  const calls = [];
  const { markProductTourSeen } = loadTypeScript(
    "src/features/onboarding/service/markProductTourSeen.ts",
    {
      "@/features/auth/service/getCurrentUser": {
        default: async () => ({
          authenticated: true,
          session: { userId: "owner" },
        }),
      },
      "@/lib/prisma": {
        default: {
          user: {
            updateMany: async (args) => {
              calls.push(args);
              return { count: 0 };
            },
          },
        },
      },
    },
  );
  assert.equal((await markProductTourSeen()).ok, true);
  assert.deepEqual(calls[0].where, { id: "owner", productTourSeenAt: null });
  assert.ok(calls[0].data.productTourSeenAt instanceof Date);
});

test("unauthenticated visits cannot acknowledge a tour and database failures are recoverable", async () => {
  for (const authenticated of [false, true]) {
    let writes = 0;
    const { markProductTourSeen } = loadTypeScript(
      "src/features/onboarding/service/markProductTourSeen.ts",
      {
        "@/features/auth/service/getCurrentUser": {
          default: async () => ({
            authenticated,
            session: { userId: "owner" },
          }),
        },
        "@/lib/prisma": {
          default: {
            user: {
              updateMany: async () => {
                writes++;
                throw new Error("offline");
              },
            },
          },
        },
      },
    );
    assert.deepEqual(await markProductTourSeen(), { ok: false });
    assert.equal(writes, authenticated ? 1 : 0);
  }
});

test("tour receipts stay isolated by user even when browser storage is unavailable", () => {
  const { readTourReceipt, writeTourReceipt } = loadTypeScript(
    "src/features/onboarding/tour-storage.ts",
  );
  writeTourReceipt("first", "pending");
  assert.equal(readTourReceipt("first"), "pending");
  assert.equal(readTourReceipt("second"), null);
  writeTourReceipt("first", "synced");
  assert.equal(readTourReceipt("first"), "synced");
});

test("tour cards remain inside narrow, tablet, landscape and desktop viewports", () => {
  const { getTourLayout } = loadTypeScript(
    "src/features/onboarding/tour-layout.ts",
  );
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
    { width: 1440, height: 1000 },
  ]) {
    for (const target of [
      null,
      { left: 16, top: 24, width: viewport.width - 32, height: 500 },
      { left: 900, top: 750, width: 200, height: 100 },
    ]) {
      const { card } = getTourLayout(target, viewport, 300);
      assert.ok(card.left >= 16 && card.top >= 16);
      assert.ok(card.left + card.width <= viewport.width - 16);
      assert.ok(card.top + 300 <= viewport.height - 16);
    }
  }
});

test("a desktop without side space keeps the spotlight above the fallback card", () => {
  const { getTourLayout } = loadTypeScript(
    "src/features/onboarding/tour-layout.ts",
  );
  const { card, spotlight } = getTourLayout(
    { left: 250, top: 60, width: 500, height: 400 },
    { width: 1100, height: 600 },
    300,
  );
  assert.ok(spotlight.height > 0);
  assert.ok(spotlight.top + spotlight.height < card.top);
});
