"use server";

import getCurrentUser from "@/features/auth/service/getCurrentUser";
import prisma from "@/lib/prisma";

export async function markProductTourSeen() {
  try {
    const auth = await getCurrentUser();
    if (!auth.authenticated) return { ok: false } as const;
    const seenAt = new Date();
    // Idempotent: replaying the tour must not overwrite its first appearance.
    await prisma.user.updateMany({
      where: { id: auth.session.userId, productTourSeenAt: null },
      data: { productTourSeenAt: seenAt },
    });
    return { ok: true, seenAt: seenAt.toISOString() } as const;
  } catch {
    return { ok: false } as const;
  }
}
