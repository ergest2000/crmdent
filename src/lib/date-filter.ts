import type { DateRange } from "@/components/dashboard/DashboardDateFilter";

/** Check if a date string or Date falls within a DateRange */
export function isInRange(date: string | Date, range: DateRange): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d >= range.from && d <= range.to;
}

/** Get a label for the active period in Albanian */
export function periodLabel(preset: string): string {
  switch (preset) {
    case "today": return "Sot";
    case "week": return "Këtë javë";
    case "month": return "Këtë muaj";
    case "year": return "Këtë vit";
    default: return "Personalizuar";
  }
}
