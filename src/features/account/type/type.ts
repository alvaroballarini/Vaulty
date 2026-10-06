export interface accountType {
  id: string;
  userId: string;
  name: string;
  type: "BANK" | "CASH" | "CREDIT";
  balance?: number;
}
