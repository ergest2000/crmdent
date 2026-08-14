import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/hooks/use-toast";
import {
  clinicConfig,
  createInvoiceItem,
  calculateInvoiceTotals,
  generateInvoiceNumber,
  type FiscalInvoice,
  type FiscalInvoiceItem,
  type PaymentMethod,
  type InvoiceType,
} from "@/lib/invoice-utils";

interface NewInvoiceData {
  patientId: string;
  patientName: string;
  dentist: string;
  paymentMethod: PaymentMethod;
  items: { description: string; quantity: number; unitPrice: number }[];
  notes?: string;
  markAsPaid?: boolean;
  currency: "EUR" | "ALL";
  currencySymbol: string;
  invoiceType?: InvoiceType;
}

interface InvoiceStore {
  invoices: FiscalInvoice[];
  loading: boolean;
  fetchInvoices: () => Promise<void>;
  addInvoice: (data: NewInvoiceData) => FiscalInvoice;
  updateInvoice: (id: string, data: Partial<FiscalInvoice>) => void;
  deleteInvoice: (id: string) => void;
  getPatientInvoices: (patientId: string) => FiscalInvoice[];
}

function normalizeItems(raw: any): FiscalInvoiceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) =>
    createInvoiceItem(
      it.description ?? it.treatmentName ?? "",
      Number(it.quantity) || 0,
      Number(it.unitPrice) || 0,
      typeof it.vatRate === "number" ? it.vatRate : clinicConfig.vatRate
    )
  );
}

function rowToInvoice(r: any): FiscalInvoice {
  const items = normalizeItems(r.items);
  const totals = calculateInvoiceTotals(items);
  return {
    id: r.id,
    invoiceNumber: r.invoice_number ?? r.id,
    patientId: r.patient_id ?? "",
    patientName: r.patient_name ?? "",
    date: r.date ?? "",
    time: "10:00",
    dueDate: r.date ?? "",
    items,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: parseFloat(r.total) || totals.total,
    paid: parseFloat(r.paid) || 0,
    status: (r.status ?? "unpaid") as FiscalInvoice["status"],
    paymentMethod: "cash",
    dentist: "",
    notes: r.notes ?? undefined,
    currency: "EUR",
    currencySymbol: "€",
    invoiceType: (r.invoice_type ?? "service") as InvoiceType,
  };
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => {
  supabase
    .channel("invoices-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => get().fetchInvoices())
    .subscribe();

  supabase.auth.onAuthStateChange((_e, session) => {
    if (session?.user) setTimeout(() => get().fetchInvoices(), 0);
  });

  return {
    invoices: [],
    loading: false,

    fetchInvoices: async () => {
      set({ loading: true });
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("fetchInvoices error:", error.message);
        set({ loading: false });
        return;
      }
      set({ invoices: (data || []).map(rowToInvoice), loading: false });
    },

    addInvoice: (data) => {
      const invoiceNumber = generateInvoiceNumber();
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
      const dueDate = new Date(now.getTime() + clinicConfig.paymentTermsDays * 86400000)
        .toISOString().split("T")[0];

      const items = data.items.map((it) =>
        createInvoiceItem(it.description, it.quantity, it.unitPrice)
      );
      const totals = calculateInvoiceTotals(items);
      const id = `INV-${Date.now()}`;
      const paid = data.markAsPaid ? totals.total : 0;
      const status: FiscalInvoice["status"] = data.markAsPaid ? "paid" : "unpaid";

      const invoice: FiscalInvoice = {
        id, invoiceNumber, patientId: data.patientId, patientName: data.patientName,
        date, time, dueDate, items,
        subtotal: totals.subtotal, vatAmount: totals.vatAmount, total: totals.total,
        paid, status, paymentMethod: data.paymentMethod, dentist: data.dentist,
        notes: data.notes, currency: data.currency, currencySymbol: data.currencySymbol,
        invoiceType: data.invoiceType ?? "service",
      };

      // Optimistik
      set((s) => ({ invoices: [invoice, ...s.invoices] }));

      // clinic_id shprehimisht (nga profili), qe fatura te mos mbetet pa klinike
      const clinicId = useAuthStore.getState().profile?.clinic_id ?? null;

      supabase.from("invoices").insert({
        id,
        invoice_number: invoiceNumber,
        patient_id: data.patientId,
        patient_name: data.patientName,
        date,
        items,
        total: totals.total,
        paid,
        status,
        notes: data.notes ?? null,
        invoice_type: data.invoiceType ?? "service",
        ...(clinicId ? { clinic_id: clinicId } : {}),
      }).then(({ error }) => {
        if (error) {
          console.error("addInvoice persist error:", error.message);
          toast({ title: "Fatura s'u ruajt në bazë", description: error.message, variant: "destructive" });
        }
      });

      return invoice;
    },

    updateInvoice: (id, data) => {
      set((s) => ({ invoices: s.invoices.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)) }));
      const payload: Record<string, any> = {};
      if (data.patientName !== undefined) payload.patient_name = data.patientName;
      if (data.date !== undefined) payload.date = data.date;
      if (data.total !== undefined) payload.total = data.total;
      if (data.paid !== undefined) payload.paid = data.paid;
      if (data.status !== undefined) payload.status = data.status;
      if (data.notes !== undefined) payload.notes = data.notes;
      if (data.items !== undefined) payload.items = data.items;
      if (data.invoiceType !== undefined) payload.invoice_type = data.invoiceType;
      if (Object.keys(payload).length > 0) {
        supabase.from("invoices").update(payload).eq("id", id).then(({ error }) => {
          if (error) console.error("updateInvoice persist error:", error.message);
        });
      }
    },

    deleteInvoice: (id) => {
      set((s) => ({ invoices: s.invoices.filter((inv) => inv.id !== id) }));
      supabase.from("invoices").delete().eq("id", id).then(({ error }) => {
        if (error) console.error("deleteInvoice error:", error.message);
      });
    },

    getPatientInvoices: (patientId) => get().invoices.filter((inv) => inv.patientId === patientId),
  };
});
