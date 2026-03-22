import { type DentalRecord, type ToothCondition } from "@/stores/patient-store";

const conditionLabels: Record<ToothCondition, string> = {
  healthy: "I shëndetshëm",
  caries: "Karies",
  filling: "Mbushje",
  crown: "Kurorë",
  implant: "Implant",
  "root-canal": "Trajtim kanali",
  extraction: "Nxjerrje",
  "in-treatment": "Në trajtim",
};

const conditionColors: Record<ToothCondition, string> = {
  healthy: "none",
  caries: "#ef4444",
  filling: "#3b82f6",
  crown: "#f97316",
  implant: "#a855f7",
  "root-canal": "#dc2626",
  extraction: "#9ca3af",
  "in-treatment": "#eab308",
};

const surfaceLabels: Record<string, string> = {
  mesial: "Mesial",
  distal: "Distal",
  buccal: "Bukale",
  lingual: "Linguale",
  occlusal: "Okluzale",
};

/** Get jaw location label from FDI number */
function getToothLocation(fdi: number): string {
  const quadrant = Math.floor(fdi / 10);
  const jaw = quadrant <= 2 ? "Nofulla e sipërme" : "Nofulla e poshtme";
  const side = quadrant === 1 || quadrant === 4 ? "djathtas" : "majtas";
  return `${jaw} – ${side}`;
}

interface Props {
  records: DentalRecord[];
}

export function DentalHistory({ records }: Props) {
  if (records.length === 0) return null;

  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <div className="border-t border-border/50 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Historia e trajtimeve dentare</p>
        {totalCost > 0 && (
          <p className="text-xs font-mono font-semibold text-foreground">Totali: €{totalCost.toFixed(2)}</p>
        )}
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {[...records].reverse().map((r, i) => (
          <div key={i} className="flex items-center gap-3 text-sm py-1.5 px-2 rounded-inner hover:bg-muted/30">
            <span className="font-mono text-muted-foreground w-8 shrink-0">#{r.toothNumber}</span>
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium text-white"
              style={{ backgroundColor: conditionColors[r.condition] }}
            >
              {conditionLabels[r.condition]}
            </span>
            {r.surface && (
              <span className="text-[11px] text-primary font-medium">{surfaceLabels[r.surface]}</span>
            )}
            {r.treatment && (
              <span className="text-xs text-foreground">{r.treatment}</span>
            )}
            <span className="text-[11px] text-muted-foreground">{getToothLocation(r.toothNumber)}</span>
            <span className="text-muted-foreground text-xs">{r.dentist} · {r.date}</span>
            {r.cost && <span className="text-xs font-mono text-foreground">€{r.cost}</span>}
            {r.notes && <span className="text-xs text-muted-foreground italic">— {r.notes}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
