// ============================================================================
//  DEMO USER / DEMO CLINIC  —  seed & reset
// ----------------------------------------------------------------------------
//  Qëllimi: një vizitor klikon "Fill demo credentials" -> Sign in dhe sheh
//  menjëherë një klinikë dentare të plotë e aktive (jo dashboard bosh).
//
//  Si funksionon (e rëndësishme):
//  1. `provisionDemo()` thërret edge-function `demo-provision` (service role) që
//     SIGURON demo user-in te auth.users + klinikën + profilin. Kjo bën që
//     "Sign in" të punojë menjëherë. Nuk mbush të dhëna domain.
//  2. Të dhënat domain (pacientë, mjekë, takime, fatura, shpenzime, etj.)
//     mbushen nga `resetDemoData()`, i cili ekzekutohet SI demo user (pas login),
//     kështu RLS + kolonat me `default auth.uid()` plotësohen saktë — njësoj si
//     kur i shton vetë përdoruesi nga UI.
//  3. Çdo rresht demo ka një identifikues të njohur (`DEMO-…` te id, ose `[DEMO]`
//     te description/notes). Reset fshin VETËM këta rreshta, kurrë të dhëna reale.
//  4. Të dhënat gjenerohen relativisht ndaj `new Date()`, që demo të mbetet
//     gjithmonë "aktual" (fatura/takime në muajt e këtij viti, takime sot, etj.).
// ============================================================================

import { supabase } from "@/integrations/supabase/client";
import { createInvoiceItem, calculateInvoiceTotals } from "@/lib/invoice-utils";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useFinanceStore } from "@/stores/finance-store";

export const DEMO_EMAIL = "demo@dentalcrm.com";
export const DEMO_PASSWORD = "demo123";
export const DEMO_CLINIC_ID = "de300000-0000-4000-8000-0000000000c1";
export const DEMO_CLINIC_NAME = "Klinika Dentare Demo";

export const isDemoEmail = (email?: string | null): boolean =>
  (email || "").trim().toLowerCase() === DEMO_EMAIL;

// Prefikset e reset-it të sigurt --------------------------------------------
const ID = {
  patient: "DEMO-PAT-",
  doctor: "DEMO-DOC-",
  treatment: "DEMO-TRT-",
  appointment: "DEMO-APT-",
  staff: "DEMO-STF-",
  invoice: "DEMO-INV-",
};
const EXPENSE_TAG = "[DEMO]"; // te expenses.description
const LEAD_TAG = "[DEMO]"; // te leads.notes

