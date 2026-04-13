import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import { usePatientStore } from "@/stores/patient-store";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { StatusBadge } from "@/components/StatusBadge";
import { PatientDialog } from "@/components/PatientDialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const patients = usePatientStore((s) => s.patients);
  const deletePatient = usePatientStore((s) => s.deletePatient);

  const filtered = patients.filter((p) => {
    const matchSearch = `${p.firstName} ${p.lastName} ${p.id}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleEdit = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditPatient(p);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePatient(deleteId);
      toast({ title: "Pacienti u fshi" });
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Pacientët</h1>
          <p className="text-sm text-muted-foreground">{patients.length} pacientë të regjistruar</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportPDF={() => {
              const config = {
                title: "Lista e Pacientëve",
                filename: "pacientet",
                columns: [
                  { header: "ID", key: "id" },
                  { header: "Emri", key: "name" },
                  { header: "Telefoni", key: "phone" },
                  { header: "Email", key: "email" },
                  { header: "Vizita e fundit", key: "lastVisit" },
                  { header: "Balanca", key: "balance", align: "right" as const },
                  { header: "Statusi", key: "status" },
                ],
                data: filtered.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, phone: p.phone, email: p.email, lastVisit: p.lastVisit, balance: `€${p.balance.toFixed(2)}`, status: p.status })),
              };
              exportPDF(config);
            }}
            onExportCSV={() => {
              const config = {
                title: "Lista e Pacientëve",
                filename: "pacientet",
                columns: [
                  { header: "ID", key: "id" },
                  { header: "Emri", key: "name" },
                  { header: "Telefoni", key: "phone" },
                  { header: "Email", key: "email" },
                  { header: "Vizita e fundit", key: "lastVisit" },
                  { header: "Balanca", key: "balance" },
                  { header: "Statusi", key: "status" },
                ],
                data: filtered.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, phone: p.phone, email: p.email, lastVisit: p.lastVisit, balance: `€${p.balance.toFixed(2)}`, status: p.status })),
              };
              exportCSV(config);
            }}
          />
          <Button size="sm" className="gap-1.5" onClick={() => { setEditPatient(null); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Shto Pacient
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Kërko me emër ose ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Të gjitha</SelectItem>
            <SelectItem value="active">Aktivë</SelectItem>
            <SelectItem value="suspended">Pezulluar</SelectItem>
            <SelectItem value="archived">Arkivuar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Pacienti</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">ID</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kontakti</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Vizita e fundit</th>
              <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Balanca</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
              <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((p, i) => (
              <motion.tr
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...clinicalTransition, delay: i * 0.03 }}
                className="hover:bg-muted/30 transition-colors duration-150 cursor-pointer group"
                onClick={() => navigate(`/app/patients/${p.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.firstName} {p.lastName}</p>
                      {p.companion && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">👤 {p.companion}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs font-mono text-muted-foreground">{p.id}</span></td>
                <td className="px-4 py-3">
                  <p className="text-sm text-foreground">{p.phone}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                </td>
                <td className="px-4 py-3"><span className="text-sm tabular-nums text-foreground">{p.lastVisit}</span></td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-sm font-medium tabular-nums font-mono ${p.balance > 0 ? "text-destructive" : "text-foreground"}`}>
                    €{p.balance.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/app/patients/${p.id}`)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Shiko">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={(e) => handleEdit(p, e)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edito">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Fshi">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Nuk u gjet asnjë pacient.</div>
        )}
      </div>

      <PatientDialog open={dialogOpen} onOpenChange={setDialogOpen} editPatient={editPatient} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>Jeni i sigurt që doni të fshini këtë pacient? Ky veprim nuk mund të kthehet.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
