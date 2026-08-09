import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLeadStore } from "@/stores/lead-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const CHANNELS = ["whatsapp", "facebook", "instagram", "email", "referral"] as const;
const STATUSES = ["new", "contacted", "consulting", "waiting", "converted", "lost"] as const;

const statusLabels: Record<string, string> = {
  new: "I ri", contacted: "Kontaktuar", consulting: "Konsultë",
  waiting: "Në pritje", converted: "Konvertuar", lost: "Humbur",
};

export default function SuperAdminLeads() {
  const { clinics, fetchClinics } = useAuthStore();
  const { leads, fetchLeads, addLead, deleteLead, updateLeadStatus } = useLeadStore();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clinicFilter, setClinicFilter] = useState<string>("all");
  const [form, setForm] = useState({ name: "", phone: "", email: "", channel: "whatsapp", status: "new", clinic_id: "", notes: "" });

  useEffect(() => { fetchClinics(); fetchLeads(); }, []);

  const clinicName = (id: string | null | undefined) => clinics.find((c) => c.id === id)?.name || "—";

  const shown = clinicFilter === "all"
    ? leads
    : leads.filter((l: any) => l.clinic_id === clinicFilter);

  const handleAdd = async () => {
    if (!form.name || !form.clinic_id) {
      toast({ title: "Plotëso emrin dhe klinikën", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await addLead({
        name: form.name, phone: form.phone, email: form.email,
        channel: form.channel as any, status: form.status as any,
        clinic_id: form.clinic_id, notes: form.notes,
      });
      toast({ title: "Lead-i u shtua" });
      setOpen(false);
      setForm({ name: "", phone: "", email: "", channel: "whatsapp", status: "new", clinic_id: "", notes: "" });
    } catch (e: any) {
      toast({ title: "Gabim", description: e?.message, variant: "destructive" });
    }
    setSaving(false);
  };

  return (
    <div className="p-5 space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Leads (të gjitha klinikat)</h2>
          <p className="text-sm text-muted-foreground">Shto dhe menaxho leads për çdo klinikë</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={clinicFilter} onValueChange={setClinicFilter}>
            <SelectTrigger className="h-9 w-48 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjitha klinikat</SelectItem>
              {clinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Shto Lead
          </Button>
        </div>
      </div>

      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Emri</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kontakti</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kanali</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Klinika</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
              <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {shown.map((l: any) => (
              <tr key={l.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{l.name}</p>
                  {l.notes && <p className="text-xs text-muted-foreground truncate max-w-[220px]">{l.notes}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{l.phone || l.email || "—"}</td>
                <td className="px-4 py-3 text-xs capitalize">{l.channel}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{clinicName(l.clinic_id)}</td>
                <td className="px-4 py-3">
                  <Select value={l.status} onValueChange={(v) => updateLeadStatus(l.id, v as any)}>
                    <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive" onClick={() => deleteLead(l.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">Nuk ka leads.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Shto Lead të Ri</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-xs text-muted-foreground mb-1 block">Emri *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Telefoni</label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-9 text-sm" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Email</label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9 text-sm" /></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Klinika *</label>
              <Select value={form.clinic_id} onValueChange={(v) => setForm({ ...form, clinic_id: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Zgjidh klinikën" /></SelectTrigger>
                <SelectContent>{clinics.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Kanali</label>
                <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{CHANNELS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Statusi</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Shënime</label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-9 text-sm" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Anulo</Button>
            <Button size="sm" onClick={handleAdd} disabled={saving}>{saving ? "Duke ruajtur..." : "Krijo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
