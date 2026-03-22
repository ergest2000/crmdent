import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export interface FullTreatment {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
}

interface TreatmentStore {
  treatments: FullTreatment[];
  loading: boolean;
  fetchTreatments: () => Promise<void>;
  addTreatment: (data: Omit<FullTreatment, "id">) => void;
  updateTreatment: (id: string, data: Partial<FullTreatment>) => void;
  deleteTreatment: (id: string) => void;
}

function uid() { return useAuthStore.getState().user?.id; }
export const useTreatmentStore = create<TreatmentStore>((set) => ({
  treatments: [],
  loading: false,

  fetchTreatments: async () => {
    set({ loading: true });
    const { data } = await supabase.from("treatments").select("*").order("created_at");
    if (data) set({ treatments: data.map((r: any) => ({ id: r.id, name: r.name, category: r.category, price: r.price, duration: r.duration, description: r.description })), loading: false });
    else set({ loading: false });
  },

  addTreatment: (data) => {
    const id = `TRT-${Date.now()}`;
    set((s) => ({ treatments: [...s.treatments, { ...data, id }] }));
    supabase.from("treatments").insert({ id, name: data.name, category: data.category, price: data.price, duration: data.duration, description: data.description, user_id: uid() }).then();
  },

  updateTreatment: (id, data) => {
    set((s) => ({ treatments: s.treatments.map((t) => (t.id === id ? { ...t, ...data } : t)) }));
    supabase.from("treatments").update(data).eq("id", id).then();
  },

  deleteTreatment: (id) => {
    set((s) => ({ treatments: s.treatments.filter((t) => t.id !== id) }));
    supabase.from("treatments").delete().eq("id", id).then();
  },
}));
