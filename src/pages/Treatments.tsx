import { useState } from "react";
import { useTreatmentStore, type FullTreatment } from "@/stores/treatment-store";
import { TreatmentDialog } from "@/components/TreatmentDialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const categoryColors: Record<string, string> = {
  Preventive: "bg-clinical-50 text-clinical-900",
  Restorative: "bg-blue-50 text-blue-800",
  Endodontics: "bg-amber-50 text-amber-800",
  Prosthetics: "bg-purple-50 text-purple-800",
  Surgery: "bg-red-50 text-red-800",
  General: "bg-secondary text-secondary-foreground",
  Cosmetic: "bg-pink-50 text-pink-800",
};

export default function Treatments() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTreatment, setEditTreatment] = useState<FullTreatment | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const treatments = useTreatmentStore((s) => s.treatments);
  const deleteTreatment = useTreatmentStore((s) => s.deleteTreatment);

  const filtered = treatments.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Trajtimet & Shërbimet</h1>
          <p className="text-sm text-muted-foreground">{treatments.length} procedura të regjistruara</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportPDF={() => {
              const config = { title: "Trajtimet & Shërbimet", filename: "trajtimet", columns: [
                { header: "Emri", key: "name" }, { header: "Kategoria", key: "category" }, { header: "Çmimi", key: "price", align: "right" as const }, { header: "Kohëzgjatja", key: "duration", align: "right" as const },
              ], data: filtered.map((t) => ({ name: t.name, category: t.category, price: `€${t.price}`, duration: `${t.duration} min` })) };
              exportPDF(config);
            }}
            onExportCSV={() => {
              const config = { title: "Trajtimet & Shërbimet", filename: "trajtimet", columns: [
                { header: "Emri", key: "name" }, { header: "Kategoria", key: "category" }, { header: "Çmimi", key: "price" }, { header: "Kohëzgjatja", key: "duration" },
              ], data: filtered.map((t) => ({ name: t.name, category: t.category, price: `€${t.price}`, duration: `${t.duration} min` })) };
              exportCSV(config);
            }}
          />
          <Button size="sm" className="gap-1.5" onClick={() => { setEditTreatment(undefined); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Shto Procedurë
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Kërko procedurë..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {filtered.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...clinicalTransition, delay: i * 0.03 }}
            className="rounded-card bg-card p-4 shadow-subtle hover:shadow-interactive transition-shadow duration-150 group relative"
          >
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditTreatment(t); setDialogOpen(true); }} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setDeleteId(t.id)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${categoryColors[t.category] || "bg-secondary text-muted-foreground"}`}>
                {t.category}
              </span>
              <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{t.name}</p>
            {t.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.description}</p>}
            <div className="flex items-center justify-between mt-auto">
              <span className="text-lg font-semibold tabular-nums font-mono text-foreground">€{t.price}</span>
              <span className="text-xs text-muted-foreground">{t.duration} min</span>
            </div>
          </motion.div>
        ))}
      </div>

      <TreatmentDialog open={dialogOpen} onOpenChange={setDialogOpen} editTreatment={editTreatment} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>Jeni i sigurt që doni të fshini këtë trajtim?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteTreatment(deleteId); toast({ title: "Trajtimi u fshi" }); setDeleteId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
