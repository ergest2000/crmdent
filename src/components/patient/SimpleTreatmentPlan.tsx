import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, FileDown, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTreatmentStore } from "@/stores/treatment-store";
import { usePatientStore } from "@/stores/patient-store";
import { exportPDF } from "@/lib/export-utils";
import { toast } from "@/hooks/use-toast";

export type TreatmentItemStatus = "planned" | "in-progress" | "completed";

export interface TreatmentItem {
  id: string;
  name: string;
  description?: string;
  sessions: number;
  price: number;
  status: TreatmentItemStatus;
  startDate?: string;
  endDate?: string;
}

const statusLabels: Record<TreatmentItemStatus, { label: string; className: string }> = {
  "planned": { label: "Planifikuar", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  "in-progress": { label: "Në proces", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  "completed": { label: "Përfunduar", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
};

const emptyForm = {
  name: "",
  description: "",
  sessions: 1,
  price: 0,
  status: "planned" as TreatmentItemStatus,
  startDate: "",
  endDate: "",
  useCatalog: true,
  catalogId: "",
};

interface Props {
  patientId: string;
}

const STORAGE_KEY = (pid: string) => `crmdent:treatment-plan:${pid}`;

export function SimpleTreatmentPlan({ patientId }: Props) {
  const patient = usePatientStore((s) => s.patients.find((p) => p.id === patientId));
  const treatmentCatalog = useTreatmentStore((s) => s.treatments);
  const fetchTreatments = useTreatmentStore((s) => s.fetchTreatments);

  const [items, setItems] = useState<TreatmentItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(patientId));
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [patientId]);

  // Load catalog if empty
  useEffect(() => {
    if (treatmentCatalog.length === 0) fetchTreatments();
  }, [treatmentCatalog.length, fetchTreatments]);

  // Persist
  const persist = (next: TreatmentItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY(patientId), JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: TreatmentItem) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      description: item.description || "",
      sessions: item.sessions,
      price: item.price,
      status: item.status,
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      useCatalog: false,
      catalogId: "",
    });
    setDialogOpen(true);
  };

  const selectFromCatalog = (catalogId: string) => {
    const t = treatmentCatalog.find((x) => x.id === catalogId);
    if (t) {
      setForm((prev) => ({
        ...prev,
        catalogId,
        name: t.name,
        description: t.description || "",
        price: t.price,
      }));
    }
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "Emri i trajtimit është i detyrueshëm", variant: "destructive" });
      return;
    }
    if (form.sessions < 1) {
      toast({ title: "Seancat duhet të jenë të paktën 1", variant: "destructive" });
      return;
    }

    const base: TreatmentItem = {
      id: editId || `TP-${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sessions: form.sessions,
      price: form.price,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    if (editId) {
      persist(items.map((it) => (it.id === editId ? base : it)));
      toast({ title: "Trajtimi u përditësua" });
    } else {
      persist([...items, base]);
      toast({ title: "Trajtimi u shtua" });
    }

    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    persist(items.filter((it) => it.id !== deleteId));
    toast({ title: "Trajtimi u fshi" });
    setDeleteId(null);
  };

  const grandTotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.sessions, 0),
    [items]
  );

  const completedTotal = useMemo(
    () =>
      items
        .filter((it) => it.status === "completed")
        .reduce((sum, it) => sum + it.price * it.sessions, 0),
    [items]
  );

  const handleExportPDF = () => {
    if (items.length === 0) {
      toast({ title: "Nuk ka trajtime për eksportim", variant: "destructive" });
      return;
    }
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : patientId;
    exportPDF({
      title: `Plani i Trajtimit — ${patientName}`,
      filename: `plan-trajtimi-${patientId}`,
      columns: [
        { header: "#", key: "idx" },
        { header: "Trajtimi", key: "name" },
        { header: "Përshkrimi", key: "description" },
        { header: "Seancat", key: "sessions", align: "right" },
        { header: "Çmimi", key: "price", align: "right" },
        { header: "Total", key: "total", align: "right" },
        { header: "Statusi", key: "status" },
        { header: "Fillimi", key: "startDate" },
        { header: "Përfundimi", key: "endDate" },
      ],
      data: [
        ...items.map((it, i) => ({
          idx: i + 1,
          name: it.name,
          description: it.description || "—",
          sessions: it.sessions,
          price: `€${it.price.toFixed(2)}`,
          total: `€${(it.price * it.sessions).toFixed(2)}`,
          status: statusLabels[it.status].label,
          startDate: it.startDate || "—",
          endDate: it.endDate || "—",
        })),
        {
          idx: "",
          name: "",
          description: "",
          sessions: "",
          price: "TOTAL",
          total: `€${grandTotal.toFixed(2)}`,
          status: "",
          startDate: "",
          endDate: "",
        },
      ],
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Plani i Trajtimit</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.length} {items.length === 1 ? "trajtim" : "trajtime"} · {items.filter((i) => i.status === "completed").length} të përfunduara
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={handleExportPDF} disabled={items.length === 0}>
            <FileDown className="h-3.5 w-3.5" />
            Eksporto PDF
          </Button>
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" />
            Shto Trajtim
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        {items.length === 0 ? (
          <div className="p-10 text-center">
            <Stethoscope className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nuk ka trajtime të planifikuara.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Kliko "Shto Trajtim" për të filluar.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Trajtimi</th>
                <th className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Seancat</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Çmimi</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Total</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Datat</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.map((it) => {
                const total = it.price * it.sessions;
                const status = statusLabels[it.status];
                return (
                  <tr key={it.id} className="hover:bg-muted/30 transition-colors duration-150 group">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{it.name}</p>
                      {it.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{it.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm tabular-nums text-foreground">{it.sessions}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono tabular-nums text-muted-foreground">€{it.price.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono tabular-nums font-medium text-foreground">€{total.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {it.startDate && <p>▶ {it.startDate}</p>}
                        {it.endDate && <p>■ {it.endDate}</p>}
                        {!it.startDate && !it.endDate && <span>—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(it)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edito"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(it.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                          title="Fshi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Totals footer */}
        {items.length > 0 && (
          <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Të përfunduara</p>
                  <p className="text-sm font-mono tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                    €{completedTotal.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Mbetur</p>
                  <p className="text-sm font-mono tabular-nums font-medium text-amber-600 dark:text-amber-400">
                    €{(grandTotal - completedTotal).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Totali i planit</p>
                <p className="text-xl font-mono tabular-nums font-semibold text-foreground">
                  €{grandTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edito Trajtimin" : "Shto Trajtim të Ri"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Source toggle */}
            {!editId && (
              <div className="flex gap-2 p-1 bg-muted rounded-md">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, useCatalog: true })}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors ${form.useCatalog ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  Nga katalogu
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, useCatalog: false, catalogId: "" })}
                  className={`flex-1 text-xs py-1.5 rounded transition-colors ${!form.useCatalog ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  Manual
                </button>
              </div>
            )}

            {/* Catalog picker */}
            {!editId && form.useCatalog && (
              <div>
                <Label className="text-xs">Zgjidh nga lista e çmimeve</Label>
                <Select value={form.catalogId} onValueChange={selectFromCatalog}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={treatmentCatalog.length === 0 ? "Nuk ka trajtime në katalog" : "Zgjidh trajtimin..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {treatmentCatalog.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} — €{t.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs">Emri i trajtimit *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="p.sh. Mbushje kompozite"
                className="h-9 text-sm"
              />
            </div>

            <div>
              <Label className="text-xs">Përshkrimi</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detaje shtesë, zona e trajtimit, etj."
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Seancat *</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.sessions}
                  onChange={(e) => setForm({ ...form, sessions: parseInt(e.target.value) || 1 })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Çmimi / seancë (€)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Statusi</Label>
                <Select value={form.status} onValueChange={(v: TreatmentItemStatus) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planifikuar</SelectItem>
                    <SelectItem value="in-progress">Në proces</SelectItem>
                    <SelectItem value="completed">Përfunduar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Data e fillimit</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Data e përfundimit</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Live total preview */}
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/50 border border-border/50">
              <span className="text-xs text-muted-foreground">Totali i këtij trajtimi</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                €{(form.price * form.sessions).toFixed(2)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Anulo
            </Button>
            <Button size="sm" onClick={handleSave}>
              {editId ? "Ruaj ndryshimet" : "Shto Trajtimin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>
              Jeni i sigurt që doni të fshini këtë trajtim? Ky veprim nuk mund të kthehet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Fshi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
