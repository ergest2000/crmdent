export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  allergies: string[];
  status: "active" | "suspended" | "archived";
  lastVisit: string;
  balance: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dentist: string;
  treatment: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: "confirmed" | "pending" | "in-treatment" | "completed" | "cancelled";
  room: string;
}

export interface Treatment {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
}

export const patients: Patient[] = [
  { id: "DEN-8821", firstName: "Arben", lastName: "Hoxha", dateOfBirth: "1985-03-14", phone: "+355 69 234 5678", email: "arben.h@email.com", allergies: ["Penicillin"], status: "active", lastVisit: "2026-03-10", balance: 145.00 },
  { id: "DEN-8822", firstName: "Elira", lastName: "Krasniqi", dateOfBirth: "1992-07-22", phone: "+355 69 345 6789", email: "elira.k@email.com", allergies: [], status: "active", lastVisit: "2026-03-12", balance: 0 },
  { id: "DEN-8823", firstName: "Besnik", lastName: "Gashi", dateOfBirth: "1978-11-05", phone: "+355 68 456 7890", email: "besnik.g@email.com", allergies: ["Latex", "Ibuprofen"], status: "active", lastVisit: "2026-03-08", balance: 320.00 },
  { id: "DEN-8824", firstName: "Drita", lastName: "Berisha", dateOfBirth: "1990-01-18", phone: "+355 69 567 8901", email: "drita.b@email.com", allergies: [], status: "suspended", lastVisit: "2026-01-15", balance: 75.00 },
  { id: "DEN-8825", firstName: "Fatmir", lastName: "Musliu", dateOfBirth: "1965-09-30", phone: "+355 68 678 9012", email: "fatmir.m@email.com", allergies: [], status: "active", lastVisit: "2026-03-13", balance: 0 },
  { id: "DEN-8826", firstName: "Gentiana", lastName: "Rama", dateOfBirth: "1988-05-12", phone: "+355 69 789 0123", email: "gentiana.r@email.com", allergies: ["Aspirin"], status: "active", lastVisit: "2026-03-11", balance: 210.00 },
];

export const todayAppointments: Appointment[] = [
  { id: "APT-001", patientId: "DEN-8821", patientName: "Arben Hoxha", dentist: "Dr. Shala", treatment: "Root Canal", date: "2026-03-14", time: "09:00", duration: 60, status: "confirmed", room: "Salla 1" },
  { id: "APT-002", patientId: "DEN-8822", patientName: "Elira Krasniqi", dentist: "Dr. Shala", treatment: "Cleaning", date: "2026-03-14", time: "10:15", duration: 30, status: "in-treatment", room: "Salla 1" },
  { id: "APT-003", patientId: "DEN-8823", patientName: "Besnik Gashi", dentist: "Dr. Beka", treatment: "Crown Fitting", date: "2026-03-14", time: "09:30", duration: 45, status: "pending", room: "Salla 2" },
  { id: "APT-004", patientId: "DEN-8825", patientName: "Fatmir Musliu", dentist: "Dr. Beka", treatment: "Extraction", date: "2026-03-14", time: "11:00", duration: 30, status: "confirmed", room: "Salla 2" },
  { id: "APT-005", patientId: "DEN-8826", patientName: "Gentiana Rama", dentist: "Dr. Shala", treatment: "Filling", date: "2026-03-14", time: "11:00", duration: 30, status: "confirmed", room: "Salla 1" },
  { id: "APT-006", patientId: "DEN-8824", patientName: "Drita Berisha", dentist: "Dr. Beka", treatment: "Consultation", date: "2026-03-14", time: "14:00", duration: 20, status: "pending", room: "Salla 2" },
];

