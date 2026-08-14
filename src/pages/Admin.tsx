import { useState, useEffect } from "react";
import { Shield, Plus, Lock, Save } from "lucide-react";
import { useStaffStore } from "@/stores/staff-store";
import { useAuthStore } from "@/stores/auth-store";
import { staffRoleLabels } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { StaffDialog } from "@/components/StaffDialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const roleColors: Record<string, string> = {
  dentist: "bg-primary/10 text-primary",
  receptionist: "bg-blue-50 text-blue-800",
  accountant: "bg-amber-50 text-amber-800",
  admin: "bg-purple-50 text-purple-800",
  hygienist: "bg-emerald-50 text-emerald-800",
};

// Modulet që admini mund t'ia japë/heqë stafit (dashboard-i është gjithmonë i hapur).
const CONFIG_PAGES: { key: string; label: string }[] = [
  { key: "leads", label: "Leads" },
  { key: "patients", label: "Pacientët" },
  { key: "doctors", label: "Dentistë" },
  { key: "appointments", label: "Takime" },
  { key: "treatments", label: "Trajtime" },
  { key: "finance", label: "Financa" },
  { key: "invoices", label: "Fatura" },
  { key: "stock", label: "Stok" },
  { key: "reports", label: "Raporte" },
  { key: "staff", label: "Stafi" },
  { key: "settings", label: "Cilësime" },
];

// Rolet e stafit që hyjnë në sistem (pa admin/super-admin që kanë akses të plotë).
const CONFIG_ROLES: { key: string; label: string }[] = [
  { key: "doctor", label: "Dentist" },
  { key: "receptionist", label: "Recepsioniste" },
  { key: "accountant", label: "Kontabilist" },
  { key: "economist", label: "Ekonomist" },
  { key: "manager", label: "Menaxher" },
];

export default function Admin() {
  const staff = useStaffStore((s) => s.staff);
  const updateStaff = useStaffStore((s) => s.updateStaff);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isClinicAdmin = useAuthStore((s) => s.isClinicAdmin);
  const isDemo = useAuthStore((s) => s.isDemo);
  const permissions = useAuthStore((s) => s.permissions);
  const getEffectivePermissions = useAuthStore((s) => s.getEffectivePermissions);
  const setRolePermissions = useAuthStore((s) => s.setRolePermissions);

  const [draft, setDraft] = useState<Record<string, string[]>>({});
  const [savingPerms, setSavingPerms] = useState(false);

  // Rifresko draft-in kur ngarkohen/ndryshojnë lejet e klinikës.
  useEffect(() => {
    const d: Record<string, string[]> = {};
    CONFIG_ROLES.forEach((r) => { d[r.key] = getEffectivePermissions(r.key); });
    setDraft(d);
  }, [permissions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = (id: string, role: string) => {
    updateStaff(id, { role: role as any });
    toast({ title: "Roli u ndryshua" });
  };

  const togglePage = (role: string, page: string) => {
    setDraft((prev) => {
      const cur = new Set(prev[role] || []);
      if (cur.has(page)) cur.delete(page); else cur.add(page);
      return { ...prev, [role]: Array.from(cur) };
    });
  };

  const saveAccess = async () => {
    if (isDemo()) {
      toast({ title: "Modaliteti demo", description: "Aksesi nuk mund të ruhet në llogarinë demo.", variant: "destructive" });
      return;
    }
    setSavingPerms(true);
    let firstError: string | null = null;
    for (const r of CONFIG_ROLES) {
      const res = await setRolePermissions(r.key, draft[r.key] || []);
      if (res.error && !firstError) firstError = res.error;
    }
    setSavingPerms(false);
    toast(firstError
      ? { title: "Gabim", description: firstError, variant: "destructive" }
      : { title: "Aksesi u ruajt", description: "Ndryshimet zbatohen sapo stafi të rifreskojë ose të hyjë përsëri." });
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Administrimi
          </h1>
          <p className="text-sm text-muted-foreground">Menaxhimi i përdoruesve, roleve dhe aksesit</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Shto Përdorues
        </Button>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(staffRoleLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${roleColors[key]}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Users table */}
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

      {/* ============ AKSESI I STAFIT ============ */}
      {isClinicAdmin() && (
        <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Aksesi i Stafit
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Përcakto çfarë mund të kontrollojë secili rol. Administratori ka gjithmonë akses të plotë; Paneli është gjithmonë i hapur.
              </p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={saveAccess} disabled={savingPerms}>
              <Save className="h-3.5 w-3.5" /> {savingPerms ? "Duke ruajtur..." : "Ruaj aksesin"}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-3 py-2 sticky left-0 bg-card">Roli</th>
                  {CONFIG_PAGES.map((p) => (
                    <th key={p.key} className="text-center text-[11px] font-medium text-muted-foreground px-2 py-2 whitespace-nowrap">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {CONFIG_ROLES.map((r) => (
                  <tr key={r.key} className="hover:bg-muted/20">
                    <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap sticky left-0 bg-card">{r.label}</td>
                    {CONFIG_PAGES.map((p) => {
                      const checked = (draft[r.key] || []).includes(p.key);
                      return (
                        <td key={p.key} className="px-2 py-2.5 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => togglePage(r.key, p.key)}
                              aria-label={`${r.label} - ${p.label}`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <StaffDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
