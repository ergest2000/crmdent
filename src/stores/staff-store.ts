import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  email?: string;
  status: string;
  joinDate?: string;
  stats: { visits: number; treatments: number; rating: number };
}

interface StaffStore {
  staff: StaffMember[];
  loading: boolean;
  fetchStaff: () => Promise<void>;
  addStaff: (data: Omit<StaffMember, "id" | "stats">) => void;
  updateStaff: (id: string, data: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
}

export const useStaffStore = create<StaffStore>((set) => ({
  staff: [],
  loading: false,

  fetchStaff: async () => {
    set({ loading: true });
    const { data } = await supabase.from("staff").select("*").order("created_at");
    if (data) set({ staff: data.map((r: any) => ({ id: r.id, firstName: r.first_name, lastName: r.last_name, role: r.role, phone: r.phone, email: r.email, status: r.status, joinDate: r.join_date, stats: r.stats || { visits: 0, treatments: 0, rating: 0 } })), loading: false });
    else set({ loading: false });
  },

  addStaff: (data) => {
    const id = `STF-${Date.now()}`;
    const member = { ...data, id, stats: { visits: 0, treatments: 0, rating: 0 } };
    set((s) => ({ staff: [...s.staff, member] }));
    supabase.from("staff").insert({ id, first_name: data.firstName, last_name: data.lastName, role: data.role, phone: data.phone, email: data.email, status: data.status, join_date: data.joinDate, stats: { visits: 0, treatments: 0, rating: 0 } }).then();
  },

  updateStaff: (id, data) => {
    set((s) => ({ staff: s.staff.map((m) => (m.id === id ? { ...m, ...data } : m)) }));
    const dbData: any = {};
    if (data.firstName) dbData.first_name = data.firstName;
    if (data.lastName) dbData.last_name = data.lastName;
    if (data.role) dbData.role = data.role;
    if (data.phone) dbData.phone = data.phone;
    if (data.email) dbData.email = data.email;
    if (data.status) dbData.status = data.status;
    supabase.from("staff").update(dbData).eq("id", id).then();
  },

  deleteStaff: (id) => {
    set((s) => ({ staff: s.staff.filter((m) => m.id !== id) }));
    supabase.from("staff").delete().eq("id", id).then();
  },
}));