export const treatments: Treatment[] = [
  { id: "TRT-001", name: "Cleaning", category: "Preventive", price: 50, duration: 30 },
  { id: "TRT-002", name: "Filling", category: "Restorative", price: 80, duration: 30 },
  { id: "TRT-003", name: "Root Canal", category: "Endodontics", price: 350, duration: 60 },
  { id: "TRT-004", name: "Crown Fitting", category: "Prosthetics", price: 450, duration: 45 },
  { id: "TRT-005", name: "Extraction", category: "Surgery", price: 120, duration: 30 },
  { id: "TRT-006", name: "Consultation", category: "General", price: 30, duration: 20 },
  { id: "TRT-007", name: "Whitening", category: "Cosmetic", price: 200, duration: 45 },
  { id: "TRT-008", name: "Implant", category: "Surgery", price: 1200, duration: 90 },
];

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  items: { treatmentId: string; treatmentName: string; quantity: number; unitPrice: number }[];
  total: number;
  paid: number;
  status: "paid" | "partial" | "unpaid" | "overdue";
  dentist: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  patientName: string;
  amount: number;
  method: "cash" | "card" | "transfer" | "pos";
  date: string;
  note?: string;
}

export interface Expense {
  id: string;
  category: "supplies" | "salary" | "rent" | "utilities" | "equipment" | "other";
  description: string;
  amount: number;
  date: string;
  recurring: boolean;
}

export const invoices: Invoice[] = [
  {
    id: "INV-0041", patientId: "DEN-8821", patientName: "Arben Hoxha", date: "2026-03-10", dueDate: "2026-03-24",
    items: [{ treatmentId: "TRT-003", treatmentName: "Root Canal", quantity: 1, unitPrice: 350 }],
    total: 350, paid: 205, status: "partial", dentist: "Dr. Shala",
  },
  {
    id: "INV-0042", patientId: "DEN-8822", patientName: "Elira Krasniqi", date: "2026-03-12", dueDate: "2026-03-26",
    items: [{ treatmentId: "TRT-001", treatmentName: "Cleaning", quantity: 1, unitPrice: 50 }],
    total: 50, paid: 50, status: "paid", dentist: "Dr. Shala",
  },
  {
    id: "INV-0043", patientId: "DEN-8823", patientName: "Besnik Gashi", date: "2026-03-08", dueDate: "2026-03-22",
    items: [
      { treatmentId: "TRT-004", treatmentName: "Crown Fitting", quantity: 1, unitPrice: 450 },
      { treatmentId: "TRT-006", treatmentName: "Consultation", quantity: 1, unitPrice: 30 },
    ],
    total: 480, paid: 160, status: "partial", dentist: "Dr. Beka",
  },
  {
    id: "INV-0044", patientId: "DEN-8824", patientName: "Drita Berisha", date: "2026-01-15", dueDate: "2026-01-29",
    items: [{ treatmentId: "TRT-002", treatmentName: "Filling", quantity: 1, unitPrice: 80 }],
    total: 80, paid: 0, status: "overdue", dentist: "Dr. Beka",
  },
  {
    id: "INV-0045", patientId: "DEN-8825", patientName: "Fatmir Musliu", date: "2026-03-13", dueDate: "2026-03-27",
    items: [{ treatmentId: "TRT-007", treatmentName: "Whitening", quantity: 1, unitPrice: 200 }],
    total: 200, paid: 200, status: "paid", dentist: "Dr. Shala",
  },
  {
    id: "INV-0046", patientId: "DEN-8826", patientName: "Gentiana Rama", date: "2026-03-11", dueDate: "2026-03-25",
    items: [
      { treatmentId: "TRT-002", treatmentName: "Filling", quantity: 2, unitPrice: 80 },
      { treatmentId: "TRT-001", treatmentName: "Cleaning", quantity: 1, unitPrice: 50 },
    ],
    total: 210, paid: 0, status: "unpaid", dentist: "Dr. Shala",
  },
  {
    id: "INV-0047", patientId: "DEN-8821", patientName: "Arben Hoxha", date: "2026-02-20", dueDate: "2026-03-06",
    items: [{ treatmentId: "TRT-005", treatmentName: "Extraction", quantity: 1, unitPrice: 120 }],
    total: 120, paid: 120, status: "paid", dentist: "Dr. Beka",
  },
  {
    id: "INV-0048", patientId: "DEN-8823", patientName: "Besnik Gashi", date: "2026-02-15", dueDate: "2026-03-01",
    items: [{ treatmentId: "TRT-008", treatmentName: "Implant", quantity: 1, unitPrice: 1200 }],
    total: 1200, paid: 400, status: "overdue", dentist: "Dr. Beka",
  },
];

