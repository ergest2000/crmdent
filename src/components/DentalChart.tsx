import { useState, useMemo, useCallback } from "react";
import { Odontogram } from "react-odontogram";
import "react-odontogram/style.css";
import { usePatientStore, type ToothCondition, type ToothSurface } from "@/stores/patient-store";
import { useStaffStore } from "@/stores/staff-store";
import { toast } from "@/hooks/use-toast";
import { ToothTreatmentPanel } from "@/components/dental/ToothTreatmentPanel";

const conditionToColors: Record<ToothCondition, { fillColor: string; outlineColor: string; label: string }> = {
  healthy: { fillColor: "transparent", outlineColor: "transparent", label: "I shëndetshëm" },
  caries: { fillColor: "#ef4444", outlineColor: "#b91c1c", label: "Karies" },
  filling: { fillColor: "#3b82f6", outlineColor: "#1d4ed8", label: "Mbushje" },
  crown: { fillColor: "#f97316", outlineColor: "#c2410c", label: "Kurorë" },
  implant: { fillColor: "#a855f7", outlineColor: "#7e22ce", label: "Implant" },
  "root-canal": { fillColor: "#dc2626", outlineColor: "#991b1b", label: "Trajtim kanali" },
  extraction: { fillColor: "#6b7280", outlineColor: "#374151", label: "Nxjerrje" },
  "in-treatment": { fillColor: "#eab308", outlineColor: "#a16207", label: "Në trajtim" },
};

function toothId(fdi: number): string {
  return `teeth-${fdi}`;
}

function getToothLocation(fdi: number): string {
  const quadrant = Math.floor(fdi / 10);
  const jaw = quadrant <= 2 ? "Nofulla e sipërme" : "Nofulla e poshtme";
  const side = quadrant === 1 || quadrant === 4 ? "djathtas" : "majtas";
  return `${jaw} – ${side}`;
}

interface Props {
  patientId: string;
}