// ---------------------------------------------------------------------------
//  1) PROVISION — siguron demo user + klinikë + profil (edge function)
// ---------------------------------------------------------------------------
export async function provisionDemo(): Promise<{ ok: boolean; error?: string }> {
  try {
    // `functions.invoke` përdor automatikisht URL-në + anon key të klientit.
    const { data, error } = await supabase.functions.invoke("demo-provision", {
      body: {},
    });
    if (error) return { ok: false, error: error.message };
    if (data && (data as any).error) return { ok: false, error: (data as any).error };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ===========================================================================
//  Ndihmës për datat / random deterministik
// ===========================================================================
function seeded(seed: number) {
  // PRNG i thjeshtë (mulberry32) — rezultate të qëndrueshme mes reset-eve.
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = seeded(20260813);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const between = (min: number, max: number) => Math.round(min + rnd() * (max - min));

const ymd = (d: Date) => d.toISOString().split("T")[0];
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const dateInMonth = (year: number, month: number, day: number) =>
  ymd(new Date(year, month, Math.min(day, 28)));

// ===========================================================================
//  Katalogët e demo-s
// ===========================================================================
const TREATMENTS = [
  { name: "Dental Cleaning", category: "Preventive", price: 40, duration: 30 },
  { name: "Filling", category: "Restorative", price: 60, duration: 30 },
  { name: "Root Canal", category: "Endodontics", price: 180, duration: 60 },
  { name: "Extraction", category: "Surgery", price: 50, duration: 30 },
  { name: "Whitening", category: "Cosmetic", price: 150, duration: 45 },
  { name: "Implant", category: "Surgery", price: 700, duration: 90 },
  { name: "Consultation", category: "General", price: 20, duration: 20 },
  { name: "Orthodontic Check-up", category: "Orthodontics", price: 30, duration: 20 },
];

const DOCTORS = [
  { first: "Arben", last: "Shala", spec: "Ortodont", phone: "+355 69 201 1001", email: "arben.shala@demo.al" },
  { first: "Elona", last: "Beka", spec: "Kirurgji Orale & Implantologji", phone: "+355 69 201 1002", email: "elona.beka@demo.al" },
  { first: "Fatjon", last: "Rexha", spec: "Endodont", phone: "+355 69 201 1003", email: "fatjon.rexha@demo.al" },
  { first: "Mira", last: "Leka", spec: "Dentist i Përgjithshëm & Estetikë", phone: "+355 69 201 1004", email: "mira.leka@demo.al" },
];
const dentistLabel = (i: number) => `Dr. ${DOCTORS[i].last}`;

const WEEK = [
  { day: "Hënë", start: "09:00", end: "17:00" },
  { day: "Martë", start: "09:00", end: "17:00" },
  { day: "Mërkurë", start: "09:00", end: "17:00" },
  { day: "Enjte", start: "09:00", end: "17:00" },
  { day: "Premte", start: "09:00", end: "15:00" },
];

const FIRST_NAMES = [
  "Arben", "Elira", "Besnik", "Drita", "Fatmir", "Gentiana", "Ilir", "Jonida",
  "Klara", "Luan", "Mirela", "Naim", "Ornela", "Petrit", "Rudina", "Sokol",
  "Teuta", "Valon", "Xhesika", "Ylli", "Ardit", "Blerina",
];
const LAST_NAMES = [
  "Hoxha", "Krasniqi", "Gashi", "Berisha", "Musliu", "Rama", "Prifti", "Dervishi",
  "Topi", "Shehu", "Lika", "Kastrati", "Malaj", "Prendi", "Hyseni", "Doçi",
  "Kola", "Marku", "Bardhi", "Çela",
];

const LEAD_SOURCES: Array<"whatsapp" | "facebook" | "instagram" | "email" | "referral"> = [
  "whatsapp", "facebook", "instagram", "email", "referral",
];
// Statuset që UI i njeh: new/contacted/consulting/waiting/converted/lost
// (kërkesa: New / Contacted / Qualified≈consulting / Converted)
const LEAD_STATUSES = ["new", "contacted", "consulting", "waiting", "converted", "lost"];

// Statuset e takimeve që UI i stilizon: confirmed/pending/in-treatment/completed/cancelled
// (kërkesa: Scheduled≈pending / Confirmed / Completed / Cancelled)
const APT_STATUS = { scheduled: "pending", confirmed: "confirmed", completed: "completed", cancelled: "cancelled" };

// ===========================================================================
//  Gjeneratorët
// ===========================================================================
function buildTreatments(uid: string) {
  return TREATMENTS.map((t, i) => ({
    id: `${ID.treatment}${String(i + 1).padStart(2, "0")}`,
    name: t.name,
    category: t.category,
    price: t.price,
    price_all: t.price * 100,
    duration: t.duration,
    description: `${t.name} — trajtim demo`,
    user_id: uid,
  }));
}

function buildDoctors(uid: string, now: Date) {
  return DOCTORS.map((d, i) => ({
    id: `${ID.doctor}${String(i + 1).padStart(2, "0")}`,
    user_id: uid,
    first_name: d.first,
    last_name: d.last,
    specialization: d.spec,
    phone: d.phone,
    email: d.email,
    profile_photo: null,
    status: "active",
    join_date: ymd(new Date(now.getFullYear() - 1, i, 10)),
    schedule: WEEK,
    blocked_slots: [],
    stats: { patients: between(60, 180), treatments: between(120, 400), rating: 4 + Math.round(rnd() * 10) / 10 },
  }));
}

function buildStaff(uid: string, now: Date) {
  const rows: any[] = [];
  // 4 dentistë (pasqyrë e mjekëve)
  DOCTORS.forEach((d, i) => {
    rows.push({
      id: `${ID.staff}${String(i + 1).padStart(2, "0")}`,
      user_id: uid,
      first_name: d.first,
      last_name: d.last,
      role: "Dentist",
      phone: d.phone,
      email: d.email,
      status: "active",
      join_date: ymd(new Date(now.getFullYear() - 1, i, 10)),
      stats: { visits: between(80, 220), treatments: between(120, 400), rating: 4 + Math.round(rnd() * 10) / 10 },
    });
  });
  // recepsioniste + administrator
  rows.push({
    id: `${ID.staff}05`,
    user_id: uid,
    first_name: "Anila",
    last_name: "Meta",
    role: "Recepsioniste",
    phone: "+355 69 201 2001",
    email: "anila.meta@demo.al",
    status: "active",
    join_date: ymd(new Date(now.getFullYear() - 1, 2, 1)),
    stats: { visits: 0, treatments: 0, rating: 5 },
  });
  rows.push({
    id: `${ID.staff}06`,
    user_id: uid,
    first_name: "Endrit",
    last_name: "Bregu",
    role: "Administrator",
    phone: "+355 69 201 2002",
    email: "endrit.bregu@demo.al",
    status: "active",
    join_date: ymd(new Date(now.getFullYear() - 1, 0, 15)),
    stats: { visits: 0, treatments: 0, rating: 5 },
  });
  return rows;
}

function buildPatients(uid: string, now: Date) {
  const rows: any[] = [];
  const year = now.getFullYear();
  const allergiesPool = [[], [], ["Penicilinë"], ["Latex"], ["Ibuprofen"], ["Aspirinë"], ["Penicilinë", "Latex"]];
  for (let i = 0; i < 20; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[i % LAST_NAMES.length];
    // ~5 pacientë me vizitën e fundit këtë muaj (numërohen "të rinj"), pjesa tjetër më herët
    const lastVisit =
      i < 5
        ? dateInMonth(year, now.getMonth(), between(1, Math.max(2, now.getDate())))
        : dateInMonth(year, Math.max(0, now.getMonth() - between(1, 7)), between(1, 27));
    const docIdx = i % DOCTORS.length;

    // histori vizitash / trajtime të kryera
    const nrec = between(1, 3);
    const dentalRecords = Array.from({ length: nrec }).map(() => {
      const t = pick(TREATMENTS);
      return {
        toothNumber: between(11, 48),
        condition: pick(["filling", "root-canal", "crown", "healthy", "caries"]),
        date: dateInMonth(year, Math.max(0, now.getMonth() - between(0, 8)), between(1, 27)),
        dentist: dentistLabel(docIdx),
        treatment: t.name,
        cost: t.price,
        notes: "Trajtim demo",
      };
    });

    rows.push({
      id: `${ID.patient}${String(i + 1).padStart(3, "0")}`,
      user_id: uid,
      first_name: first,
      last_name: last,
      date_of_birth: ymd(new Date(between(1965, 2004), between(0, 11), between(1, 27))),
      phone: `+355 6${between(8, 9)} ${between(200, 999)} ${between(1000, 9999)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@email.al`,
      gender: i % 2 === 0 ? "male" : "female",
      address: `Rruga ${pick(["Myslym Shyri", "Kavajës", "Dëshmorët e 4 Shkurtit", "Bardhyl", "Elbasanit"])}, Tiranë`,
      status: i % 9 === 0 ? "suspended" : "active",
      allergies: pick(allergiesPool),
      last_visit: lastVisit,
      balance: pick([0, 0, 0, 40, 75, 120, 180, 300]),
      medical: { allergies: [], chronicDiseases: [], medications: [], medicalNotes: "" },
      dental_records: dentalRecords,
      documents: [],
      _docIdx: docIdx, // ndihmës i brendshëm (hiqet para insert)
    });
  }
  return rows;
}

function buildAppointments(uid: string, patients: any[], now: Date) {
  const rows: any[] = [];
  const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
  let counter = 0;
  const add = (dateStr: string, status: string, forceTreatment?: string) => {
    const p = pick(patients);
    const t = forceTreatment ? TREATMENTS.find((x) => x.name === forceTreatment)! : pick(TREATMENTS);
    rows.push({
      id: `${ID.appointment}${String(++counter).padStart(3, "0")}`,
      user_id: uid,
      patient_id: p.id,
      patient_name: `${p.first_name} ${p.last_name}`,
      date: dateStr,
      time: pick(times),
      treatment: t.name,
      dentist: dentistLabel(p._docIdx),
      status,
      notes: null,
      duration: t.duration,
    });
  };

  // Takimet e sotme (6) — status i përzier
  const today = ymd(now);
  add(today, APT_STATUS.confirmed, "Dental Cleaning");
  add(today, APT_STATUS.confirmed, "Filling");
  add(today, APT_STATUS.scheduled, "Consultation");
  add(today, APT_STATUS.completed, "Whitening");
  add(today, APT_STATUS.confirmed, "Root Canal");
  add(today, APT_STATUS.scheduled, "Orthodontic Check-up");

  // Të ardhshme (2 javët në vazhdim)
  for (let d = 1; d <= 14; d++) {
    const day = addDays(now, d);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue; // pa fundjavë
    const nr = between(2, 4);
    for (let k = 0; k < nr; k++) add(ymd(day), rnd() > 0.5 ? APT_STATUS.confirmed : APT_STATUS.scheduled);
  }

  // Të kaluara (30 ditët e fundit) — completed / ndonjë cancelled
  for (let d = 1; d <= 30; d++) {
    const day = addDays(now, -d);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue;
    const nr = between(1, 3);
    for (let k = 0; k < nr; k++) add(ymd(day), rnd() > 0.15 ? APT_STATUS.completed : APT_STATUS.cancelled);
  }

  return rows;
}

function buildInvoices(patients: any[], now: Date) {
  const rows: any[] = [];
  const year = now.getFullYear();
  let counter = 0;
  // Për çdo muaj të këtij viti deri sot: disa fatura -> të ardhura mujore realiste
  for (let m = 0; m <= now.getMonth(); m++) {
    const nr = between(5, 9);
    for (let k = 0; k < nr; k++) {
      const p = pick(patients);
      const nItems = between(1, 2);
      const rawItems = Array.from({ length: nItems }).map(() => {
        const t = pick(TREATMENTS);
        return createInvoiceItem(t.name, 1, t.price);
      });
      const totals = calculateInvoiceTotals(rawItems);
      // shpërndarje statusi: shumica paguar, disa pjesërisht, pak papaguar
      const r = rnd();
      let paid = totals.total;
      let status = "paid";
      if (r > 0.8) {
        paid = 0;
        status = "unpaid";
      } else if (r > 0.62) {
        paid = Math.round(totals.total * 0.5 * 100) / 100;
        status = "partial";
      }
      counter++;
      rows.push({
        id: `${ID.invoice}${String(counter).padStart(4, "0")}`,
        invoice_number: `FT-${year}-D${String(counter).padStart(4, "0")}`,
        patient_id: p.id,
        patient_name: `${p.first_name} ${p.last_name}`,
        date: dateInMonth(year, m, between(2, 27)),
        items: rawItems,
        total: totals.total,
        paid,
        status,
        notes: null,
        clinic_id: DEMO_CLINIC_ID,
      });
    }
  }
  return rows;
}

function buildExpenses(now: Date) {
  const rows: any[] = [];
  const year = now.getFullYear();
  for (let m = 0; m <= now.getMonth(); m++) {
    rows.push({ category: "salary", description: `${EXPENSE_TAG} Pagat e stafit`, amount: between(3800, 4600), date: dateInMonth(year, m, 1) });
    rows.push({ category: "rent", description: `${EXPENSE_TAG} Qiraja e klinikës`, amount: 1500, date: dateInMonth(year, m, 1) });
    rows.push({ category: "utilities", description: `${EXPENSE_TAG} Energji + ujë + internet`, amount: between(220, 360), date: dateInMonth(year, m, 5) });
    rows.push({ category: "supplies", description: `${EXPENSE_TAG} Materiale dentare`, amount: between(400, 900), date: dateInMonth(year, m, between(6, 12)) });
    if (rnd() > 0.6)
      rows.push({ category: "equipment", description: `${EXPENSE_TAG} Mirëmbajtje pajisjesh`, amount: between(150, 600), date: dateInMonth(year, m, between(13, 20)) });
    if (rnd() > 0.7)
      rows.push({ category: "other", description: `${EXPENSE_TAG} Marketing & të tjera`, amount: between(100, 400), date: dateInMonth(year, m, between(15, 25)) });
  }
  return rows;
}

function buildLeads(now: Date) {
  const rows: any[] = [];
  const n = between(12, 15);
  const msgs = [
    "Doja të dija çmimin e zbardhjes.",
    "Jam i interesuar për implant. A mund të vij për konsultë?",
    "A punoni edhe të shtunave?",
    "Sa kushton një pastrim dentar?",
    "Kam nevojë për kontroll urgjent.",
    "A ofroni pagesë me këste për implant?",
    "Doja të rezervoja një terminë për fëmijën tim.",
    "A bëni trajtim ortodontik për të rritur?",
  ];
  for (let i = 0; i < n; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    rows.push({
      name: `${first} ${last}`,
      phone: `+355 6${between(8, 9)} ${between(200, 999)} ${between(1000, 9999)}`,
      email: rnd() > 0.4 ? `${first.toLowerCase()}.${last.toLowerCase()}@gmail.com` : null,
      channel: pick(LEAD_SOURCES),
      status: pick(LEAD_STATUSES),
      last_message: pick(msgs),
      notes: `${LEAD_TAG} ${pick(msgs)}`,
    });
  }
  return rows;
}

// ===========================================================================
//  FSHIRJE (vetëm rreshtat demo, të sigurt)
// ===========================================================================
async function wipeDemoData() {
  await supabase.from("appointments").delete().like("id", `${ID.appointment}%`);
  await supabase.from("invoices").delete().like("id", `${ID.invoice}%`);
  await supabase.from("patients").delete().like("id", `${ID.patient}%`);
  await supabase.from("doctors").delete().like("id", `${ID.doctor}%`);
  await supabase.from("staff").delete().like("id", `${ID.staff}%`);
  await supabase.from("treatments").delete().like("id", `${ID.treatment}%`);
  await supabase.from("expenses").delete().like("description", `${EXPENSE_TAG}%`);
  await supabase.from("leads").delete().like("notes", `${LEAD_TAG}%`);
}

// ===========================================================================
//  RESET + SEED  (ekzekutohet SI demo user)
// ===========================================================================
export async function resetDemoData(): Promise<{ ok: boolean; error?: string }> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user || !isDemoEmail(user.email)) {
    return { ok: false, error: "Reset lejohet vetëm për demo user-in e loguar." };
  }
  const uid = user.id;
  const now = new Date();

  try {
    await wipeDemoData();

    const treatments = buildTreatments(uid);
    const doctors = buildDoctors(uid, now);
    const staff = buildStaff(uid, now);
    const patients = buildPatients(uid, now);
    const appointments = buildAppointments(uid, patients, now);
    const invoices = buildInvoices(patients, now);
    const expenses = buildExpenses(now);
    const leads = buildLeads(now);

    // hiq fushat ndihmëse të brendshme nga pacientët para insert
    const patientsClean = patients.map(({ _docIdx, ...rest }) => rest);

    const steps: Array<[string, any[]]> = [
      ["treatments", treatments],
      ["doctors", doctors],
      ["staff", staff],
      ["patients", patientsClean],
      ["appointments", appointments],
      ["invoices", invoices],
      ["expenses", expenses],
      ["leads", leads],
    ];

    for (const [table, rows] of steps) {
      // insert në copa (chunks) për të shmangur payload-e të mëdha
      for (let i = 0; i < rows.length; i += 50) {
        const chunk = rows.slice(i, i + 50);
        const { error } = await supabase.from(table as any).insert(chunk as any);
        if (error) console.error(`[demo] insert ${table}:`, error.message);
      }
    }

    // Rifresko store-t që s'rifreskohen te AppLayout (invoices & finance
    // ngarkohen te onAuthStateChange, që ndodh PARA reset-it).
    try {
      await useInvoiceStore.getState().fetchInvoices();
      await useFinanceStore.getState().fetchAll();
    } catch {
      /* injoro */
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ===========================================================================
//  Ndihmës i vetëm: provision + login-hook e bën Login.tsx.
//  Kjo funksion e kombinon reset-in me një kontroll “a ka të dhëna”.
// ===========================================================================
export async function ensureDemoReady(): Promise<void> {
  // Thirret pas login-it të demo user-it. Gjithmonë reset (garanton klinikë
  // të plotë e të pastër për çdo vizitor). Për ta bërë reset "periodik" në vend
  // të "çdo login", shih README-në e demo-s.
  await resetDemoData();
}
