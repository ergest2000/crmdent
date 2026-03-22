import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeadStore, type Lead, type LeadStatus, type Channel } from "@/stores/lead-store";
import { staffMembers } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const channelOptions: { value: Channel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "email", label: "Email" },
  { value: "referral" as Channel, label: "Referral" },
];

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "I ri" },
  { value: "contacted", label: "Kontaktuar" },
  { value: "waiting", label: "Në pritje" },
  { value: "converted", label: "I konvertuar" },
  { value: "lost", label: "I humbur" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editLead?: Lead | null;
}

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  channel: "whatsapp" as Channel,
  status: "new" as LeadStatus,
  assigned_to: "",
  notes: "",
};

export function LeadDialog({ open, onOpenChange, editLead }: Props) {
  const fetchLeads = useLeadStore((s) => s.fetchLeads);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Sync form with editLead when dialog opens
  useEffect(() => {
    if (open) {
      if (editLead) {
        setForm({
          name: editLead.name || "",
          phone: editLead.phone || "",
          email: editLead.email || "",
          channel: editLead.channel || "whatsapp",
          status: editLead.status || "new",
          assigned_to: editLead.assigned_to || "",
          notes: editLead.notes || "",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, editLead]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Emri është i detyrueshëm", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone || null,
        email: form.email || null,
        channel: form.channel,
        status: form.status,
        assigned_to: form.assigned_to || null,
        notes: form.notes || null,
      };

      if (editLead) {
        const { error } = await supabase
          .from("leads")
          .update(payload)
          .eq("id", editLead.id);
        if (error) throw error;
        toast({ title: "Lead u përditësua" });
      } else {
        const { error } = await supabase
          .from("leads")
          .insert(payload);
        if (error) throw error;
        toast({ title: "Lead i ri u krijua me sukses!" });
      }
      await fetchLeads();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Lead save error:", err);
      toast({ title: "Gabim gjatë ruajtjes", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!saving) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editLead ? "Edito Lead" : "Shto Lead të Ri"}</DialogTitle>
          <DialogDescription>{editLead ? "Ndryshoni të dhënat e lead-it" : "Plotësoni të dhënat për lead-in e ri"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Emri i plotë <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Emri Mbiemri" className="mt-1" />
            </div>
            <div>
              <Label>Telefoni</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+355 69 xxx xxxx" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Kanali i ardhjes</Label>
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v as Channel })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channelOptions.map((ch) => (
                    <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statusi</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LeadStatus })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((st) => (
                    <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Personi përgjegjës</Label>
            <Select value={form.assigned_to || "none"} onValueChange={(v) => setForm({ ...form, assigned_to: v === "none" ? "" : v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Zgjidhni stafin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Pa caktuar</SelectItem>
                {staffMembers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.role})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Shënime</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Shënime shtesë..." rows={3} className="mt-1" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Anulo</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Duke ruajtur..." : editLead ? "Përditëso" : "Krijo Lead"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