export function DentalChart({ patientId }: Props) {
  const patients = usePatientStore((s) => s.patients);
  const addDentalRecord = usePatientStore((s) => s.addDentalRecord);
  const allStaff = useStaffStore((s) => s.staff);
  const patient = useMemo(() => patients.find((p) => p.id === patientId), [patients, patientId]);
  const staff = useMemo(() => allStaff.filter((st) => st.role === "dentist"), [allStaff]);

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedSurface, setSelectedSurface] = useState<ToothSurface | null>(null);

  const getToothConditions = useCallback((n: number) =>
    patient ? patient.dentalRecords.filter((r) => r.toothNumber === n) : []
  , [patient]);

  const getPrimary = useCallback((n: number): ToothCondition => {
    const recs = getToothConditions(n);
    return recs.length > 0 ? recs[recs.length - 1].condition : "healthy";
  }, [getToothConditions]);

  const teethConditions = useMemo(() => {
    if (!patient) return [];
    const conditionMap: Record<string, Set<string>> = {};
    const allFDI = [
      ...Array.from({ length: 8 }, (_, i) => 18 - i),
      ...Array.from({ length: 8 }, (_, i) => 21 + i),
      ...Array.from({ length: 8 }, (_, i) => 31 + i),
      ...Array.from({ length: 8 }, (_, i) => 48 - i),
    ];

    for (const fdi of allFDI) {
      const recs = patient.dentalRecords.filter((r) => r.toothNumber === fdi);
      if (recs.length > 0) {
        const lastCondition = recs[recs.length - 1].condition;
        if (lastCondition !== "healthy") {
          if (!conditionMap[lastCondition]) conditionMap[lastCondition] = new Set();
          conditionMap[lastCondition].add(toothId(fdi));
        }
      }
    }

    return Object.entries(conditionMap).map(([condition, teethSet]) => {
      const colors = conditionToColors[condition as ToothCondition];
      return {
        label: colors.label,
        teeth: Array.from(teethSet),
        fillColor: colors.fillColor,
        outlineColor: colors.outlineColor,
      };
    });
  }, [patient]);

  const handleChange = useCallback((selectedTeeth: Array<{ id: string; notations: { fdi: string } }>) => {
    if (selectedTeeth.length > 0) {
      const last = selectedTeeth[selectedTeeth.length - 1];
      const fdi = parseInt(last.notations.fdi, 10);
      setSelectedTooth(fdi);
      setSelectedSurface(null);
    } else {
      setSelectedTooth(null);
      setSelectedSurface(null);
    }
  }, []);

  const handleSave = (data: {
    condition: ToothCondition; surface?: ToothSurface;
    dentist: string; notes?: string; treatment?: string; cost?: number;
  }) => {
    if (selectedTooth === null) return;
    addDentalRecord(patientId, {
      toothNumber: selectedTooth, condition: data.condition, surface: data.surface,
      dentist: data.dentist, notes: data.notes, treatment: data.treatment, cost: data.cost,
    });
    toast({ title: `Dhëmbi #${selectedTooth}: Trajtimi u ruajt me sukses` });
    setSelectedTooth(null);
    setSelectedSurface(null);
  };

  const totalCost = useMemo(() => {
    if (!patient) return 0;
    return patient.dentalRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
  }, [patient]);

  if (!patient) return null;

  return (
    <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
      <h3 className="text-sm font-medium text-foreground">
        Odontografi — Zgjidh dhëmbin problematik
      </h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(conditionToColors)
          .filter(([key]) => key !== "healthy")
          .map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm border border-border/50"
                style={{ backgroundColor: val.fillColor }}
              />
              <span className="text-[10px] text-muted-foreground">{val.label}</span>
            </div>
          ))}
      </div>

      {/* Main layout: Odontogram (left/center) + Treatment Panel (right) */}
      <div className="flex gap-5 items-start">
        {/* Odontogram — takes remaining space, centered */}
        <div className={`odontogram-container flex justify-center ${selectedTooth !== null ? "flex-1 min-w-0" : "w-full"}`} style={{ maxWidth: selectedTooth !== null ? 420 : 480, margin: selectedTooth === null ? "0 auto" : undefined }}>
          <Odontogram
            singleSelect
            onChange={handleChange}
            defaultSelected={selectedTooth ? [toothId(selectedTooth)] : []}
            teethConditions={teethConditions}
            showLabels={false}
            notation="FDI"
            tooltip={{
              placement: "top",
              content: (payload) => {
                if (!payload) return null;
                const fdi = parseInt(payload.notations.fdi, 10);
                const condition = getPrimary(fdi);
                const colors = conditionToColors[condition];
                const location = getToothLocation(fdi);
                return (
                  <div style={{ minWidth: 140, fontSize: 12 }}>
                    <strong>Dhëmbi #{payload.notations.fdi}</strong>
                    <div style={{ color: "#64748b" }}>{location}</div>
                    <div style={{
                      color: condition === "healthy" ? "#22c55e" : colors.fillColor,
                      fontWeight: 600,
                      marginTop: 2,
                    }}>
                      {colors.label}
                    </div>
                  </div>
                );
              },
            }}
          />
        </div>

        {/* Side panel — appears on the right when a tooth is selected */}
        {selectedTooth !== null && (
          <div className="w-[340px] shrink-0 animate-in slide-in-from-right-4 duration-200">
            <ToothTreatmentPanel
              toothNumber={selectedTooth}
              toothLocation={getToothLocation(selectedTooth)}
              selectedSurface={selectedSurface}
              onSurfaceSelect={setSelectedSurface}
              records={getToothConditions(selectedTooth)}
              staff={staff}
              onSave={handleSave}
              onClose={() => { setSelectedTooth(null); setSelectedSurface(null); }}
            />
          </div>
        )}
      </div>

      {/* Treatment Summary Table */}
      {patient.dentalRecords.length > 0 && (
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Përmbledhja e trajtimeve</p>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Totali i trajtimit</p>
              <p className="text-base font-semibold font-mono text-foreground">€{totalCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-2">Dhëmbi</th>
                  <th className="text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-2">Shërbimi</th>
                  <th className="text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-2">Vendndodhja</th>
                  <th className="text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-2">Data</th>
                  <th className="text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-2">Dentisti</th>
                  <th className="text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-2">Kostoja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[...patient.dentalRecords].reverse().map((r, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-2 py-2 font-mono text-foreground">#{r.toothNumber}</td>
                    <td className="px-2 py-2">
                      <span
                        className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: conditionToColors[r.condition]?.fillColor || "#6b7280" }}
                      >
                        {conditionToColors[r.condition]?.label || r.condition}
                      </span>
                      {r.treatment && <span className="ml-1.5 text-xs text-foreground">{r.treatment}</span>}
                    </td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{getToothLocation(r.toothNumber)}</td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{r.date}</td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">{r.dentist}</td>
                    <td className="px-2 py-2 text-right font-mono text-foreground">{r.cost ? `€${r.cost.toFixed(2)}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border">
                  <td colSpan={5} className="px-2 py-2 text-xs font-semibold text-foreground text-right">Totali:</td>
                  <td className="px-2 py-2 text-right font-mono font-semibold text-foreground">€{totalCost.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
