import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStaffStore } from "@/stores/staff-store";
import { toast } from "@/hooks/use-toast";
import type { StaffMember } from "@/lib/mock-data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editStaff?: StaffMember;
}

export function StaffDialog({ open, onOpenChange, editStaff }: Props) {
  const addStaff = useStaffStore((s) => s.addStaff);
  const updateStaff = useStaffStore((s) => s.updateStaff);

  const [form, setForm] = useState({
    firstName: editStaff?.firstName || "",
    lastName: editStaff?.lastName || "",
    role: editStaff?.role || "receptionist",
    specialization: editStaff?.specialization || "",
    phone: editStaff?.phone || "",
    email: editStaff?.email || "",
    status: editStaff?.status || "active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editStaff) {
      updateStaff(editStaff.id, form as any);
      toast({ title: "Punonjësi u përditësua" });
    } else {
      addStaff({
        ...form,
        role: form.role as StaffMember["role"],
        status: form.status as StaffMember["status"],
        schedule: [],
        joinDate: new Date().toISOString().split("T")[0],
      });
      toast({ title: "Punonjësi u shtua me sukses" });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editStaff ? "Edito Punonjësin" : "Shto Punonjës të Ri"}</DialogTitle>
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Roli *</label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as StaffMember["role"] })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dentist">Dentist</SelectItem>
                  <SelectItem value="receptionist">Recepsioniste</SelectItem>
                  <SelectItem value="hygienist">Higjienist</SelectItem>
                  <SelectItem value="accountant">Kontabilist</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Specializimi</label>
              <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Telefoni *</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="h-9 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" size="sm">{editStaff ? "Ruaj" : "Shto"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
