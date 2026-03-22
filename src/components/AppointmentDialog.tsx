import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppointmentStore } from "@/stores/appointment-store";
import { usePatientStore } from "@/stores/patient-store";
import { useStaffStore } from "@/stores/staff-store";
import { useTreatmentStore } from "@/stores/treatment-store";
import { toast } from "@/hooks/use-toast";
import type { Appointment } from "@/lib/mock-data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAppointment?: Appointment;
}

type AptStatus = Appointment["status"];

export function AppointmentDialog({ open, onOpenChange, editAppointment }: Props) {
  const addAppointment = useAppointmentStore((s) => s.addAppointment);
  const updateAppointment = useAppointmentStore((s) => s.updateAppointment);
  const patients = usePatientStore((s) => s.patients);
  const staff = useStaffStore((s) => s.staff);
  const treatments = useTreatmentStore((s) => s.treatments);

  const [form, setForm] = useState({
    patientId: editAppointment?.patientId || "",
    dentist: editAppointment?.dentist || "",
    treatment: editAppointment?.treatment || "",
    date: editAppointment?.date || new Date().toISOString().split("T")[0],
    time: editAppointment?.time || "09:00",
    duration: editAppointment?.duration || 30,
    room: editAppointment?.room || "Salla 1",
    status: (editAppointment?.status || "pending") as AptStatus,
  });

  const selectedPatient = patients.find((p) => p.id === form.patientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "",
      duration: Number(form.duration),
      status: form.status as Appointment["status"],
    };

    if (editAppointment) {
      updateAppointment(editAppointment.id, data);
      toast({ title: "Takimi u përditësua" });
    } else {
      addAppointment(data);
      toast({ title: "Takimi u krijua me sukses" });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editAppointment ? "Edito Takimin" : "Krijo Takim të Ri"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground mb-1 block">Pacienti *</label>
              <Select value={form.patientId} onValueChange={(v) => setForm({ ...form, patientId: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Zgjidh pacientin" /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Dentisti *</label>
              <Select value={form.dentist} onValueChange={(v) => setForm({ ...form, dentist: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Zgjidh dentistin" /></SelectTrigger>
                <SelectContent>
                  {staff.filter((s) => s.role === "dentist").map((s) => (
                    <SelectItem key={s.id} value={`Dr. ${s.lastName}`}>Dr. {s.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Trajtimi *</label>
              <Select value={form.treatment} onValueChange={(v) => setForm({ ...form, treatment: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Zgjidh trajtimin" /></SelectTrigger>
                <SelectContent>
                  {treatments.map((t) => (
                    <SelectItem key={t.id} value={t.name}>{t.name} (€{t.price})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Data *</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ora *</label>
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Kohëzgjatja (min)</label>
              <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Salla</label>
              <Select value={form.room} onValueChange={(v) => setForm({ ...form, room: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salla 1">Salla 1</SelectItem>
                  <SelectItem value="Salla 2">Salla 2</SelectItem>
                  <SelectItem value="Salla 3">Salla 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editAppointment && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Statusi</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as AptStatus })}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Në pritje</SelectItem>
                    <SelectItem value="confirmed">Konfirmuar</SelectItem>
                    <SelectItem value="in-treatment">Në trajtim</SelectItem>
                    <SelectItem value="completed">Përfunduar</SelectItem>
                    <SelectItem value="cancelled">Anuluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" size="sm">{editAppointment ? "Ruaj" : "Krijo Takim"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
