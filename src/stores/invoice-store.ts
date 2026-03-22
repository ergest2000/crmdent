import { create } from "zustand";
import {
  clinicConfig,
  createInvoiceItem,
  calculateInvoiceTotals,
  generateInvoiceNumber,
  type FiscalInvoice,
  type PaymentMethod,
} from "@/lib/invoice-utils";
import { invoices as mockInvoices } from "@/lib/mock-data";

// Convert legacy mock invoices to fiscal format on init
function mockToFiscal(inv: typeof mockInvoices[0]): FiscalInvoice {
  const items = inv.items.map((item) =>
    createInvoiceItem(item.treatmentName, item.quantity, item.unitPrice)
  );
  const totals = calculateInvoiceTotals(items);
  return {
    id: inv.id,
    invoiceNumber: inv.id.replace("INV-", `${clinicConfig.invoicePrefix}-2026-`),
    patientId: inv.patientId,
    patientName: inv.patientName,
    date: inv.date,
    time: "10:00",
    dueDate: inv.dueDate,
    items,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: totals.total,
    paid: inv.paid * 1.2,
    status: inv.status,
    paymentMethod: "cash",
    dentist: inv.dentist,
    currency: "EUR",
    currencySymbol: "€",
  };
}

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
}

interface InvoiceStore {
  invoices: FiscalInvoice[];
  addInvoice: (data: NewInvoiceData) => FiscalInvoice;
  updateInvoice: (id: string, data: Partial<FiscalInvoice>) => void;
  deleteInvoice: (id: string) => void;
  getPatientInvoices: (patientId: string) => FiscalInvoice[];
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: mockInvoices.map(mockToFiscal),

  addInvoice: (data) => {
    const invoiceNumber = generateInvoiceNumber();
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
    const dueDate = new Date(now.getTime() + clinicConfig.paymentTermsDays * 86400000)
      .toISOString()
      .split("T")[0];

    const items = data.items.map((item) =>
      createInvoiceItem(item.description, item.quantity, item.unitPrice)
    );
    const totals = calculateInvoiceTotals(items);

    const invoice: FiscalInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber,
      patientId: data.patientId,
      patientName: data.patientName,
      date,
      time,
      dueDate,
      items,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      paid: data.markAsPaid ? totals.total : 0,
      status: data.markAsPaid ? "paid" : "unpaid",
      paymentMethod: data.paymentMethod,
      dentist: data.dentist,
      notes: data.notes,
      currency: data.currency,
      currencySymbol: data.currencySymbol,
    };

    set((state) => ({ invoices: [invoice, ...state.invoices] }));
    return invoice;
  },

  updateInvoice: (id, data) => {
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)),
    }));
  },

  deleteInvoice: (id) => {
    set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }));
  },

  getPatientInvoices: (patientId) => {
    return get().invoices.filter((inv) => inv.patientId === patientId);
  },
}));
