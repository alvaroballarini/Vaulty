"use server";

import getCurrentUser from "@/features/auth/service/getCurrentUser";
import deleteTransactionDb from "../data/delete";

async function deleteTransactionService(id: string) {
  const auth = await getCurrentUser();
  if (!auth.authenticated) {
    throw new Error("User not authenticated");
  }

  // Do not send Prisma Decimal instances across the server-action boundary.
  await deleteTransactionDb({ userId: auth.session.userId, id });
}

export default deleteTransactionService;
