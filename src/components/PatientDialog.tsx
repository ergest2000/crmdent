import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientStore } from "@/stores/patient-store";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPatient?: any;
}

export function PatientDialog({ open, onOpenChange, editPatient }: Props) {
  const addPatient = usePatientStore((s) => s.addPatient);
  const updatePatient = usePatientStore((s) => s.updatePatient);

  const [form, setForm] = useState({
    firstName: editPatient?.firstName || "",
    lastName: editPatient?.lastName || "",
    dateOfBirth: editPatient?.dateOfBirth || "",
    phone: editPatient?.phone || "",
    email: editPatient?.email || "",
    gender: editPatient?.gender || "M",
    address: editPatient?.address || "",
    status: editPatient?.status || "active",
    companion: editPatient?.companion || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editPatient) {
      updatePatient(editPatient.id, { ...form, allergies: [] });
      toast({ title: "Pacienti u përditësua" });
    } else {
      addPatient({
        ...form,
        allergies: [],
        lastVisit: new Date().toISOString().split("T")[0],
        balance: 0,
        status: form.status as any,
      });
      toast({ title: "Pacienti u shtua me sukses" });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editPatient ? "Edito Pacientin" : "Shto Pacient të Ri"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Emri *</label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Mbiemri *</label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Data e lindjes</label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Gjinia</label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Mashkull</SelectItem>
                  <SelectItem value="F">Femër</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Telefoni *</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Adresa</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Shoqëruesi (opsionale)</label>
              <Input value={form.companion} onChange={(e) => setForm({ ...form, companion: e.target.value })} placeholder="p.sh. Emri i prindërit ose kujdestarit" className="h-9 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" size="sm">{editPatient ? "Ruaj" : "Shto Pacient"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
