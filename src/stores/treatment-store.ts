import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export interface FullTreatment {
  id: string;
  name: string;
  category: string;
  price: number;      // Euro
  priceAll: number;   // Lekë
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
    if (data) set({
      treatments: data.map((r: any) => ({
        id: r.id, name: r.name, category: r.category,
        price: r.price ?? 0, priceAll: r.price_all ?? 0,
        duration: r.duration, description: r.description,
      })),
      loading: false,
    });
    else set({ loading: false });
  },

  addTreatment: (data) => {
    const id = `TRT-${Date.now()}`;
    set((s) => ({ treatments: [...s.treatments, { ...data, id }] }));
    supabase.from("treatments").insert({
      id, name: data.name, category: data.category,
      price: data.price, price_all: data.priceAll,
      duration: data.duration, description: data.description, user_id: uid(),
    }).then();
  },

  updateTreatment: (id, data) => {
    set((s) => ({ treatments: s.treatments.map((t) => (t.id === id ? { ...t, ...data } : t)) }));
    const payload: Record<string, any> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.category !== undefined) payload.category = data.category;
    if (data.price !== undefined) payload.price = data.price;
    if (data.priceAll !== undefined) payload.price_all = data.priceAll;
    if (data.duration !== undefined) payload.duration = data.duration;
    if (data.description !== undefined) payload.description = data.description;
    supabase.from("treatments").update(payload).eq("id", id).then();
  },

  deleteTreatment: (id) => {
    set((s) => ({ treatments: s.treatments.filter((t) => t.id !== id) }));
    supabase.from("treatments").delete().eq("id", id).then();
  },
}));