export const payments: Payment[] = [
  { id: "PAY-001", invoiceId: "INV-0041", patientName: "Arben Hoxha", amount: 205, method: "card", date: "2026-03-10" },
  { id: "PAY-002", invoiceId: "INV-0042", patientName: "Elira Krasniqi", amount: 50, method: "cash", date: "2026-03-12" },
  { id: "PAY-003", invoiceId: "INV-0043", patientName: "Besnik Gashi", amount: 160, method: "pos", date: "2026-03-08" },
  { id: "PAY-004", invoiceId: "INV-0045", patientName: "Fatmir Musliu", amount: 200, method: "transfer", date: "2026-03-13" },
  { id: "PAY-005", invoiceId: "INV-0047", patientName: "Arben Hoxha", amount: 120, method: "cash", date: "2026-02-20" },
  { id: "PAY-006", invoiceId: "INV-0048", patientName: "Besnik Gashi", amount: 400, method: "card", date: "2026-02-15" },
];

export const expenses: Expense[] = [
  { id: "EXP-001", category: "supplies", description: "Material dentare - furnizime mujore", amount: 850, date: "2026-03-01", recurring: true },
  { id: "EXP-002", category: "salary", description: "Pagat e stafit - Mars", amount: 4200, date: "2026-03-01", recurring: true },
  { id: "EXP-003", category: "rent", description: "Qiraja e klinikës", amount: 1500, date: "2026-03-01", recurring: true },
  { id: "EXP-004", category: "utilities", description: "Energji elektrike + ujë", amount: 280, date: "2026-03-05", recurring: true },
  { id: "EXP-005", category: "equipment", description: "Riparim autoklave", amount: 350, date: "2026-03-10", recurring: false },
  { id: "EXP-006", category: "supplies", description: "Doreza dhe maska", amount: 120, date: "2026-03-07", recurring: false },
  { id: "EXP-007", category: "other", description: "Sigurimi profesional", amount: 200, date: "2026-03-01", recurring: true },
];

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: "dentist" | "receptionist" | "accountant" | "admin" | "hygienist";
  specialization?: string;
  phone: string;
  email: string;
  schedule: { day: string; start: string; end: string }[];
  joinDate: string;
  status: "active" | "on-leave" | "inactive";
  stats: { visits: number; treatments: number; rating: number };
}

export interface Campaign {
  id: string;
  name: string;
  type: "sms" | "email" | "both";
  status: "active" | "draft" | "completed" | "paused";
  segment: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversions: number;
  startDate: string;
  endDate?: string;
}

export interface Reminder {
  id: string;
  patientName: string;
  type: "appointment" | "checkup" | "payment";
  channel: "sms" | "email";
  scheduledDate: string;
  status: "sent" | "pending" | "failed";
  message: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: "sms" | "email";
  subject?: string;
  body: string;
  category: "reminder" | "promotion" | "followup" | "billing";
}

