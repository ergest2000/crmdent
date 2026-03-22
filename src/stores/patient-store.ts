import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export interface PatientMedical {
  allergies: string[];
  chronicDiseases: string[];
  medications: string[];
  medicalNotes: string;
}

export type ToothSurface = "mesial" | "distal" | "buccal" | "lingual" | "occlusal";
export type ToothCondition = "healthy" | "caries" | "filling" | "crown" | "implant" | "root-canal" | "extraction" | "in-treatment";

export interface DentalRecord {
  toothNumber: number;
  condition: ToothCondition;
  surface?: ToothSurface;
  date: string;
  dentist: string;
  notes?: string;
  treatment?: string;
  cost?: number;
}

export interface FullPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone: string;
  email?: string;
  gender?: string;
  address?: string;
  companion?: string;
  status: string;
  allergies: string[];
  lastVisit?: string;
  balance: number;
  medical: PatientMedical;
  dentalRecords: DentalRecord[];
  documents: { id: string; name: string; type: string; date: string; url?: string }[];
}

interface PatientStore {
  patients: FullPatient[];
  loading: boolean;
  fetchPatients: () => Promise<void>;
  addPatient: (data: Omit<FullPatient, "id" | "medical" | "dentalRecords" | "documents">) => FullPatient;
  updatePatient: (id: string, data: Partial<FullPatient>) => void;
  deletePatient: (id: string) => void;
  getPatient: (id: string) => FullPatient | undefined;
  addDentalRecord: (patientId: string, record: Omit<DentalRecord, "date">) => void;
  updateMedical: (patientId: string, medical: PatientMedical) => void;
}

function uid() { return useAuthStore.getState().user?.id; }
function toLocal(row: any): FullPatient {
  return {
    id: row.id, firstName: row.first_name, lastName: row.last_name,
    dateOfBirth: row.date_of_birth, phone: row.phone, email: row.email,
    gender: row.gender, address: row.address, companion: row.companion,
    status: row.status, allergies: row.allergies || [],
    lastVisit: row.last_visit, balance: Number(row.balance) || 0,
    medical: row.medical || { allergies: [], chronicDiseases: [], medications: [], medicalNotes: "" },
    dentalRecords: row.dental_records || [], documents: row.documents || [],
  };
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: [],
  loading: false,

  fetchPatients: async () => {
    set({ loading: true });
    const { data } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
    if (data) set({ patients: data.map(toLocal), loading: false });
    else set({ loading: false });
  },

  addPatient: (data) => {
    const id = `DEN-${Math.floor(Math.random() * 9000 + 1000)}`;
    const patient: FullPatient = {
      ...data, id,
      medical: { allergies: data.allergies || [], chronicDiseases: [], medications: [], medicalNotes: "" },
      dentalRecords: [], documents: [],
    };
    set((s) => ({ patients: [patient, ...s.patients] }));
    const userId = (await supabase.auth.getUser()).data.user?.id;
    supabase.from("patients").insert({
      user_id: userId,
      id, first_name: data.firstName, last_name: data.lastName,
      date_of_birth: data.dateOfBirth, phone: data.phone, email: data.email,
      gender: data.gender, address: data.address, companion: data.companion,
      status: data.status, allergies: data.allergies || [],
      last_visit: data.lastVisit, balance: data.balance || 0, user_id: uid(),
    }).then();
    return patient;
  },

  updatePatient: (id, data) => {
    set((s) => ({ patients: s.patients.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
    const dbData: any = {};
    if (data.firstName) dbData.first_name = data.firstName;
    if (data.lastName) dbData.last_name = data.lastName;
    if (data.phone) dbData.phone = data.phone;
    if (data.email !== undefined) dbData.email = data.email;
    if (data.address !== undefined) dbData.address = data.address;
    if (data.companion !== undefined) dbData.companion = data.companion;
    if (data.status) dbData.status = data.status;
    if (data.gender) dbData.gender = data.gender;
    if (data.dateOfBirth) dbData.date_of_birth = data.dateOfBirth;
    if (data.balance !== undefined) dbData.balance = data.balance;
    if (data.allergies) dbData.allergies = data.allergies;
    supabase.from("patients").update(dbData).eq("id", id).then();
  },

  deletePatient: (id) => {
    set((s) => ({ patients: s.patients.filter((p) => p.id !== id) }));
    supabase.from("patients").delete().eq("id", id).then();
  },

  getPatient: (id) => get().patients.find((p) => p.id === id),

  addDentalRecord: (patientId, record) => {
    const date = new Date().toISOString().split("T")[0];
    set((s) => ({
      patients: s.patients.map((p) => {
        if (p.id === patientId) {
          const updated = { ...p, dentalRecords: [...p.dentalRecords, { ...record, date }] };
          supabase.from("patients").update({ dental_records: updated.dentalRecords }).eq("id", patientId).then();
          return updated;
        }
        return p;
      }),
    }));
  },

  updateMedical: (patientId, medical) => {
    set((s) => ({
      patients: s.patients.map((p) => {
        if (p.id === patientId) {
          supabase.from("patients").update({ medical, allergies: medical.allergies }).eq("id", patientId).then();
          return { ...p, medical, allergies: medical.allergies };
        }
        return p;
      }),
    }));
  },
}));
