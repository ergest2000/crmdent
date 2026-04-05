import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export interface Appointment {
  id: string;
  patientId?: string;
  patientName: string;
  date: string;
  time: string;
  treatment: string;
  dentist: string;
  status: string;
  notes?: string;
  duration?: number;
}

interface AppointmentStore {
  appointments: Appointment[];
  loading: boolean;
  fetchAppointments: () => Promise<void>;
  addAppointment: (data: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getByDate: (date: string) => Appointment[];
  getByPatient: (patientId: string) => Appointment[];
}

function toLocal(row: any): Appointment {
  return {
    id: row.id, patientId: row.patient_id, patientName: row.patient_name,
    date: row.date, time: row.time, treatment: row.treatment,
    dentist: row.dentist, status: row.status, notes: row.notes, duration: row.duration,
  };
}

function uid() { return useAuthStore.getState().user?.id; }

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  loading: false,

  fetchAppointments: async () => {
    set({ loading: true });
    const { data } = await supabase.from("appointments").select("*").order("date");
    if (data) set({ appointments: data.map(toLocal), loading: false });
    else set({ loading: false });
  },

  addAppointment: (data) => {
    const apt: Appointment = { ...data, id: `APT-${Date.now()}` };
    set((s) => ({ appointments: [...s.appointments, apt] }));
    supabase.from("appointments").insert({
      user_id: uid(),
      id: apt.id, patient_id: apt.patientId, patient_name: apt.patientName,
      date: apt.date, time: apt.time, treatment: apt.treatment,
      dentist: apt.dentist, status: apt.status, notes: apt.notes,
      duration: apt.duration || 30,
    }).then();
    return apt;
  },

  updateAppointment: (id, data) => {
    set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)) }));
    const dbData: any = {};
    if (data.status) dbData.status = data.status;
    if (data.date) dbData.date = data.date;
    if (data.time) dbData.time = data.time;
    if (data.notes !== undefined) dbData.notes = data.notes;
    if (data.treatment) dbData.treatment = data.treatment;
    if (data.dentist) dbData.dentist = data.dentist;
    supabase.from("appointments").update(dbData).eq("id", id).then();
  },

  deleteAppointment: (id) => {
    set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) }));
    supabase.from("appointments").delete().eq("id", id).then();
  },

  getByDate: (date) => get().appointments.filter((a) => a.date === date),
  getByPatient: (patientId) => get().appointments.filter((a) => a.patientId === patientId),
}));