export const staffMembers: StaffMember[] = [
  {
    id: "STF-001", firstName: "Albana", lastName: "Shala", role: "dentist", specialization: "Endodontics",
    phone: "+355 69 111 2233", email: "a.shala@denteos.com",
    schedule: [
      { day: "E hënë", start: "08:00", end: "16:00" },
      { day: "E martë", start: "08:00", end: "16:00" },
      { day: "E mërkurë", start: "08:00", end: "14:00" },
      { day: "E enjte", start: "08:00", end: "16:00" },
      { day: "E premte", start: "08:00", end: "14:00" },
      { day: "E shtunë", start: "09:00", end: "13:00" },
    ],
    joinDate: "2020-06-15", status: "active",
    stats: { visits: 142, treatments: 128, rating: 4.8 },
  },
  {
    id: "STF-002", firstName: "Luan", lastName: "Beka", role: "dentist", specialization: "Surgery & Prosthetics",
    phone: "+355 69 222 3344", email: "l.beka@denteos.com",
    schedule: [
      { day: "E hënë", start: "09:00", end: "17:00" },
      { day: "E martë", start: "09:00", end: "17:00" },
      { day: "E mërkurë", start: "09:00", end: "17:00" },
      { day: "E enjte", start: "09:00", end: "17:00" },
      { day: "E premte", start: "09:00", end: "15:00" },
    ],
    joinDate: "2021-02-01", status: "active",
    stats: { visits: 118, treatments: 105, rating: 4.6 },
  },
  {
    id: "STF-003", firstName: "Mirjeta", lastName: "Hajdari", role: "receptionist",
    phone: "+355 69 333 4455", email: "m.hajdari@denteos.com",
    schedule: [
      { day: "E hënë", start: "08:00", end: "16:00" },
      { day: "E martë", start: "08:00", end: "16:00" },
      { day: "E mërkurë", start: "08:00", end: "16:00" },
      { day: "E enjte", start: "08:00", end: "16:00" },
      { day: "E premte", start: "08:00", end: "16:00" },
      { day: "E shtunë", start: "09:00", end: "13:00" },
    ],
    joinDate: "2022-09-10", status: "active",
    stats: { visits: 0, treatments: 0, rating: 4.9 },
  },
  {
    id: "STF-004", firstName: "Artan", lastName: "Kelmendi", role: "hygienist", specialization: "Preventive Care",
    phone: "+355 68 444 5566", email: "a.kelmendi@denteos.com",
    schedule: [
      { day: "E hënë", start: "08:00", end: "14:00" },
      { day: "E martë", start: "08:00", end: "14:00" },
      { day: "E mërkurë", start: "08:00", end: "14:00" },
      { day: "E enjte", start: "08:00", end: "14:00" },
    ],
    joinDate: "2023-03-20", status: "active",
    stats: { visits: 86, treatments: 86, rating: 4.7 },
  },
  {
    id: "STF-005", firstName: "Vlora", lastName: "Morina", role: "accountant",
    phone: "+355 69 555 6677", email: "v.morina@denteos.com",
    schedule: [
      { day: "E hënë", start: "09:00", end: "17:00" },
      { day: "E martë", start: "09:00", end: "17:00" },
      { day: "E mërkurë", start: "09:00", end: "17:00" },
      { day: "E enjte", start: "09:00", end: "17:00" },
      { day: "E premte", start: "09:00", end: "15:00" },
    ],
    joinDate: "2021-08-01", status: "active",
    stats: { visits: 0, treatments: 0, rating: 0 },
  },
];

export const campaigns: Campaign[] = [
  { id: "CMP-001", name: "Ofertë zbardhje pranverore", type: "email", status: "active", segment: "Pacientë aktivë 25-45 vjeç", sentCount: 142, openRate: 68, clickRate: 22, conversions: 8, startDate: "2026-03-01", endDate: "2026-03-31" },
  { id: "CMP-002", name: "Kontroll 6-mujor", type: "sms", status: "active", segment: "Vizita e fundit > 5 muaj", sentCount: 56, openRate: 92, clickRate: 0, conversions: 18, startDate: "2026-03-10" },
  { id: "CMP-003", name: "Paketat familjare", type: "both", status: "draft", segment: "Pacientë me fëmijë", sentCount: 0, openRate: 0, clickRate: 0, conversions: 0, startDate: "2026-04-01" },
  { id: "CMP-004", name: "Kujtesë implanti", type: "email", status: "completed", segment: "Pacientë me implant", sentCount: 34, openRate: 76, clickRate: 35, conversions: 5, startDate: "2026-02-01", endDate: "2026-02-28" },
  { id: "CMP-005", name: "Promocion festash", type: "both", status: "paused", segment: "Të gjithë pacientët", sentCount: 210, openRate: 55, clickRate: 15, conversions: 12, startDate: "2025-12-15", endDate: "2026-01-05" },
];

