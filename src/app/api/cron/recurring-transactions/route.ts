import { NextResponse } from "next/server";
import { processRecurringTransactions } from "@/features/RecurringTransaction/service/processRecurringTransactions";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const data = await processRecurringTransactions();
  return NextResponse.json(data);
}
