import { useState, useMemo } from "react";
import { Plus, ChevronDown, ChevronRight, Check, Clock, Trash2, Edit, Play, SkipForward, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  useTreatmentPlanStore,
  type TreatmentPlan,
  type Phase,
  type Procedure,
  type PlanStatus,
  type PhaseStatus,
  type ProcedureStatus,
} from "@/stores/treatment-plan-store";
import { useStaffStore } from "@/stores/staff-store";
import { useTreatmentStore } from "@/stores/treatment-store";
import { toast } from "@/hooks/use-toast";

const planStatusLabels: Record<PlanStatus, { label: string; color: string }> = {
  planned: { label: "I planifikuar", color: "bg-blue-100 text-blue-700" },
  "in-progress": { label: "Në progres", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Përfunduar", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Anuluar", color: "bg-muted text-muted-foreground" },
};

const procStatusLabels: Record<ProcedureStatus, { label: string; icon: typeof Clock }> = {
  pending: { label: "Në pritje", icon: Clock },
  scheduled: { label: "Planifikuar", icon: AlertCircle },
  completed: { label: "Përfunduar", icon: Check },
  skipped: { label: "Anashkaluar", icon: SkipForward },
};

interface Props {
  patientId: string;
}

export function TreatmentPlanSection({ patientId }: Props) {
  const allPlans = useTreatmentPlanStore((s) => s.plans);
  const { addPlan, updatePlan, deletePlan, addPhase, deletePhase, addProcedure, updateProcedure, deleteProcedure, updatePhase } = useTreatmentPlanStore();
  const allStaff = useStaffStore((s) => s.staff);
  const treatmentCatalog = useTreatmentStore((s) => s.treatments);

  const plans = useMemo(() => allPlans.filter((p) => p.patientId === patientId), [allPlans, patientId]);
  const staff = useMemo(() => allStaff.filter((st) => st.role === "dentist"), [allStaff]);

  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [addPhaseOpen, setAddPhaseOpen] = useState<string | null>(null);
  const [addProcOpen, setAddProcOpen] = useState<{ planId: string; phaseId: string } | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  // New plan form
  const [planForm, setPlanForm] = useState({ title: "", diagnosis: "", dentist: "", notes: "" });
  // Phase form
  const [phaseForm, setPhaseForm] = useState({ name: "", order: 1 });
  // Procedure form
  const [procForm, setProcForm] = useState({ treatment: "", diagnosis: "", toothNumber: "", duration: 30, cost: 0, notes: "" });

  const togglePlan = (id: string) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreatePlan = () => {
    if (!planForm.title || !planForm.dentist) return;
    const plan = addPlan({
      patientId,
      title: planForm.title,
      diagnosis: planForm.diagnosis,
      dentist: planForm.dentist,
      notes: planForm.notes,
      phases: [],
    });
    setExpandedPlans((prev) => new Set(prev).add(plan.id));
    setPlanForm({ title: "", diagnosis: "", dentist: "", notes: "" });
    setNewPlanOpen(false);
    toast({ title: "Plani i trajtimit u krijua" });
  };

  const handleAddPhase = () => {
    if (!addPhaseOpen || !phaseForm.name) return;
    addPhase(addPhaseOpen, { name: phaseForm.name, order: phaseForm.order, procedures: [] });
    setPhaseForm({ name: "", order: 1 });
    setAddPhaseOpen(null);
    toast({ title: "Faza u shtua" });
  };

  const handleAddProcedure = () => {
    if (!addProcOpen || !procForm.treatment) return;
    addProcedure(addProcOpen.planId, addProcOpen.phaseId, {
      treatment: procForm.treatment,
      diagnosis: procForm.diagnosis,
      toothNumber: procForm.toothNumber ? parseInt(procForm.toothNumber) : undefined,
      duration: procForm.duration,
      cost: procForm.cost,
      notes: procForm.notes || undefined,
    });
    setProcForm({ treatment: "", diagnosis: "", toothNumber: "", duration: 30, cost: 0, notes: "" });
    setAddProcOpen(null);
    toast({ title: "Procedura u shtua" });
  };

  const cycleProcStatus = (planId: string, phaseId: string, procId: string, current: ProcedureStatus) => {
    const next: Record<ProcedureStatus, ProcedureStatus> = {
      pending: "scheduled",
      scheduled: "completed",
      completed: "pending",
      skipped: "pending",
    };
    const newStatus = next[current];
    updateProcedure(planId, phaseId, procId, {
      status: newStatus,
      completedDate: newStatus === "completed" ? new Date().toISOString().split("T")[0] : undefined,
    });
  };

  const getPlanProgress = (plan: TreatmentPlan) => {
    const allProcs = plan.phases.flatMap((ph) => ph.procedures);
    if (allProcs.length === 0) return 0;
    const completed = allProcs.filter((p) => p.status === "completed").length;
    return Math.round((completed / allProcs.length) * 100);
  };

  const getPlanTotal = (plan: TreatmentPlan) =>
    plan.phases.flatMap((ph) => ph.procedures).reduce((sum, p) => sum + p.cost, 0);

  const getPhaseTotal = (phase: Phase) =>
    phase.procedures.reduce((sum, p) => sum + p.cost, 0);

  const selectTreatmentFromCatalog = (name: string) => {
    const found = treatmentCatalog.find((t) => t.name === name);
    if (found) {
      setProcForm((prev) => ({ ...prev, treatment: found.name, cost: found.price, duration: found.duration }));
    } else {
      setProcForm((prev) => ({ ...prev, treatment: name }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Planet e Trajtimit ({plans.length})</h3>
        <Button size="sm" className="gap-1.5 h-7 text-xs" onClick={() => setNewPlanOpen(true)}>
          <Plus className="h-3 w-3" /> Plan i Ri
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-card bg-card shadow-subtle p-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nuk ka plane trajtimi. Krijo një plan të ri për të filluar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const progress = getPlanProgress(plan);
            const total = getPlanTotal(plan);
            const isExpanded = expandedPlans.has(plan.id);
            const statusInfo = planStatusLabels[plan.status];

            return (
              <div key={plan.id} className="rounded-card bg-card shadow-subtle overflow-hidden border border-border/30">
                {/* Plan header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => togglePlan(plan.id)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground truncate">{plan.title}</h4>
                      <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plan.dentist} · {plan.phases.length} faza · Krijuar {plan.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Progres</p>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="w-16 h-1.5" />
                        <span className="text-xs font-mono text-foreground">{progress}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-mono font-semibold text-foreground">€{total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Phase Progress Panel — always visible */}
                {plan.phases.length > 0 && (
                  <div className="border-t border-border/20 px-4 py-3 bg-muted/5">
                    <div className="flex items-center gap-1">
                      {plan.phases.sort((a, b) => a.order - b.order).map((phase, idx) => {
                        const phaseCompleted = phase.procedures.filter((p) => p.status === "completed").length;
                        const phaseAll = phase.procedures.length;
                        const isDone = phaseAll > 0 && phaseCompleted === phaseAll;
                        const isActive = plan.currentPhaseId === phase.id;
                        const hasProgress = phaseCompleted > 0 && !isDone;
                        return (
                          <div key={phase.id} className="flex items-center flex-1 min-w-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); updatePlan(plan.id, { currentPhaseId: phase.id }); }}
                              className={`flex-1 rounded-md px-2 py-1.5 text-center transition-all border ${
                                isActive
                                  ? "border-primary bg-primary/10 shadow-sm"
                                  : isDone
                                  ? "border-emerald-300 bg-emerald-50"
                                  : "border-border/40 bg-card hover:border-primary/40"
                              }`}
                            >
                              <p className={`text-[10px] font-medium truncate ${isActive ? "text-primary" : isDone ? "text-emerald-700" : "text-foreground"}`}>
                                {phase.name}
                              </p>
                              <p className={`text-[9px] font-mono ${isActive ? "text-primary/70" : "text-muted-foreground"}`}>
                                €{getPhaseTotal(phase).toFixed(0)} · {phaseCompleted}/{phaseAll}
                              </p>
                            </button>
                            {idx < plan.phases.length - 1 && (
                              <div className={`h-px w-2 shrink-0 ${isDone ? "bg-emerald-400" : "bg-border"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border/30 p-4 space-y-3 bg-muted/10">
                    {plan.diagnosis && (
                      <div className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Diagnoza:</span> {plan.diagnosis}</div>
                    )}

                    {/* Plan actions */}
                    <div className="flex gap-2">
                      {plan.status === "planned" && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => updatePlan(plan.id, { status: "in-progress" })}>
                          <Play className="h-2.5 w-2.5" /> Fillo
                        </Button>
                      )}
                      {plan.status === "in-progress" && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => updatePlan(plan.id, { status: "completed" })}>
                          <Check className="h-2.5 w-2.5" /> Përfundo
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => { setPhaseForm({ name: "", order: plan.phases.length + 1 }); setAddPhaseOpen(plan.id); }}>
                        <Plus className="h-2.5 w-2.5" /> Shto Fazë
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-destructive" onClick={() => { deletePlan(plan.id); toast({ title: "Plani u fshi" }); }}>
                        <Trash2 className="h-2.5 w-2.5" /> Fshi
                      </Button>
                    </div>

                    {/* Phases */}
                    {plan.phases.sort((a, b) => a.order - b.order).map((phase) => {
                      const phaseExpanded = expandedPhases.has(phase.id);
                      const phaseTotal = getPhaseTotal(phase);
                      const phaseCompleted = phase.procedures.filter((p) => p.status === "completed").length;

                      return (
                        <div key={phase.id} className="rounded-inner border border-border/30 bg-card overflow-hidden">
                          <div
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/30"
                            onClick={() => togglePhase(phase.id)}
                          >
                            {phaseExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                            <span className="text-[10px] font-mono text-muted-foreground">Faza {phase.order}</span>
                            <span className="text-xs font-medium text-foreground flex-1">{phase.name}</span>
                            <span className="text-[10px] text-muted-foreground">{phaseCompleted}/{phase.procedures.length}</span>
                            <span className="text-xs font-mono text-foreground">€{phaseTotal.toFixed(2)}</span>
                            <Button
                              size="sm" variant="ghost"
                              className="h-5 w-5 p-0 text-destructive"
                              onClick={(e) => { e.stopPropagation(); deletePhase(plan.id, phase.id); }}
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>

                          {phaseExpanded && (
                            <div className="border-t border-border/20 px-3 py-2 space-y-1.5">
                              {phase.procedures.map((proc) => {
                                const statusInfo = procStatusLabels[proc.status];
                                const StatusIcon = statusInfo.icon;
                                return (
                                  <div key={proc.id} className="flex items-center gap-2 py-1 group">
                                    <button
                                      onClick={() => cycleProcStatus(plan.id, phase.id, proc.id, proc.status)}
                                      className={`flex items-center justify-center h-5 w-5 rounded-full border transition-colors ${
                                        proc.status === "completed"
                                          ? "bg-emerald-500 border-emerald-500 text-primary-foreground"
                                          : proc.status === "scheduled"
                                          ? "bg-amber-100 border-amber-300 text-amber-700"
                                          : "border-border text-muted-foreground hover:border-primary"
                                      }`}
                                    >
                                      <StatusIcon className="h-2.5 w-2.5" />
                                    </button>
                                    {proc.toothNumber && (
                                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1 rounded">#{proc.toothNumber}</span>
                                    )}
                                    <span className={`text-xs flex-1 ${proc.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                      {proc.treatment}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{proc.duration} min</span>
                                    <span className="text-xs font-mono text-foreground">€{proc.cost.toFixed(2)}</span>
                                    <button
                                      onClick={() => deleteProcedure(plan.id, phase.id, proc.id)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                    >
                                      <Trash2 className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                );
                              })}
                              <Button
                                size="sm" variant="ghost"
                                className="h-6 text-[10px] gap-1 w-full justify-center text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setProcForm({ treatment: "", diagnosis: "", toothNumber: "", duration: 30, cost: 0, notes: "" });
                                  setAddProcOpen({ planId: plan.id, phaseId: phase.id });
                                }}
                              >
                                <Plus className="h-2.5 w-2.5" /> Shto procedurë
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {plan.phases.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">Shto faza për të strukturuar planin.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Plan Dialog */}
      <Dialog open={newPlanOpen} onOpenChange={setNewPlanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Plan i Ri Trajtimi</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Titulli *</Label>
              <Input value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} placeholder="p.sh. Rehabilitim i plotë i nofullës..." className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Diagnoza</Label>
              <Textarea value={planForm.diagnosis} onChange={(e) => setPlanForm({ ...planForm, diagnosis: e.target.value })} placeholder="Përshkruaj diagnozën..." rows={2} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Dentisti *</Label>
              <Select value={planForm.dentist} onValueChange={(v) => setPlanForm({ ...planForm, dentist: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Zgjidh dentistin" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>{s.firstName} {s.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Shënime</Label>
              <Textarea value={planForm.notes} onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })} rows={2} className="text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewPlanOpen(false)}>Anulo</Button>
            <Button size="sm" onClick={handleCreatePlan}>Krijo Planin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Phase Dialog */}
      <Dialog open={!!addPhaseOpen} onOpenChange={() => setAddPhaseOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Shto Fazë të Re</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Emri i fazës *</Label>
              <Input value={phaseForm.name} onChange={(e) => setPhaseForm({ ...phaseForm, name: e.target.value })} placeholder="p.sh. Faza diagnostike, Faza kirurgjikale..." className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Radhitja</Label>
              <Input type="number" value={phaseForm.order} onChange={(e) => setPhaseForm({ ...phaseForm, order: parseInt(e.target.value) || 1 })} className="h-8 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddPhaseOpen(null)}>Anulo</Button>
            <Button size="sm" onClick={handleAddPhase}>Shto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Procedure Dialog */}
      <Dialog open={!!addProcOpen} onOpenChange={() => setAddProcOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Shto Procedurë</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Trajtimi *</Label>
              <Select value={procForm.treatment} onValueChange={selectTreatmentFromCatalog}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Zgjidh nga katalogu..." /></SelectTrigger>
                <SelectContent>
                  {treatmentCatalog.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name} — €{t.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Diagnoza</Label>
              <Input value={procForm.diagnosis} onChange={(e) => setProcForm({ ...procForm, diagnosis: e.target.value })} placeholder="p.sh. Karies në dhëmbin 36..." className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Dhëmbi (FDI)</Label>
                <Input value={procForm.toothNumber} onChange={(e) => setProcForm({ ...procForm, toothNumber: e.target.value })} placeholder="p.sh. 36" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Kohëzgjatja (min)</Label>
                <Input type="number" value={procForm.duration} onChange={(e) => setProcForm({ ...procForm, duration: parseInt(e.target.value) || 30 })} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Çmimi (€)</Label>
                <Input type="number" value={procForm.cost} onChange={(e) => setProcForm({ ...procForm, cost: parseFloat(e.target.value) || 0 })} className="h-8 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Shënime</Label>
              <Input value={procForm.notes} onChange={(e) => setProcForm({ ...procForm, notes: e.target.value })} className="h-8 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddProcOpen(null)}>Anulo</Button>
            <Button size="sm" onClick={handleAddProcedure}>Shto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
