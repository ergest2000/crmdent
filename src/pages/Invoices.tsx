import { useState } from "react";
import { Search, Plus, Download, Eye, ChevronDown, Printer, Pencil, Trash2 } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { clinicConfig, invoiceTypeLabelsAL } from "@/lib/invoice-utils";
import { downloadInvoicePDF, generateInvoicePDF } from "@/lib/invoice-pdf";
import { useInvoiceStore } from "@/stores/invoice-store";
import { InvoicePreview } from "@/components/InvoicePreview";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { FiscalInvoice, InvoiceType } from "@/lib/invoice-utils";

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | InvoiceType>("all");
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<FiscalInvoice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<FiscalInvoice | null>(null);

  const fiscalInvoices = useInvoiceStore((s) => s.invoices);
  const deleteInvoice = useInvoiceStore((s) => s.deleteInvoice);

  const invType = (inv: FiscalInvoice): InvoiceType => inv.invoiceType || "service";

  const filtered = fiscalInvoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchesSearch =
      inv.patientName.toLowerCase().includes(q) ||
      inv.invoiceNumber.toLowerCase().includes(q);
    const matchesType = typeFilter === "all" || invType(inv) === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalFaturuar = fiscalInvoices.reduce((s, i) => s + i.total, 0);
  const totalPagesa = fiscalInvoices.filter((i) => invType(i) === "payment").reduce((s, i) => s + i.total, 0);
  const totalSherbim = fiscalInvoices.filter((i) => invType(i) === "service").reduce((s, i) => s + i.total, 0);

  const handleDownloadPDF = (inv: FiscalInvoice) => {
    downloadInvoicePDF(inv);
    toast({ title: "PDF i shkarkuar", description: `Fatura ${inv.invoiceNumber} u shkarkua me sukses.` });
  };

  const handleDelete = (inv: FiscalInvoice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Je i sigurt që dëshiron të fshish faturën ${inv.invoiceNumber}?`)) {
      deleteInvoice(inv.id);
      toast({ title: "Fatura u fshi", description: `Fatura ${inv.invoiceNumber} u fshi me sukses.` });
    }
  };

  const handleEdit = (inv: FiscalInvoice, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditInvoice(inv);
    setCreateOpen(true);
  };

  const handlePrint = (inv: FiscalInvoice) => {
    const doc = generateInvoicePDF(inv);
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Faturat</h1>
          <p className="text-sm text-muted-foreground">
            {fiscalInvoices.length} fatura · NIPT: {clinicConfig.nipt}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportPDF={() => {
              const config = {
                title: "Lista e Faturave",
                filename: "faturat",
                columns: [
                  { header: "Nr. Faturës", key: "invoiceNumber" },
                  { header: "Pacienti", key: "patient" },
                  { header: "Data", key: "date" },
                  { header: "Total", key: "total", align: "right" as const },
                ],
                data: filtered.map((inv) => ({
                  invoiceNumber: inv.invoiceNumber,
                  patient: inv.patientName,
                  date: inv.date,
                  total: `${inv.currencySymbol || "€"}${inv.total.toFixed(2)}`,
                })),
              };
              exportPDF(config);
            }}
            onExportCSV={() => {
              const config = {
                title: "Lista e Faturave",
                filename: "faturat",
                columns: [
                  { header: "Nr. Faturës", key: "invoiceNumber" },
                  { header: "Pacienti", key: "patient" },
                  { header: "Data", key: "date" },
                  { header: "Total", key: "total" },
                ],
                data: filtered.map((inv) => ({
                  invoiceNumber: inv.invoiceNumber,
                  patient: inv.patientName,
                  date: inv.date,
                  total: `${inv.currencySymbol || "€"}${inv.total.toFixed(2)}`,
                })),
              };
              exportCSV(config);
            }}
          />
          <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Krijo Faturë
          </Button>
        </div>
      </div>

      {/* Summary — total + të ndara sipas llojit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
        <div className="rounded-card bg-card p-4 shadow-subtle">
          <p className="text-xs text-muted-foreground mb-1">Totali i faturuar</p>
          <p className="text-xl font-semibold tabular-nums font-mono text-foreground">€{totalFaturuar.toFixed(2)}</p>
        </div>
        <div className="rounded-card bg-card p-4 shadow-subtle">
          <p className="text-xs text-muted-foreground mb-1">{invoiceTypeLabelsAL.payment}</p>
          <p className="text-xl font-semibold tabular-nums font-mono text-blue-700">€{totalPagesa.toFixed(2)}</p>
        </div>
        <div className="rounded-card bg-card p-4 shadow-subtle">
          <p className="text-xs text-muted-foreground mb-1">{invoiceTypeLabelsAL.service}</p>
          <p className="text-xl font-semibold tabular-nums font-mono text-emerald-700">€{totalSherbim.toFixed(2)}</p>
        </div>
      </div>

      {/* Filtri sipas llojit */}
      <div className="flex gap-1.5">
        {([
          { key: "all", label: "Të gjitha" },
          { key: "payment", label: invoiceTypeLabelsAL.payment },
          { key: "service", label: invoiceTypeLabelsAL.service },
        ] as { key: "all" | InvoiceType; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              typeFilter === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Kërko me emër ose nr. fature..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Invoices Table */}
      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5 w-8" />
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Fatura</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Pacienti</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
              <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Total (me TVSH)</th>
              <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((inv, i) => {
              const isExpanded = expandedInvoice === inv.id;

              return (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...clinicalTransition, delay: i * 0.03 }}
                  className="group"
                >
                  <td colSpan={6} className="p-0">
                    <div
                      className="flex items-center hover:bg-muted/30 transition-colors duration-150 cursor-pointer"
                      onClick={() => setExpandedInvoice(isExpanded ? null : inv.id)}
                    >
                      <div className="px-4 py-3 w-8">
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                      </div>
                      <div className="px-4 py-3 flex-1">
                        <span className="text-xs font-mono text-muted-foreground">{inv.invoiceNumber}</span>
                        <div className="mt-0.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            invType(inv) === "payment"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {invoiceTypeLabelsAL[invType(inv)]}
                          </span>
                        </div>
                      </div>
                      <div className="px-4 py-3 flex-1">
                        <p className="text-sm font-medium text-foreground">{inv.patientName}</p>
                        <p className="text-xs text-muted-foreground">{inv.dentist}</p>
                      </div>
                      <div className="px-4 py-3 flex-1">
                        <span className="text-sm tabular-nums text-foreground">{inv.date}</span>
                        <p className="text-xs text-muted-foreground">{inv.time}</p>
                      </div>
                      <div className="px-4 py-3 flex-1 text-right">
                        <span className="text-sm font-medium tabular-nums font-mono text-foreground">
                          {inv.currencySymbol || clinicConfig.currencySymbol}{inv.total.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-muted-foreground">TVSH: {inv.currencySymbol || clinicConfig.currencySymbol}{inv.vatAmount.toFixed(2)}</p>
                      </div>
                      <div className="px-4 py-3 flex-1 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setPreviewInvoice(inv); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Shiko">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={(e) => handleEdit(inv, e)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edito">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(inv); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Shkarko PDF">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handlePrint(inv); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Printo">
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={(e) => handleDelete(inv, e)} className="p-1.5 rounded-md hover:bg-muted text-destructive hover:text-destructive transition-colors" title="Fshi">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-muted/20 border-t border-border/30 px-8 py-4"
                      >
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Artikujt</h4>
                            <div className="space-y-1.5">
                              {inv.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-foreground">{item.description} {item.quantity > 1 && <span className="text-muted-foreground">×{item.quantity}</span>}</span>
                                  <span className="font-mono tabular-nums text-foreground">{inv.currencySymbol || clinicConfig.currencySymbol}{item.total.toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                                <span>Nëntotal</span>
                                <span className="font-mono tabular-nums">{inv.currencySymbol || clinicConfig.currencySymbol}{inv.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>TVSH {clinicConfig.vatRate}%</span>
                                <span className="font-mono tabular-nums">{inv.currencySymbol || clinicConfig.currencySymbol}{inv.vatAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm font-medium pt-1 border-t border-border/30">
                                <span className="text-foreground">Total</span>
                                <span className="font-mono tabular-nums text-foreground">{inv.currencySymbol || clinicConfig.currencySymbol}{inv.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Detaje</h4>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">NIPT:</span>
                                <span className="font-mono text-foreground">{clinicConfig.nipt}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">IBAN:</span>
                                <span className="font-mono text-foreground text-xs">{clinicConfig.iban}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">TVSH:</span>
                                <span className="text-foreground">{clinicConfig.vatRate}%</span>
                              </div>
                              {inv.notes && (
                                <div className="pt-2 border-t border-border/30">
                                  <span className="text-muted-foreground">Shënim: </span>
                                  <span className="text-foreground">{inv.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Nuk u gjet asnjë faturë.</div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-4 pb-2 flex flex-row items-center justify-between sticky top-0 bg-background z-10 border-b">
            <DialogTitle className="text-sm font-medium">Fatura {previewInvoice?.invoiceNumber}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => previewInvoice && handleDownloadPDF(previewInvoice)}>
                <Download className="h-3.5 w-3.5" />Shkarko PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => previewInvoice && handlePrint(previewInvoice)}>
                <Printer className="h-3.5 w-3.5" />Printo
              </Button>
            </div>
          </DialogHeader>
          <div className="p-4 bg-muted/30">
            {previewInvoice && <InvoicePreview invoice={previewInvoice} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Invoice Dialog */}
      <CreateInvoiceDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setEditInvoice(null);
        }}
        editInvoice={editInvoice}
      />
    </div>
  );
}
