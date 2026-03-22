import { useState } from "react";
import { type DentalRecord, type ToothCondition, type ToothSurface } from "@/stores/patient-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

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

const treatmentOptions: { value: string; label: string }[] = [
  { value: "mbushje-kompozite", label: "Mbushje kompozite" },
  { value: "mbushje-amalgame", label: "Mbushje amalgame" },
  { value: "pastrim", label: "Pastrim profesional" },
  { value: "trajtim-kanali", label: "Trajtim kanali" },
  { value: "kurore-porcelani", label: "Kurorë porcelani" },
  { value: "kurore-zirkon", label: "Kurorë zirkoni" },
  { value: "nxjerrje", label: "Nxjerrje" },
  { value: "implant", label: "Implant" },
  { value: "proteze", label: "Protezë" },
  { value: "ortodonci", label: "Ortodonci" },
  { value: "zbardh", label: "Zbardhje" },
  { value: "tjeter", label: "Tjetër" },
];

const conditions: ToothCondition[] = ["healthy", "caries", "filling", "crown", "implant", "root-canal", "extraction", "in-treatment"];

interface Props {
  toothNumber: number;
  toothLocation: string;
  selectedSurface: ToothSurface | null;
  onSurfaceSelect: (s: ToothSurface | null) => void;
  records: DentalRecord[];
  staff: { id: string; firstName: string; lastName: string }[];
  onSave: (data: {
    condition: ToothCondition;
    surface?: ToothSurface;
    dentist: string;
    notes?: string;
    treatment?: string;
    cost?: number;
  }) => void;
  onClose: () => void;
}

export function ToothTreatmentPanel({ toothNumber, toothLocation, records, staff, onSave, onClose }: Props) {
  const [condition, setCondition] = useState<ToothCondition>("caries");
  const [treatment, setTreatment] = useState("");
  const [dentist, setDentist] = useState(staff[0] ? `Dr. ${staff[0].lastName}` : "Dr. Shala");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");

  const isUpper = Math.floor(toothNumber / 10) <= 2;

  const handleSubmit = () => {
    const selectedTreatment = treatmentOptions.find(t => t.value === treatment);
    onSave({
      condition,
      dentist,
      notes: notes || undefined,
      treatment: selectedTreatment?.label || treatment || undefined,
      cost: cost ? parseFloat(cost) : undefined,
    });
  };

  const today = new Date().toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="rounded-card border border-primary/20 bg-card shadow-elevated overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/30">
        <h4 className="text-xs font-semibold text-foreground">
          🦷 Dhëmbi #{toothNumber}
        </h4>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Tooth illustration + info */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-muted/10">
        <svg viewBox="0 0 60 80" className="w-10 h-14 shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path
            d={isUpper
              ? "M22,45 C20,55 19,65 25,75 C27,78 30,79 30,79 C30,79 33,78 35,75 C41,65 40,55 38,45 Z"
              : "M22,35 C20,25 19,15 25,5 C27,2 30,1 30,1 C30,1 33,2 35,5 C41,15 40,25 38,35 Z"
            }
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="1.2"
          />
          <path
            d={isUpper
              ? "M16,15 C13,22 15,34 18,40 C22,46 26,48 30,48 C34,48 38,46 42,40 C45,34 47,22 44,15 C41,8 36,5 30,5 C24,5 19,8 16,15 Z"
              : "M16,65 C13,58 15,46 18,40 C22,34 26,32 30,32 C34,32 38,34 42,40 C45,46 47,58 44,65 C41,72 36,75 30,75 C24,75 19,72 16,65 Z"
            }
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
          />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">#{toothNumber}</p>
          <p className="text-[11px] text-muted-foreground truncate">{toothLocation}</p>
          {records.length > 0 && (
            <p className="text-[10px] text-primary font-medium mt-0.5">{records.length} trajtim{records.length > 1 ? "e" : ""}</p>
          )}
        </div>
      </div>

      {/* Form fields stacked vertically */}
      <div className="p-4 space-y-3">
        {/* Problem */}
        <div>
          <Label className="text-[11px] text-muted-foreground">Zgjidhni problemin</Label>
          <Select value={condition} onValueChange={(v) => setCondition(v as ToothCondition)}>
            <SelectTrigger className="h-8 mt-1 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {conditions.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">{conditionLabels[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Treatment */}
        <div>
          <Label className="text-[11px] text-muted-foreground">Zgjidhni trajtimin</Label>
          <Select value={treatment} onValueChange={setTreatment}>
            <SelectTrigger className="h-8 mt-1 text-xs"><SelectValue placeholder="Zgjidh trajtimin..." /></SelectTrigger>
            <SelectContent>
              {treatmentOptions.map((t) => (
                <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dentist + Cost in a row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[11px] text-muted-foreground">Mjeku</Label>
            <Select value={dentist} onValueChange={setDentist}>
              <SelectTrigger className="h-8 mt-1 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={`Dr. ${s.lastName}`} className="text-xs">Dr. {s.firstName} {s.lastName}</SelectItem>
                ))}
                {staff.length === 0 && <SelectItem value="Dr. Shala" className="text-xs">Dr. Shala</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground">Kostoja (€)</Label>
            <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" className="h-8 mt-1 text-xs font-mono" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label className="text-[11px] text-muted-foreground">Shënime shtesë</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Shkruani shënime..." rows={2} className="mt-1 text-xs resize-none" />
        </div>

        {/* Date + Status display */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>📅 {today}</span>
          {cost && <span className="font-mono font-semibold text-foreground">€{parseFloat(cost || "0").toFixed(2)}</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1 h-8 text-xs">Anulo</Button>
          <Button size="sm" onClick={handleSubmit} className="flex-1 h-8 text-xs gap-1.5">
            <Save className="h-3 w-3" />
            Ruaj
          </Button>
        </div>
      </div>

      {/* Mini history */}
      {records.length > 0 && (
        <div className="border-t border-border/50 px-4 py-2 bg-muted/10">
          <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Historia</p>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {[...records].reverse().slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                <span className="font-mono text-muted-foreground">{r.date}</span>
                <span className="font-medium text-foreground">{conditionLabels[r.condition]}</span>
                {r.cost && <span className="font-mono text-primary ml-auto">€{r.cost}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
