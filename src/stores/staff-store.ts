import { create } from "zustand";
import { staffMembers as mockStaff, type StaffMember } from "@/lib/mock-data";

interface StaffStore {
  staff: StaffMember[];
  addStaff: (data: Omit<StaffMember, "id" | "stats">) => void;
  updateStaff: (id: string, data: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
}

export const useStaffStore = create<StaffStore>((set) => ({
  staff: mockStaff,

  addStaff: (data) => {
    const id = `STF-${Date.now()}`;
    set((s) => ({
      staff: [...s.staff, { ...data, id, stats: { visits: 0, treatments: 0, rating: 0 } }],
    }));
  },

  updateStaff: (id, data) => {
    set((s) => ({
      staff: s.staff.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
  },

  deleteStaff: (id) => {
    set((s) => ({ staff: s.staff.filter((m) => m.id !== id) }));
  },
}));
