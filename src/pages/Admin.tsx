import { useState } from "react";
import { Shield, Plus, Edit, Trash2, UserCog } from "lucide-react";
import { useStaffStore } from "@/stores/staff-store";
import { staffRoleLabels } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { StaffDialog } from "@/components/StaffDialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const roleColors: Record<string, string> = {
  dentist: "bg-primary/10 text-primary",
  receptionist: "bg-blue-50 text-blue-800",
  accountant: "bg-amber-50 text-amber-800",
  admin: "bg-purple-50 text-purple-800",
  hygienist: "bg-emerald-50 text-emerald-800",
};

export default function Admin() {
  const staff = useStaffStore((s) => s.staff);
  const updateStaff = useStaffStore((s) => s.updateStaff);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRoleChange = (id: string, role: string) => {
    updateStaff(id, { role: role as any });
    toast({ title: "Roli u ndryshua" });
  };

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Administrimi
          </h1>
          <p className="text-sm text-muted-foreground">Menaxhimi i përdoruesve dhe roleve</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Shto Përdorues
        </Button>
      </div>

      {/* Role legend */}
      <div className="flex gap-3">
        {Object.entries(staffRoleLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${roleColors[key]}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Përdoruesi</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Email</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Roli</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data e regjistrimit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {staff.map((s, i) => (
              <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...clinicalTransition, delay: i * 0.03 }} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{s.firstName[0]}{s.lastName[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground">{s.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{s.email}</td>
                <td className="px-4 py-3">
                  <Select value={s.role} onValueChange={(v) => handleRoleChange(s.id, v)}>
                    <SelectTrigger className="h-7 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="dentist">Dentist</SelectItem>
                      <SelectItem value="receptionist">Recepsioniste</SelectItem>
                      <SelectItem value="hygienist">Higjienist</SelectItem>
                      <SelectItem value="accountant">Kontabilist</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-sm tabular-nums text-foreground">{s.joinDate}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <StaffDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
