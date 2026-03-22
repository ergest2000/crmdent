import { cn } from "@/lib/utils";
import { statusLabels } from "@/lib/mock-data";

const statusStyles: Record<string, string> = {
  confirmed: "bg-clinical-50 text-clinical-900",
  pending: "bg-amber-50 text-amber-800",
  "in-treatment": "bg-blue-50 text-blue-800",
  completed: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-red-50 text-red-800",
  active: "bg-clinical-50 text-clinical-900",
  suspended: "bg-amber-50 text-amber-800",
  archived: "bg-secondary text-muted-foreground",
  paid: "bg-emerald-50 text-emerald-800",
  partial: "bg-amber-50 text-amber-800",
  unpaid: "bg-secondary text-muted-foreground",
  overdue: "bg-red-50 text-red-800",
  draft: "bg-secondary text-muted-foreground",
  paused: "bg-amber-50 text-amber-800",
  "on-leave": "bg-blue-50 text-blue-800",
  inactive: "bg-secondary text-muted-foreground",
  sent: "bg-emerald-50 text-emerald-800",
  failed: "bg-red-50 text-red-800",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        statusStyles[status] || "bg-secondary text-muted-foreground"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