export const reminders: Reminder[] = [
  { id: "REM-001", patientName: "Arben Hoxha", type: "appointment", channel: "sms", scheduledDate: "2026-03-13", status: "sent", message: "Ju kujtojmë terminën tuaj nesër në orën 09:00." },
  { id: "REM-002", patientName: "Besnik Gashi", type: "checkup", channel: "email", scheduledDate: "2026-03-15", status: "pending", message: "Është koha për kontrollin tuaj 6-mujor. Rezervoni terminën tani." },
  { id: "REM-003", patientName: "Drita Berisha", type: "payment", channel: "sms", scheduledDate: "2026-03-14", status: "sent", message: "Keni një balancë të papaguar prej €75.00. Ju lutem kontaktoni klinikën." },
  { id: "REM-004", patientName: "Gentiana Rama", type: "appointment", channel: "email", scheduledDate: "2026-03-13", status: "sent", message: "Termina juaj për Filling është konfirmuar për 14 Mars, ora 11:00." },
  { id: "REM-005", patientName: "Fatmir Musliu", type: "checkup", channel: "sms", scheduledDate: "2026-03-20", status: "pending", message: "Ka kaluar 6 muaj nga vizita juaj e fundit. Rezervoni kontrollin." },
  { id: "REM-006", patientName: "Elira Krasniqi", type: "appointment", channel: "sms", scheduledDate: "2026-03-13", status: "failed", message: "Numri i telefonit nuk u gjet." },
];

export const messageTemplates: MessageTemplate[] = [
  { id: "TPL-001", name: "Kujtesë termini", channel: "sms", body: "Përshëndetje {emri}! Ju kujtojmë terminën tuaj në DenteOS nesër në orën {ora}. Për ndryshime thirrni {telefon}.", category: "reminder" },
  { id: "TPL-002", name: "Kujtesë kontroll 6-mujor", channel: "email", subject: "Koha për kontrollin tuaj dental", body: "I/e nderuar {emri},\n\nKa kaluar 6 muaj nga vizita juaj e fundit. Kontrollimi i rregullt dental ndihmon në parandalimin e problemeve.\n\nRezervo terminën: {link}\n\nMe respekt,\nDenteOS", category: "reminder" },
  { id: "TPL-003", name: "Ofertë zbardhje", channel: "email", subject: "🦷 Ofertë speciale për zbardhje!", body: "Përshëndetje {emri}!\n\nPërfitoni 20% zbritje për trajtimin e zbardhjes këtë muaj.\n\nÇmimi special: €160 (nga €200)\n\nRezervo tani: {link}", category: "promotion" },
  { id: "TPL-004", name: "Falënderim pas vizitës", channel: "sms", body: "Faleminderit {emri} për vizitën në DenteOS! Nëse keni pyetje, na kontaktoni. Shëndet të mirë! 😊", category: "followup" },
  { id: "TPL-005", name: "Kujtesë pagese", channel: "sms", body: "Përshëndetje {emri}, keni një balancë të papaguar prej €{shuma}. Ju lutem kontaktoni klinikën ose paguani online: {link}", category: "billing" },
];

export const statusLabels: Record<string, string> = {
  confirmed: "Konfirmuar",
  pending: "Në pritje",
  "in-treatment": "Në trajtim",
  completed: "Përfunduar",
  cancelled: "Anuluar",
  active: "Aktiv",
  suspended: "Pezulluar",
  archived: "Arkivuar",
  paid: "Paguar",
  partial: "Pjesërisht",
  unpaid: "Papaguar",
  overdue: "Vonuar",
  draft: "Draft",
  paused: "Pauzuar",
  "on-leave": "Pushim",
  inactive: "Joaktiv",
  sent: "Dërguar",
  failed: "Dështuar",
};

export const expenseCategoryLabels: Record<string, string> = {
  supplies: "Furnizime",
  salary: "Paga",
  rent: "Qira",
  utilities: "Shërbime",
  equipment: "Pajisje",
  other: "Të tjera",
};

export const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  card: "Kartë",
  transfer: "Transfer",
  pos: "POS",
};

export const staffRoleLabels: Record<string, string> = {
  dentist: "Dentist",
  receptionist: "Recepsioniste",
  accountant: "Kontabilist",
  admin: "Administrator",
  hygienist: "Higjienist",
};

export const campaignTypeLabels: Record<string, string> = {
  sms: "SMS",
  email: "Email",
  both: "SMS & Email",
};

export const reminderTypeLabels: Record<string, string> = {
  appointment: "Terminë",
  checkup: "Kontroll",
  payment: "Pagesë",
};

export const templateCategoryLabels: Record<string, string> = {
  reminder: "Kujtesë",
  promotion: "Promocion",
  followup: "Ndjekje",
  billing: "Faturim",
};
