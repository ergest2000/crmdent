import { create } from "zustand";
import { patients as mockPatients, type Patient } from "@/lib/mock-data";

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

export interface FullPatient extends Patient {
  gender?: string;
  address?: string;
  companion?: string;
  medical: PatientMedical;
  dentalRecords: DentalRecord[];
  documents: { id: string; name: string; type: string; date: string; url?: string }[];
}

function toFull(p: Patient): FullPatient {
  return {
    ...p,
    gender: "M",
    address: "Tiranë",
    medical: {
      allergies: p.allergies,
      chronicDiseases: [],
      medications: [],
      medicalNotes: "",
    },
    dentalRecords: [],
    documents: [],
  };
}

interface PatientStore {
  patients: FullPatient[];
  addPatient: (data: Omit<FullPatient, "id" | "medical" | "dentalRecords" | "documents">) => FullPatient;
  updatePatient: (id: string, data: Partial<FullPatient>) => void;
  deletePatient: (id: string) => void;
  getPatient: (id: string) => FullPatient | undefined;
  addDentalRecord: (patientId: string, record: Omit<DentalRecord, "date">) => void;
  updateMedical: (patientId: string, medical: PatientMedical) => void;
}

export const usePatientStore = create<PatientStore>((set, get) => ({
  patients: mockPatients.map(toFull),

  addPatient: (data) => {
    const id = `DEN-${Math.floor(Math.random() * 9000 + 1000)}`;
    const patient: FullPatient = {
      ...data,
      id,
      medical: { allergies: data.allergies || [], chronicDiseases: [], medications: [], medicalNotes: "" },
      dentalRecords: [],
      documents: [],
    };
    set((s) => ({ patients: [patient, ...s.patients] }));
    return patient;
  },

  updatePatient: (id, data) => {
    set((s) => ({
      patients: s.patients.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  deletePatient: (id) => {
    set((s) => ({ patients: s.patients.filter((p) => p.id !== id) }));
  },

  getPatient: (id) => get().patients.find((p) => p.id === id),

  addDentalRecord: (patientId, record) => {
    const date = new Date().toISOString().split("T")[0];
    set((s) => ({
      patients: s.patients.map((p) =>
        p.id === patientId
          ? { ...p, dentalRecords: [...p.dentalRecords, { ...record, date }] }
          : p
      ),
    }));
  },

  updateMedical: (patientId, medical) => {
    set((s) => ({
      patients: s.patients.map((p) =>
        p.id === patientId ? { ...p, medical, allergies: medical.allergies } : p
      ),
    }));
  },
}));
