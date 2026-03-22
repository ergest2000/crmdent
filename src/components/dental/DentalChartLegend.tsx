import { conditionColors, conditionLabels } from "./ToothSVG";
import { type ToothCondition } from "@/stores/patient-store";

const conditions: ToothCondition[] = ["healthy", "caries", "filling", "crown", "implant", "root-canal", "extraction", "in-treatment"];

export function DentalChartLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {conditions.map((key) => (
        <div key={key} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm border border-border/50"
            style={{ backgroundColor: conditionColors[key] }}
          />
          <span className="text-[11px] text-muted-foreground">{conditionLabels[key]}</span>
        </div>
      ))}
    </div>
  );
}
