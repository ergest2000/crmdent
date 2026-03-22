import { staffMembers } from "@/lib/mock-data";

export type Channel = "whatsapp" | "facebook" | "instagram" | "email";
export type LeadStatus = "new" | "contacted" | "consulting" | "waiting" | "converted" | "lost";

export const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  email: "Email",
  referral: "Referral",
};

export const channelColors: Record<string, string> = {
  whatsapp: "bg-emerald-100 text-emerald-800",
  facebook: "bg-blue-100 text-blue-800",
  instagram: "bg-pink-100 text-pink-800",
  email: "bg-amber-100 text-amber-800",
  referral: "bg-violet-100 text-violet-800",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "I ri",
  contacted: "Kontaktuar",
  consulting: "Në konsultim",
  waiting: "Në pritje",
  converted: "I konvertuar",
  lost: "I humbur",
};

export const leadStatusColors: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-amber-100 text-amber-800",
  consulting: "bg-purple-100 text-purple-800",
  waiting: "bg-secondary text-muted-foreground",
  converted: "bg-emerald-100 text-emerald-800",
  lost: "bg-red-100 text-red-800",
};

export interface Message {
  id: string;
  leadId: string;
  direction: "inbound" | "outbound";
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  channel: Channel;
  status: LeadStatus;
  assignedTo?: string;
  firstContact: string;
  lastMessage: string;
  notes?: string;
  convertedPatientId?: string;
}

// Mock leads
export const mockLeads: Lead[] = [
  {
    id: "LEAD-001", name: "Arta Dervishi", phone: "+355 69 876 5432",
    email: "arta.d@gmail.com", channel: "whatsapp", status: "new",
    assignedTo: "STF-003", firstContact: "2026-03-14T09:15:00",
    lastMessage: "Përshëndetje, doja të dija çmimin e zbardhjes.",
  },
  {
    id: "LEAD-002", name: "Klajdi Topi", phone: "+355 68 123 4567",
    channel: "instagram", status: "contacted", assignedTo: "STF-003",
    firstContact: "2026-03-13T14:30:00",
    lastMessage: "Faleminderit, do t'ju kthej përgjigje nesër.",
  },
  {
    id: "LEAD-003", name: "Migena Shehu", email: "migena.s@outlook.com",
    channel: "email", status: "consulting", assignedTo: "STF-001",
    firstContact: "2026-03-11T10:00:00",
    lastMessage: "Jam e interesuar për implant. A mund të vij për konsultë?",
  },
  {
    id: "LEAD-004", name: "Erjon Lika", phone: "+355 69 987 6543",
    channel: "facebook", status: "waiting", assignedTo: "STF-002",
    firstContact: "2026-03-10T16:45:00",
    lastMessage: "Po pres konfirmimin e terminës.",
  },
  {
    id: "LEAD-005", name: "Blerta Kastrati", phone: "+355 68 234 5678",
    email: "blerta.k@yahoo.com", channel: "whatsapp", status: "converted",
    assignedTo: "STF-003", firstContact: "2026-03-05T11:20:00",
    lastMessage: "Faleminderit, terminën e kam rezervuar.",
    convertedPatientId: "DEN-8827",
  },
  {
    id: "LEAD-006", name: "Driton Malaj", channel: "instagram", status: "lost",
    firstContact: "2026-03-01T08:30:00",
    lastMessage: "Nuk jam më i interesuar, faleminderit.",
  },
  {
    id: "LEAD-007", name: "Ornela Prendi", phone: "+355 69 345 6789",
    channel: "facebook", status: "new",
    firstContact: "2026-03-14T11:05:00",
    lastMessage: "A punoni edhe të shtunave? Kam nevojë për kontroll urgjent.",
  },
  {
    id: "LEAD-008", name: "Valmir Hyseni", email: "valmir.h@gmail.com",
    channel: "email", status: "contacted", assignedTo: "STF-001",
    firstContact: "2026-03-12T15:10:00",
    lastMessage: "Doja informacion rreth pagesës me këste për implant.",
  },
];

