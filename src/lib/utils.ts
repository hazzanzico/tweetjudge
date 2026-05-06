import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case 'High Risk': return 'text-red-500';
    case 'Moderate Risk': return 'text-orange-500';
    case 'Low Risk': return 'text-emerald-500';
    case 'Safe': return 'text-blue-500';
    default: return 'text-gray-400';
  }
}
