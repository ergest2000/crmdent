// Clinic configuration for Albanian invoicing
export const clinicConfig = {
  name: "DenteOS Dental Clinic",
  nipt: "L91234567A", // NIPT (Numri i Identifikimit për Personin e Tatueshëm)
  address: "Rr. Myslym Shyri, Nr. 42, Tiranë, Shqipëri",
  phone: "+355 4 234 5678",
  email: "info@denteos.com",
  iban: "AL47 2121 1009 0000 0002 3569 8741",
  bankName: "Banka Kombëtare Tregtare (BKT)",
  vatRate: 20, // TVSH 20% në Shqipëri
  currency: "ALL", // Lek shqiptar (mund të ndryshohet në EUR)
  currencySymbol: "L",
  invoicePrefix: "FT",
  paymentTermsDays: 14,
};

export type InvoiceStatus = "paid" | "partial" | "unpaid" | "overdue";
export type PaymentMethod = "cash" | "card" | "bank" | "pos";
export type InvoiceCurrency = "EUR" | "ALL";

export interface FiscalInvoice {
  id: string;
  invoiceNumber: string; // FT-2026-00001
  patientId: string;
  patientName: string;
  patientAddress?: string;
  patientNipt?: string; // për faturat B2B
  date: string;
  time: string;
  dueDate: string;
  items: FiscalInvoiceItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  paid: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  dentist: string;
  notes?: string;
  currency: InvoiceCurrency;
  currencySymbol: string;
}

export interface FiscalInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  vatAmount: number;
  total: number;
}

// Generate sequential invoice number
let invoiceCounter = 48; // starting after existing mock invoices
export function generateInvoiceNumber(): string {
  invoiceCounter++;
  const year = new Date().getFullYear();
  return `${clinicConfig.invoicePrefix}-${year}-${String(invoiceCounter).padStart(5, "0")}`;
}

// Create invoice items from treatment data with VAT calculation
export function createInvoiceItem(
  description: string,
  quantity: number,
  unitPrice: number,
  vatRate: number = clinicConfig.vatRate
): FiscalInvoiceItem {
  const subtotal = quantity * unitPrice;
  const vatAmount = subtotal * (vatRate / 100);
  return {
    description,
    quantity,
    unitPrice,
    vatRate,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round((subtotal + vatAmount) * 100) / 100,
  };
}

// Calculate invoice totals
export function calculateInvoiceTotals(items: FiscalInvoiceItem[]) {
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const vatAmount = items.reduce((s, i) => s + i.vatAmount, 0);
  const total = items.reduce((s, i) => s + i.total, 0);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// Format date Albanian style
export function formatDateAL(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("sq-AL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Convert number to Albanian words (simplified for invoices)
export function numberToWordsAL(num: number): string {
  if (num === 0) return "zero";
  const units = ["", "një", "dy", "tre", "katër", "pesë", "gjashtë", "shtatë", "tetë", "nëntë"];
  const teens = ["dhjetë", "njëmbëdhjetë", "dymbëdhjetë", "trembëdhjetë", "katërmbëdhjetë", "pesëmbëdhjetë", "gjashtëmbëdhjetë", "shtatëmbëdhjetë", "tetëmbëdhjetë", "nëntëmbëdhjetë"];
  const tens = ["", "", "njëzet", "tridhjetë", "dyzet", "pesëdhjetë", "gjashtëdhjetë", "shtatëdhjetë", "tetëdhjetë", "nëntëdhjetë"];

  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 100);

  let result = "";
  if (whole >= 1000) {
    const thousands = Math.floor(whole / 1000);
    result += (thousands === 1 ? "një mijë" : units[thousands] + " mijë") + " ";
  }
  const remainder = whole % 1000;
  if (remainder >= 100) {
    const hundreds = Math.floor(remainder / 100);
    result += (hundreds === 1 ? "njëqind" : units[hundreds] + "qind") + " ";
  }
  const lastTwo = remainder % 100;
  if (lastTwo >= 10 && lastTwo < 20) {
    result += teens[lastTwo - 10];
  } else {
    if (lastTwo >= 20) result += tens[Math.floor(lastTwo / 10)] + " e ";
    if (lastTwo % 10 > 0) result += units[lastTwo % 10];
  }

  result = result.trim();
  if (decimal > 0) {
    result += ` dhe ${decimal}/100`;
  }

  return result;
}

export const paymentMethodLabelsAL: Record<PaymentMethod, string> = {
  cash: "Para në dorë",
  card: "Kartë krediti/debiti",
  bank: "Transfertë bankare",
  pos: "Terminal POS",
};

export const currencyOptions: { value: InvoiceCurrency; label: string; symbol: string }[] = [
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "ALL", label: "Lekë (ALL)", symbol: "L" },
];
