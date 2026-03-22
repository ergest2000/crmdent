import { create } from "zustand";

export interface DoctorSchedule {
  day: string;
  start: string;
  end: string;
}

export interface BlockedSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
}

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
  addDoctor: (data: Omit<Doctor, "id" | "stats" | "blockedSlots">) => void;
  updateDoctor: (id: string, data: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  addBlockedSlot: (doctorId: string, slot: Omit<BlockedSlot, "id">) => void;
  removeBlockedSlot: (doctorId: string, slotId: string) => void;
}

const defaultDoctors: Doctor[] = [
  {
    id: "DOC-001",
    firstName: "Albana",
    lastName: "Shala",
    specialization: "Endodontics",
    phone: "+355 69 111 2233",
    email: "a.shala@denteos.com",
    status: "active",
    joinDate: "2020-06-15",
    schedule: [
      { day: "E hënë", start: "08:00", end: "16:00" },
      { day: "E martë", start: "08:00", end: "16:00" },
      { day: "E mërkurë", start: "08:00", end: "14:00" },
      { day: "E enjte", start: "08:00", end: "16:00" },
      { day: "E premte", start: "08:00", end: "14:00" },
      { day: "E shtunë", start: "09:00", end: "13:00" },
    ],
    blockedSlots: [],
    stats: { patients: 142, treatments: 128, rating: 4.8 },
  },
  {
    id: "DOC-002",
    firstName: "Luan",
    lastName: "Beka",
    specialization: "Surgery & Prosthetics",
    phone: "+355 69 222 3344",
    email: "l.beka@denteos.com",
    status: "active",
    joinDate: "2021-02-01",
    schedule: [
      { day: "E hënë", start: "09:00", end: "17:00" },
      { day: "E martë", start: "09:00", end: "17:00" },
      { day: "E mërkurë", start: "09:00", end: "17:00" },
      { day: "E enjte", start: "09:00", end: "17:00" },
      { day: "E premte", start: "09:00", end: "15:00" },
    ],
    blockedSlots: [],
    stats: { patients: 118, treatments: 105, rating: 4.6 },
  },
];

export const useDoctorStore = create<DoctorStore>((set) => ({
  doctors: defaultDoctors,

  addDoctor: (data) => {
    const id = `DOC-${Date.now()}`;
    set((s) => ({
      doctors: [...s.doctors, { ...data, id, blockedSlots: [], stats: { patients: 0, treatments: 0, rating: 0 } }],
    }));
  },

  updateDoctor: (id, data) => {
    set((s) => ({
      doctors: s.doctors.map((d) => (d.id === id ? { ...d, ...data } : d)),
    }));
  },

  deleteDoctor: (id) => {
    set((s) => ({ doctors: s.doctors.filter((d) => d.id !== id) }));
  },

  addBlockedSlot: (doctorId, slot) => {
    const slotWithId = { ...slot, id: `BLK-${Date.now()}` };
    set((s) => ({
      doctors: s.doctors.map((d) =>
        d.id === doctorId ? { ...d, blockedSlots: [...d.blockedSlots, slotWithId] } : d
      ),
    }));
  },

  removeBlockedSlot: (doctorId, slotId) => {
    set((s) => ({
      doctors: s.doctors.map((d) =>
        d.id === doctorId ? { ...d, blockedSlots: d.blockedSlots.filter((b) => b.id !== slotId) } : d
      ),
    }));
  },
}));
