import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface DoctorSchedule { day: string; start: string; end: string; }
export interface BlockedSlot { id: string; date: string; startTime: string; endTime: string; reason: string; }

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  phone: string;
  email: string;
  profilePhoto?: string;
  status: "active" | "on-leave" | "inactive";
  joinDate: string;
  schedule: DoctorSchedule[];
  blockedSlots: BlockedSlot[];
  stats: { patients: number; treatments: number; rating: number };
}

interface DoctorStore {
  doctors: Doctor[];
  loading: boolean;
  fetchDoctors: () => Promise<void>;
  addDoctor: (data: Omit<Doctor, "id" | "stats" | "blockedSlots">) => void;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  addBlockedSlot: (doctorId: string, slot: Omit<BlockedSlot, "id">) => void;
  removeBlockedSlot: (doctorId: string, slotId: string) => void;
}

function toLocal(row: any): Doctor {
  return {
    id: row.id, firstName: row.first_name, lastName: row.last_name,
    specialization: row.specialization, phone: row.phone, email: row.email,
    profilePhoto: row.profile_photo, status: row.status, joinDate: row.join_date || "",
    schedule: row.schedule || [], blockedSlots: row.blocked_slots || [],
    stats: row.stats || { patients: 0, treatments: 0, rating: 0 },
  };
}

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctors: [],
  loading: false,

  fetchDoctors: async () => {
    set({ loading: true });
    const { data } = await supabase.from("doctors").select("*").order("created_at");
    if (data) set({ doctors: data.map(toLocal), loading: false });
    else set({ loading: false });
  },

  addDoctor: (data) => {
    const id = `DOC-${Date.now()}`;
    const doc: Doctor = { ...data, id, blockedSlots: [], stats: { patients: 0, treatments: 0, rating: 0 } };
    set((s) => ({ doctors: [...s.doctors, doc] }));
    supabase.from("doctors").insert({
      id, first_name: data.firstName, last_name: data.lastName,
      specialization: data.specialization, phone: data.phone, email: data.email,
      profile_photo: data.profilePhoto, status: data.status, join_date: data.joinDate,
      schedule: data.schedule, blocked_slots: [], stats: { patients: 0, treatments: 0, rating: 0 },
    }).then();
  },

  updateDoctor: (id, data) => {
    set((s) => ({ doctors: s.doctors.map((d) => (d.id === id ? { ...d, ...data } : d)) }));
    const dbData: any = {};
    if (data.firstName) dbData.first_name = data.firstName;
    if (data.lastName) dbData.last_name = data.lastName;
    if (data.specialization) dbData.specialization = data.specialization;
    if (data.phone) dbData.phone = data.phone;
    if (data.email) dbData.email = data.email;
    if (data.profilePhoto !== undefined) dbData.profile_photo = data.profilePhoto;
    if (data.status) dbData.status = data.status;
    if (data.schedule) dbData.schedule = data.schedule;
    if (data.blockedSlots) dbData.blocked_slots = data.blockedSlots;
    supabase.from("doctors").update(dbData).eq("id", id).then();
  },

  deleteDoctor: (id) => {
    set((s) => ({ doctors: s.doctors.filter((d) => d.id !== id) }));
    supabase.from("doctors").delete().eq("id", id).then();
  },

  addBlockedSlot: (doctorId, slot) => {
    const slotWithId = { ...slot, id: `BLK-${Date.now()}` };
    set((s) => ({
      doctors: s.doctors.map((d) => {
        if (d.id === doctorId) {
          const updated = { ...d, blockedSlots: [...d.blockedSlots, slotWithId] };
          supabase.from("doctors").update({ blocked_slots: updated.blockedSlots }).eq("id", doctorId).then();
          return updated;
        }
        return d;
      }),
    }));
  },

  removeBlockedSlot: (doctorId, slotId) => {
    set((s) => ({
      doctors: s.doctors.map((d) => {
        if (d.id === doctorId) {
          const updated = { ...d, blockedSlots: d.blockedSlots.filter((b) => b.id !== slotId) };
          supabase.from("doctors").update({ blocked_slots: updated.blockedSlots }).eq("id", doctorId).then();
          return updated;
        }
        return d;
      }),
    }));
  },
}));
