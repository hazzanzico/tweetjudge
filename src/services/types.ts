export type TransactionStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export interface ContractCall {
  address: string;
  functionName: string;
  args: string[];
  account?: string;
  value?: number;
}