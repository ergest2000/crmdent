import { create } from "zustand";

interface ClinicSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  nipt: string;
  iban: string;
  bankName: string;
  vatRate: number;
  currency: string;
  currencySymbol: string;
  paymentTermsDays: number;
  workingHours: { day: string; hours: string }[];
}

interface SettingsStore {
  settings: ClinicSettings;
  updateSettings: (data: Partial<ClinicSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    name: "DenteOS Dental Clinic",
    phone: "+355 4 234 5678",
    email: "info@denteos.com",
    address: "Rr. Myslym Shyri, Nr. 42, Tiranë",
    nipt: "L91234567A",
    iban: "AL47 2121 1009 0000 0002 3569 8741",
    bankName: "Banka Kombëtare Tregtare (BKT)",
    vatRate: 20,
    currency: "ALL",
    currencySymbol: "L",
    paymentTermsDays: 14,
    workingHours: [
      { day: "E hënë – E premte", hours: "08:00 – 17:00" },
      { day: "E shtunë", hours: "09:00 – 13:00" },
      { day: "E diel", hours: "Mbyllur" },
    ],
  },
  updateSettings: (data) => {
    set((s) => ({ settings: { ...s.settings, ...data } }));
  },
}));
