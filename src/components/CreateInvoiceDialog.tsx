import { useState, useEffect } from "react";
import { Plus, Trash2, Receipt } from "lucide-react";
import { patients, treatments, staffMembers } from "@/lib/mock-data";
import { clinicConfig, createInvoiceItem, calculateInvoiceTotals, type PaymentMethod, type FiscalInvoice, type InvoiceCurrency, paymentMethodLabelsAL, currencyOptions } from "@/lib/invoice-utils";
import { useInvoiceStore } from "@/stores/invoice-store";
import { downloadInvoicePDF } from "@/lib/invoice-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedPatientId?: string;
  preselectedTreatment?: string;
  preselectedDentist?: string;
  editInvoice?: FiscalInvoice | null;
}

interface LineItem {
  treatmentId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  preselectedPatientId,
  preselectedTreatment,
  preselectedDentist,
  editInvoice,
}: CreateInvoiceDialogProps) {
  const addInvoice = useInvoiceStore((s) => s.addInvoice);
  const updateInvoice = useInvoiceStore((s) => s.updateInvoice);

  const [patientId, setPatientId] = useState(preselectedPatientId || "");
  const [dentist, setDentist] = useState(preselectedDentist || "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [currency, setCurrency] = useState<InvoiceCurrency>(editInvoice?.currency || "EUR");
  const [markAsPaid, setMarkAsPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>(
    preselectedTreatment
      ? [{
          treatmentId: "",
          description: preselectedTreatment,
          quantity: 1,
          unitPrice: treatments.find((t) => t.name === preselectedTreatment)?.price || 0,
        }]
      : [{ treatmentId: "", description: "", quantity: 1, unitPrice: 0 }]
  );

  // Populate form when editing
  useEffect(() => {
    if (open && editInvoice) {
      setPatientId(editInvoice.patientId);
      setDentist(editInvoice.dentist);
      setPaymentMethod(editInvoice.paymentMethod);
      setCurrency(editInvoice.currency || "EUR");
      setMarkAsPaid(editInvoice.status === "paid");
      setNotes(editInvoice.notes || "");
      setLineItems(editInvoice.items.map((item) => ({
        treatmentId: "",
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })));
    } else if (open && !editInvoice) {
      setPatientId(preselectedPatientId || "");
      setDentist(preselectedDentist || "");
      setPaymentMethod("cash");
      setCurrency("EUR");
      setMarkAsPaid(false);
      setNotes("");
      setLineItems(
        preselectedTreatment
          ? [{ treatmentId: "", description: preselectedTreatment, quantity: 1, unitPrice: treatments.find((t) => t.name === preselectedTreatment)?.price || 0 }]
          : [{ treatmentId: "", description: "", quantity: 1, unitPrice: 0 }]
      );
    }
  }, [open, editInvoice]);

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const selectedPatient = patients.find((p) => p.id === patientId);
  const dentists = staffMembers.filter((s) => s.role === "dentist");

  const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const vatAmount = subtotal * (clinicConfig.vatRate / 100);
  const total = subtotal + vatAmount;

  const addLineItem = () => {
    setLineItems([...lineItems, { treatmentId: "", description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map((li, i) => (i === index ? { ...li, ...updates } : li)));
  };

  const selectTreatment = (index: number, treatmentId: string) => {
    const treatment = treatments.find((t) => t.id === treatmentId);
    if (treatment) {
      updateLineItem(index, {
        treatmentId,
        description: treatment.name,
        unitPrice: treatment.price,
      });
    }
  };

  const canSubmit = patientId && dentist && lineItems.every((li) => li.description && li.unitPrice > 0);

  const handleSubmit = () => {
    if (!canSubmit || !selectedPatient) return;

    const selectedCurrency = currencyOptions.find((c) => c.value === currency)!;
    const invoiceData = {
      patientId,
      patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
      dentist,
      paymentMethod,
      currency,
      currencySymbol: selectedCurrency.symbol,
      items: lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
      })),
      notes: notes || undefined,
      markAsPaid,
    };

    if (editInvoice) {
      // Recalculate totals for update
      const items = lineItems.map((li) =>
        createInvoiceItem(li.description, li.quantity, li.unitPrice)
      );
      const totals = calculateInvoiceTotals(items);
      updateInvoice(editInvoice.id, {
        patientId,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        dentist,
        paymentMethod,
        currency,
        currencySymbol: selectedCurrency.symbol,
        items,
        subtotal: totals.subtotal,
        vatAmount: totals.vatAmount,
        total: totals.total,
        paid: markAsPaid ? total : editInvoice.paid,
        status: markAsPaid ? "paid" : editInvoice.status,
        notes: notes || undefined,
      });
      toast({ title: "Fatura u përditësua", description: `Fatura ${editInvoice.invoiceNumber} u ruajt me sukses.` });
    } else {
      const invoice = addInvoice(invoiceData);
      toast({
        title: "Faturë e krijuar",
        description: `${invoice.invoiceNumber} — ${clinicConfig.currencySymbol}${invoice.total.toFixed(2)} për ${selectedPatient.firstName} ${selectedPatient.lastName}`,
      });
      downloadInvoicePDF(invoice);
    }

    onOpenChange(false);
  };

  const isEdit = !!editInvoice;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-primary" />
            {isEdit ? "Edito Faturën" : "Krijo Faturë të Re"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Patient + Dentist */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Pacienti *</label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Zgjidh pacientin..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Dentisti *</label>
              <Select value={dentist} onValueChange={setDentist}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Zgjidh dentistin..." />
                </SelectTrigger>
                <SelectContent>
                  {dentists.map((d) => (
                    <SelectItem key={d.id} value={`Dr. ${d.lastName}`}>
                      Dr. {d.firstName} {d.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Shërbimet / Artikujt *</label>
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={addLineItem}>
                <Plus className="h-3 w-3" />
                Shto rresht
              </Button>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_2fr_80px_100px_32px] gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
                <span>Trajtimi</span>
                <span>Përshkrimi</span>
                <span className="text-center">Sasia</span>
                <span className="text-right">Çmimi ({currencyOptions.find(c => c.value === currency)?.symbol})</span>
                <span />
              </div>

              {lineItems.map((li, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_2fr_80px_100px_32px] gap-2 items-center">
                  <Select value={li.treatmentId} onValueChange={(v) => selectTreatment(idx, v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Zgjidh..." />
                    </SelectTrigger>
                    <SelectContent>
                      {treatments.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} (€{t.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    className="h-8 text-xs"
                    value={li.description}
                    onChange={(e) => updateLineItem(idx, { description: e.target.value })}
                    placeholder="Përshkrim manual..."
                  />
                  <Input
                    className="h-8 text-xs text-center"
                    type="number"
                    min={1}
                    value={li.quantity}
                    onChange={(e) => updateLineItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                  />
                  <Input
                    className="h-8 text-xs text-right font-mono"
                    type="number"
                    min={0}
                    step={0.01}
                    value={li.unitPrice}
                    onChange={(e) => updateLineItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <button
                    onClick={() => removeLineItem(idx)}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nëntotali:</span>
              <span className="font-mono tabular-nums text-foreground">{currencyOptions.find(c => c.value === currency)?.symbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">TVSH ({clinicConfig.vatRate}%):</span>
              <span className="font-mono tabular-nums text-foreground">{currencyOptions.find(c => c.value === currency)?.symbol}{vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-border/50 pt-1.5">
              <span className="text-foreground">TOTAL:</span>
              <span className="font-mono tabular-nums text-primary">{currencyOptions.find(c => c.value === currency)?.symbol}{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Currency + Payment method + paid toggle */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Monedha</label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as InvoiceCurrency)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">Metoda e pagesës</label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(paymentMethodLabelsAL) as [PaymentMethod, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {paymentMethod === "bank" && (
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  IBAN: <span className="font-mono">{clinicConfig.iban}</span>
                </p>
              )}
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center gap-3">
                <Switch checked={markAsPaid} onCheckedChange={setMarkAsPaid} />
                <label className="text-sm text-foreground">Shëno si të paguar</label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Shënime (opsionale)</label>
            <Input
              className="h-9 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Shënime shtesë për faturën..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Anulo
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSubmit} disabled={!canSubmit}>
            <Receipt className="h-3.5 w-3.5" />
            {isEdit ? "Ruaj Ndryshimet" : "Krijo & Shkarko PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