// Mock messages per lead
export const mockMessages: Message[] = [
  // LEAD-001
  { id: "MSG-001", leadId: "LEAD-001", direction: "inbound", content: "Përshëndetje, doja të dija çmimin e zbardhjes.", timestamp: "2026-03-14T09:15:00", read: false },
  { id: "MSG-002", leadId: "LEAD-001", direction: "inbound", content: "Gjithashtu a bëni edhe pastrim?", timestamp: "2026-03-14T09:16:00", read: false },
  // LEAD-002
  { id: "MSG-003", leadId: "LEAD-002", direction: "inbound", content: "Kam parë postimet tuaja në Instagram. A ofroni zbritje për klientë të rinj?", timestamp: "2026-03-13T14:30:00", read: true },
  { id: "MSG-004", leadId: "LEAD-002", direction: "outbound", content: "Përshëndetje Klajdi! Po, kemi oferta speciale për pacientë të rinj. A dëshironi të rezervoni një konsultë falas?", timestamp: "2026-03-13T14:45:00", read: true },
  { id: "MSG-005", leadId: "LEAD-002", direction: "inbound", content: "Faleminderit, do t'ju kthej përgjigje nesër.", timestamp: "2026-03-13T15:00:00", read: true },
  // LEAD-003
  { id: "MSG-006", leadId: "LEAD-003", direction: "inbound", content: "Përshëndetje, jam e interesuar për implant dentar. A mund të më jepni informacion?", timestamp: "2026-03-11T10:00:00", read: true },
  { id: "MSG-007", leadId: "LEAD-003", direction: "outbound", content: "Natyrisht Migena! Implanti kushton 1200€ dhe procedura zgjat rreth 90 minuta. Duhet fillimisht një konsultë diagnostike.", timestamp: "2026-03-11T10:30:00", read: true },
  { id: "MSG-008", leadId: "LEAD-003", direction: "inbound", content: "Jam e interesuar për implant. A mund të vij për konsultë?", timestamp: "2026-03-12T09:15:00", read: true },
  { id: "MSG-009", leadId: "LEAD-003", direction: "outbound", content: "Sigurisht! A ju përshtatet e mërkurë, 19 Mars, ora 10:00?", timestamp: "2026-03-12T09:45:00", read: true },
  // LEAD-004
  { id: "MSG-010", leadId: "LEAD-004", direction: "inbound", content: "Përshëndetje, doja të rezervoj një terminë për kontroll.", timestamp: "2026-03-10T16:45:00", read: true },
  { id: "MSG-011", leadId: "LEAD-004", direction: "outbound", content: "Përshëndetje Erjon! Do t'ju kontaktojmë brenda ditës për konfirmimin.", timestamp: "2026-03-10T17:00:00", read: true },
  { id: "MSG-012", leadId: "LEAD-004", direction: "inbound", content: "Po pres konfirmimin e terminës.", timestamp: "2026-03-11T10:00:00", read: true },
  // LEAD-005
  { id: "MSG-013", leadId: "LEAD-005", direction: "inbound", content: "Dua të bëj pastrim dhe kontroll.", timestamp: "2026-03-05T11:20:00", read: true },
  { id: "MSG-014", leadId: "LEAD-005", direction: "outbound", content: "Mirë se vini Blerta! Kemi hapësirë të premten, ora 14:00.", timestamp: "2026-03-05T11:45:00", read: true },
  { id: "MSG-015", leadId: "LEAD-005", direction: "inbound", content: "Faleminderit, terminën e kam rezervuar.", timestamp: "2026-03-05T12:00:00", read: true },
  // LEAD-007
  { id: "MSG-016", leadId: "LEAD-007", direction: "inbound", content: "A punoni edhe të shtunave? Kam nevojë për kontroll urgjent.", timestamp: "2026-03-14T11:05:00", read: false },
];
