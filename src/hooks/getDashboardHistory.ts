import { UnauthorizedError } from "@/features/auth/types/authType";
import { DashboardType } from "@/features/dashboard/type";

export default async function getDashboardHistory(): Promise<Pick<DashboardType, "historyMonthly">> {
  try {
    const res = await fetch("/api/dashboard/history", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (res.status === 401) {
      throw new UnauthorizedError();
    }
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}