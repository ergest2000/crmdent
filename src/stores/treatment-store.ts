import { create } from "zustand";
import { treatments as mockTreatments, type Treatment } from "@/lib/mock-data";

export interface FullTreatment extends Treatment {
  description?: string;
}

interface TreatmentStore {
  treatments: FullTreatment[];
  addTreatment: (data: Omit<FullTreatment, "id">) => void;
  updateTreatment: (id: string, data: Partial<FullTreatment>) => void;
  deleteTreatment: (id: string) => void;
}

export const useTreatmentStore = create<TreatmentStore>((set) => ({
  treatments: mockTreatments.map((t) => ({ ...t, description: "" })),

  addTreatment: (data) => {
    const id = `TRT-${Date.now()}`;
    set((s) => ({ treatments: [...s.treatments, { ...data, id }] }));
  },

  updateTreatment: (id, data) => {
    set((s) => ({
      treatments: s.treatments.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
  },

  deleteTreatment: (id) => {
    set((s) => ({ treatments: s.treatments.filter((t) => t.id !== id) }));
  },
}));
