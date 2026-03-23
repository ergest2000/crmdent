import { useState, useEffect } from "react";
import { Plus, Building2, Users, CreditCard, Edit, Trash2, UserPlus, Eye, Activity, TrendingUp, ArrowUpRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";

interface ClinicStats {
  clinic_id: string;
  clinic_name: string;
  user_count: number;
  patient_count: number;
  lead_count: number;
}

export default function SuperAdminDashboard() {
  const { clinics, plans, fetchClinics, profile } = useAuthStore();
  const [clinicDialogOpen, setClinicDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [clinicUsers, setClinicUsers] = useState<any[]>([]);
  const [viewUsersClinic, setViewUsersClinic] = useState<string | null>(null);
  const [clinicStats, setClinicStats] = useState<ClinicStats[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [recentProfiles, setRecentProfiles] = useState<any[]>([]);

  const [clinicForm, setClinicForm] = useState({ name: "", address: "", phone: "", email: "", plan_id: "" });
  const [userForm, setUserForm] = useState({ email: "", password: "", full_name: "", role: "clinic_admin", clinic_id: "" });

  useEffect(() => {
    fetchClinics();
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    // Fetch all profiles (users across all clinics)
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (profiles) {
      setTotalUsers(profiles.length);
      setRecentProfiles(profiles.slice(0, 8));
    }

    // Fetch all leads count
    const { count: leadCount } = await supabase.from("leads").select("*", { count: "exact", head: true });
    setTotalLeads(leadCount || 0);

    // Fetch all products count as proxy for patient activity
    const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true });
    setTotalPatients(productCount || 0);
  };

  const handleCreateClinic = async () => {
    if (!clinicForm.name || !clinicForm.plan_id) return;
    const user = useAuthStore.getState().user;
    const { error } = await supabase.from("clinics").insert({
      name: clinicForm.name, address: clinicForm.address, phone: clinicForm.phone,
      email: clinicForm.email, plan_id: clinicForm.plan_id, created_by: user?.id,
    });
    if (error) { toast({ title: "Gabim", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Klinika u krijua!" }); fetchClinics(); setClinicDialogOpen(false); setClinicForm({ name: "", address: "", phone: "", email: "", plan_id: "" }); }
  };

  const handleDeleteClinic = async (id: string) => {
    const { error } = await supabase.from("clinics").delete().eq("id", id);
    if (!error) { toast({ title: "Klinika u fshi" }); fetchClinics(); }
  };

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.password || !userForm.clinic_id) return;
    const { error } = await supabase.auth.signUp({
      email: userForm.email,
      password: userForm.password,
      options: { data: { full_name: userForm.full_name, role: userForm.role, clinic_id: userForm.clinic_id } },
    });
    if (error) { toast({ title: "Gabim", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Përdoruesi u krijua!" }); setUserDialogOpen(false); setUserForm({ email: "", password: "", full_name: "", role: "clinic_admin", clinic_id: "" }); fetchGlobalStats(); }
  };

  const viewUsers = async (clinicId: string) => {
    setViewUsersClinic(clinicId);
    const { data } = await supabase.from("profiles").select("*").eq("clinic_id", clinicId);
    setClinicUsers(data || []);
  };

  const getPlanName = (planId: string) => plans.find((p) => p.id === planId)?.name || "—";

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Mirëmëngjesi" : now.getHours() < 18 ? "Mirëdita" : "Mirëmbrëma";

  return (
    <div className="p-5 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-foreground">{greeting}, {profile?.full_name || "Super Admin"}!</h2>
        <p className="text-sm text-muted-foreground">Paneli global — menaxho të gjitha klinikat dhe aktivitetin</p>
      </div>

      {/* Global Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: 0 }} className="rounded-card bg-card shadow-subtle p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Building2 className="h-4 w-4" /><span className="text-xs">Klinika Totale</span></div>
          <p className="text-2xl font-semibold">{clinics.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{clinics.filter((c) => c.is_active).length} aktive</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: 0.05 }} className="rounded-card bg-card shadow-subtle p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Users className="h-4 w-4" /><span className="text-xs">Përdorues Totale</span></div>
          <p className="text-2xl font-semibold">{totalUsers}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Në të gjitha klinikat</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: 0.1 }} className="rounded-card bg-card shadow-subtle p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><TrendingUp className="h-4 w-4" /><span className="text-xs">Leads Totale</span></div>
          <p className="text-2xl font-semibold">{totalLeads}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Nga të gjitha kanalet</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: 0.15 }} className="rounded-card bg-card shadow-subtle p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><CreditCard className="h-4 w-4" /><span className="text-xs">Planet</span></div>
          <p className="text-2xl font-semibold">{plans.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Plane aktive</p>
        </motion.div>
      </div>

      {/* Plans Section */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Planet</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-card bg-card shadow-subtle p-4 space-y-2">
              <h3 className="text-sm font-semibold">{plan.name}</h3>
              <p className="text-2xl font-bold text-primary">€{plan.price}<span className="text-xs text-muted-foreground font-normal">/muaj</span></p>
              <p className="text-xs text-muted-foreground">Max {plan.max_users} përdorues</p>
              <div className="flex flex-wrap gap-1">
                {plan.allowed_roles.map((r) => (
                  <span key={r} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded capitalize">{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinics Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Klinikat ({clinics.length})</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setUserDialogOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" /> Shto Përdorues
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setClinicDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Shto Klinikë
            </Button>
          </div>
        </div>
        <div className="rounded-card bg-card shadow-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Klinika</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Plani</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kontakti</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {clinics.map((clinic) => (
                <tr key={clinic.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{clinic.name}</p>
                    <p className="text-xs text-muted-foreground">{clinic.address || "—"}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{getPlanName(clinic.plan_id || "")}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{clinic.phone || clinic.email || "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${clinic.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{clinic.is_active ? "Aktive" : "Joaktive"}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => viewUsers(clinic.id)}><Eye className="h-3 w-3" /> Users</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => handleDeleteClinic(clinic.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clinics.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nuk ka klinika. Shto një klinikë të re.</div>}
        </div>
      </div>

      {/* Recent Users */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Përdoruesit e Fundit</h2>
        <div className="rounded-card bg-card shadow-subtle overflow-hidden">
          <div className="divide-y divide-border/50">
            {recentProfiles.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Nuk ka përdorues ende.</div>
            ) : (
              recentProfiles.map((u) => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {u.full_name?.[0] || u.email?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.full_name || "Pa emër"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">{u.role}</span>
                  <span className="text-[10px] text-muted-foreground">{u.clinic_id ? "Klinikë" : "Global"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Clinic Dialog */}
      <Dialog open={clinicDialogOpen} onOpenChange={setClinicDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Shto Klinikë të Re</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Emri i klinikës *</label><Input value={clinicForm.name} onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })} className="h-9 text-sm" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Adresa</label><Input value={clinicForm.address} onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })} className="h-9 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Telefoni</label><Input value={clinicForm.phone} onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })} className="h-9 text-sm" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Email</label><Input value={clinicForm.email} onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })} className="h-9 text-sm" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Plani *</label>
              <Select value={clinicForm.plan_id} onValueChange={(v) => setClinicForm({ ...clinicForm, plan_id: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Zgjidh planin" /></SelectTrigger>
                <SelectContent>{plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} — €{p.price}/muaj</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setClinicDialogOpen(false)}>Anulo</Button>
            <Button size="sm" onClick={handleCreateClinic}>Krijo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Shto Përdorues të Ri</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Emri i plotë *</label><Input value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} className="h-9 text-sm" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Email *</label><Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="h-9 text-sm" /></div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Fjalëkalimi *</label><Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="h-9 text-sm" /></div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Klinika *</label>
              <Select value={userForm.clinic_id} onValueChange={(v) => setUserForm({ ...userForm, clinic_id: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Zgjidh klinikën" /></SelectTrigger>
                <SelectContent>{clinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Roli *</label>
              <Select value={userForm.role} onValueChange={(v) => setUserForm({ ...userForm, role: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic_admin">Admin Klinike</SelectItem>
                  <SelectItem value="doctor">Doktor</SelectItem>
                  <SelectItem value="receptionist">Recepsionist</SelectItem>
                  <SelectItem value="accountant">Kontabilist</SelectItem>
                  <SelectItem value="economist">Ekonomist</SelectItem>
                  <SelectItem value="manager">Menaxher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUserDialogOpen(false)}>Anulo</Button>
            <Button size="sm" onClick={handleCreateUser}>Krijo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Users Dialog */}
      <Dialog open={!!viewUsersClinic} onOpenChange={() => setViewUsersClinic(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Përdoruesit e Klinikës</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {clinicUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nuk ka përdorues në këtë klinikë.</p>
            ) : (
              clinicUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{u.full_name?.[0] || u.email?.[0] || "?"}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{u.full_name || "Pa emër"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">{u.role}</span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
