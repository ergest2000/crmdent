import { useState } from "react";
import { UserCog, Plus, Search, Star, Calendar, Clock, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { staffRoleLabels, statusLabels } from "@/lib/mock-data";
import { useStaffStore } from "@/stores/staff-store";
import { StaffDialog } from "@/components/StaffDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import type { StaffMember } from "@/lib/mock-data";

type StaffTab = "list" | "schedule";

const roleColors: Record<string, string> = {
  dentist: "bg-primary/10 text-primary",
  receptionist: "bg-blue-50 text-blue-800",
  accountant: "bg-amber-50 text-amber-800",
  admin: "bg-purple-50 text-purple-800",
  hygienist: "bg-emerald-50 text-emerald-800",
};

export default function Staff() {
  const [tab, setTab] = useState<StaffTab>("list");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStaffMember, setEditStaffMember] = useState<StaffMember | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const staff = useStaffStore((s) => s.staff);
  const deleteStaff = useStaffStore((s) => s.deleteStaff);

  const filtered = staff.filter((s) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Menaxhimi i Stafit</h1>
          <p className="text-sm text-muted-foreground">{staff.length} punonjës</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportPDF={() => {
              const config = { title: "Lista e Stafit", filename: "stafi", columns: [
                { header: "Emri", key: "name" }, { header: "Roli", key: "role" }, { header: "Telefoni", key: "phone" }, { header: "Email", key: "email" }, { header: "Statusi", key: "status" },
              ], data: filtered.map((s) => ({ name: `${s.firstName} ${s.lastName}`, role: staffRoleLabels[s.role], phone: s.phone, email: s.email, status: s.status })) };
              exportPDF(config);
            }}
            onExportCSV={() => {
              const config = { title: "Lista e Stafit", filename: "stafi", columns: [
                { header: "Emri", key: "name" }, { header: "Roli", key: "role" }, { header: "Telefoni", key: "phone" }, { header: "Email", key: "email" }, { header: "Statusi", key: "status" },
              ], data: filtered.map((s) => ({ name: `${s.firstName} ${s.lastName}`, role: staffRoleLabels[s.role], phone: s.phone, email: s.email, status: s.status })) };
              exportCSV(config);
            }}
          />
          <Button size="sm" className="gap-1.5" onClick={() => { setEditStaffMember(undefined); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Shto Punonjës
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border/50 pb-px">
        {([
          { key: "list", label: "Profilet" },
          { key: "schedule", label: "Orari" },
        ] as { key: StaffTab; label: string }[]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 text-sm transition-colors duration-150 border-b-2 -mb-px ${tab === t.key ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "list" && (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Kërko punonjës..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filtered.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: i * 0.04 }} className="rounded-card bg-card shadow-subtle hover:shadow-interactive transition-shadow p-5 group relative">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditStaffMember(s); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                    {s.firstName[0]}{s.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{s.firstName} {s.lastName}</h3>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${roleColors[s.role]}`}>{staffRoleLabels[s.role]}</span>
                      {s.specialization && <span className="text-xs text-muted-foreground">· {s.specialization}</span>}
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /><span>{s.phone}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /><span>{s.email}</span></div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-3.5 w-3.5" /><span>Anëtar nga {s.joinDate}</span></div>
                    </div>
                    {(s.stats.visits > 0 || s.stats.rating > 0) && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
                        <div className="text-center">
                          <p className="text-sm font-semibold tabular-nums text-foreground">{s.stats.visits}</p>
                          <p className="text-[11px] text-muted-foreground">Vizita</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold tabular-nums text-foreground">{s.stats.treatments}</p>
                          <p className="text-[11px] text-muted-foreground">Trajtime</p>
                        </div>
                        {s.stats.rating > 0 && (
                          <div className="text-center">
                            <p className="text-sm font-semibold tabular-nums text-amber-600 flex items-center justify-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-500" />{s.stats.rating}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Vlerësim</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {tab === "schedule" && (
        <div className="rounded-card bg-card shadow-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5 w-48">Punonjësi</th>
                {["E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"].map((d) => (
                  <th key={d} className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-2.5">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {staff.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...clinicalTransition, delay: i * 0.04 }} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">{s.firstName[0]}{s.lastName[0]}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.firstName} {s.lastName}</p>
                        <p className="text-[11px] text-muted-foreground">{staffRoleLabels[s.role]}</p>
                      </div>
                    </div>
                  </td>
                  {["E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"].map((day) => {
                    const shift = s.schedule.find((sh) => sh.day === day);
                    return (
                      <td key={day} className="px-2 py-3 text-center">
                        {shift ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary/5 px-2 py-1 text-[11px] font-mono tabular-nums text-foreground">{shift.start}–{shift.end}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <StaffDialog open={dialogOpen} onOpenChange={setDialogOpen} editStaff={editStaffMember} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>Jeni i sigurt që doni të fshini këtë punonjës?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteStaff(deleteId); toast({ title: "Punonjësi u fshi" }); setDeleteId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
