import { create } from "zustand";

export type PlanStatus = "planned" | "in-progress" | "completed" | "cancelled";
export type PhaseStatus = "pending" | "in-progress" | "completed" | "skipped";
export type ProcedureStatus = "pending" | "scheduled" | "completed" | "skipped";

export interface Procedure {
  id: string;
  toothNumber?: number;
  treatment: string;
  diagnosis: string;
  duration: number; // minutes
  cost: number;
  status: ProcedureStatus;
  notes?: string;
  completedDate?: string;
  attachmentIds?: string[];
}

export interface Phase {
  id: string;
  name: string;
  order: number;
  status: PhaseStatus;
  procedures: Procedure[];
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  diagnosis: string;
  dentist: string;
  status: PlanStatus;
  currentPhaseId?: string;
  createdAt: string;
  updatedAt: string;
  phases: Phase[];
  notes?: string;
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

interface TreatmentPlanStore {
  plans: TreatmentPlan[];
  addPlan: (data: Omit<TreatmentPlan, "id" | "createdAt" | "updatedAt" | "status">) => TreatmentPlan;
  updatePlan: (id: string, data: Partial<TreatmentPlan>) => void;
  deletePlan: (id: string) => void;
  addPhase: (planId: string, phase: Omit<Phase, "id" | "status">) => void;
  updatePhase: (planId: string, phaseId: string, data: Partial<Phase>) => void;
  deletePhase: (planId: string, phaseId: string) => void;
  addProcedure: (planId: string, phaseId: string, proc: Omit<Procedure, "id" | "status">) => void;
  updateProcedure: (planId: string, phaseId: string, procId: string, data: Partial<Procedure>) => void;
  deleteProcedure: (planId: string, phaseId: string, procId: string) => void;
  getPlansForPatient: (patientId: string) => TreatmentPlan[];
}

export const useTreatmentPlanStore = create<TreatmentPlanStore>((set, get) => ({
  plans: [],

  addPlan: (data) => {
    const now = new Date().toISOString().split("T")[0];
    const plan: TreatmentPlan = {
      ...data,
      id: genId("TP"),
      status: "planned",
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ plans: [plan, ...s.plans] }));
    return plan;
  },

  updatePlan: (id, data) => {
    const now = new Date().toISOString().split("T")[0];
    set((s) => ({
      plans: s.plans.map((p) => (p.id === id ? { ...p, ...data, updatedAt: now } : p)),
    }));
  },

  deletePlan: (id) => set((s) => ({ plans: s.plans.filter((p) => p.id !== id) })),

  addPhase: (planId, phase) => {
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId
          ? { ...p, phases: [...p.phases, { ...phase, id: genId("PH"), status: "pending" as PhaseStatus }] }
          : p
      ),
    }));
  },

  updatePhase: (planId, phaseId, data) => {
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId
          ? { ...p, phases: p.phases.map((ph) => (ph.id === phaseId ? { ...ph, ...data } : ph)) }
          : p
      ),
    }));
  },

  deletePhase: (planId, phaseId) => {
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId ? { ...p, phases: p.phases.filter((ph) => ph.id !== phaseId) } : p
      ),
    }));
  },

  addProcedure: (planId, phaseId, proc) => {
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              phases: p.phases.map((ph) =>
                ph.id === phaseId
                  ? { ...ph, procedures: [...ph.procedures, { ...proc, id: genId("PR"), status: "pending" as ProcedureStatus }] }
                  : ph
              ),
            }
          : p
      ),
    }));
  },

  updateProcedure: (planId, phaseId, procId, data) => {
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              phases: p.phases.map((ph) =>
                ph.id === phaseId
                  ? { ...ph, procedures: ph.procedures.map((pr) => (pr.id === procId ? { ...pr, ...data } : pr)) }
                  : ph
              ),
            }
          : p
      ),
    }));
  },

  deleteProcedure: (planId, phaseId, procId) => {
    set((s) => ({
      plans: s.plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              phases: p.phases.map((ph) =>
                ph.id === phaseId
                  ? { ...ph, procedures: ph.procedures.filter((pr) => pr.id !== procId) }
                  : ph
              ),
            }
          : p
      ),
    }));
  },

  getPlansForPatient: (patientId) => get().plans.filter((p) => p.patientId === patientId),
}));
