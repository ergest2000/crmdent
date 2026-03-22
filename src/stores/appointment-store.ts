import { create } from "zustand";
import { todayAppointments, type Appointment } from "@/lib/mock-data";

interface AppointmentStore {
  appointments: Appointment[];
  addAppointment: (data: Omit<Appointment, "id">) => Appointment;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getByDate: (date: string) => Appointment[];
  getByPatient: (patientId: string) => Appointment[];
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: todayAppointments,

  addAppointment: (data) => {
    const apt: Appointment = { ...data, id: `APT-${Date.now()}` };
    set((s) => ({ appointments: [...s.appointments, apt] }));
    return apt;
  },

  updateAppointment: (id, data) => {
    set((s) => ({
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },

  deleteAppointment: (id) => {
    set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) }));
  },

  getByDate: (date) => get().appointments.filter((a) => a.date === date),

  getByPatient: (patientId) => get().appointments.filter((a) => a.patientId === patientId),
}));
