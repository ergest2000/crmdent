import { create } from "zustand";

export interface IntakeFormData {
  id: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;

  // 1. Personal
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  emergencyContact: string;
  acceptNotifications: boolean;

  // 2. Visit reason
  visitReason: string;
  visitReasonTags: string[];

  // 3. Medical history
  cardiovascular: boolean;
  cardiovascularDetails: string;
  diabetes: boolean;
  diabetesDetails: string;
  respiratory: boolean;
  respiratoryDetails: string;
  coagulation: boolean;
  coagulationDetails: string;
  infectious: boolean;
  infectiousDetails: string;
  allergies: boolean;
  allergiesDetails: string;

  // 4. Medications
  anticoagulants: boolean;
  anticoagulantsDetails: string;
  bisphosphonates: boolean;
  bisphosphonatesDetails: string;
  currentMedication: boolean;
  currentMedicationDetails: string;
  drugAllergy: boolean;
  drugAllergyDetails: string;

  // 5. Lifestyle
  smoking: boolean;
  smokingDetails: string;
  alcohol: boolean;
  alcoholDetails: string;
  oralHygiene: string;

  // 6. Special status
  pregnant: boolean;
  trimester: string;
  breastfeeding: boolean;

  // 7. Clinical
  problemDuration: string;
  painLevel: number;
  additionalNotes: string;

  // 8. Consent
  consentGDPR: boolean;
  consentTreatment: boolean;
  consentCommunication: boolean;
  signatureData: string;
}

const emptyForm = (patientId: string): IntakeFormData => ({
  id: crypto.randomUUID(),
  patientId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  emergencyContact: "",
  acceptNotifications: false,
  visitReason: "",
  visitReasonTags: [],
  cardiovascular: false,
  cardiovascularDetails: "",
  diabetes: false,
  diabetesDetails: "",
  respiratory: false,
  respiratoryDetails: "",
  coagulation: false,
  coagulationDetails: "",
  infectious: false,
  infectiousDetails: "",
  allergies: false,
  allergiesDetails: "",
  anticoagulants: false,
  anticoagulantsDetails: "",
  bisphosphonates: false,
  bisphosphonatesDetails: "",
  currentMedication: false,
  currentMedicationDetails: "",
  drugAllergy: false,
  drugAllergyDetails: "",
  smoking: false,
  smokingDetails: "",
  alcohol: false,
  alcoholDetails: "",
  oralHygiene: "",
  pregnant: false,
  trimester: "",
  breastfeeding: false,
  problemDuration: "",
  painLevel: 0,
  additionalNotes: "",
  consentGDPR: false,
  consentTreatment: false,
  consentCommunication: false,
  signatureData: "",
});

interface IntakeFormStore {
  forms: IntakeFormData[];
  getForm: (patientId: string) => IntakeFormData | undefined;
  saveForm: (form: IntakeFormData) => void;
  createForm: (patientId: string) => IntakeFormData;
  deleteForm: (id: string) => void;
}

export const useIntakeFormStore = create<IntakeFormStore>((set, get) => ({
  forms: [],

  getForm: (patientId) => get().forms.find((f) => f.patientId === patientId),

  saveForm: (form) => {
    const updated = { ...form, updatedAt: new Date().toISOString() };
    set((s) => {
      const exists = s.forms.find((f) => f.id === form.id);
      if (exists) {
        return { forms: s.forms.map((f) => (f.id === form.id ? updated : f)) };
      }
      return { forms: [...s.forms, updated] };
    });
  },

  createForm: (patientId) => {
    const form = emptyForm(patientId);
    set((s) => ({ forms: [...s.forms, form] }));
    return form;
  },

  deleteForm: (id) => {
    set((s) => ({ forms: s.forms.filter((f) => f.id !== id) }));
  },
}));
