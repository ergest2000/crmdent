import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoctorStore, type Doctor } from "@/stores/doctor-store";
import { toast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDoctor?: Doctor;
}

const days = ["E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"];

export function DoctorDialog({ open, onOpenChange, editDoctor }: Props) {
  const addDoctor = useDoctorStore((s) => s.addDoctor);
  const updateDoctor = useDoctorStore((s) => s.updateDoctor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    phone: "",
    email: "",
    profilePhoto: "" as string | undefined,
    status: "active" as Doctor["status"],
  });

  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean; start: string; end: string }>>(
    Object.fromEntries(days.map((d) => [d, { enabled: false, start: "08:00", end: "16:00" }]))
  );

  useEffect(() => {
    if (editDoctor) {
      setForm({
        firstName: editDoctor.firstName,
        lastName: editDoctor.lastName,
        specialization: editDoctor.specialization,
        phone: editDoctor.phone,
        email: editDoctor.email,
        profilePhoto: editDoctor.profilePhoto,
        status: editDoctor.status,
      });
      const sched: typeof schedule = {};
      days.forEach((d) => {
        const match = editDoctor.schedule.find((s) => s.day === d);
        sched[d] = match ? { enabled: true, start: match.start, end: match.end } : { enabled: false, start: "08:00", end: "16:00" };
      });
      setSchedule(sched);
    } else {
      setForm({ firstName: "", lastName: "", specialization: "", phone: "", email: "", profilePhoto: undefined, status: "active" });
      setSchedule(Object.fromEntries(days.map((d) => [d, { enabled: false, start: "08:00", end: "16:00" }])));
    }
  }, [editDoctor, open]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm({ ...form, profilePhoto: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const scheduleArr = days.filter((d) => schedule[d].enabled).map((d) => ({ day: d, start: schedule[d].start, end: schedule[d].end }));

    if (editDoctor) {
      updateDoctor(editDoctor.id, { ...form, schedule: scheduleArr });
      toast({ title: "Dentisti u përditësua" });
    } else {
      addDoctor({ ...form, schedule: scheduleArr, joinDate: new Date().toISOString().split("T")[0] });
      toast({ title: "Dentisti u shtua me sukses" });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editDoctor ? "Edito Dentistin" : "Shto Dentist të Ri"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo */}
          <div className="flex items-center gap-4">
            <div
              className="relative h-16 w-16 rounded-full bg-muted flex items-center justify-center cursor-pointer overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {form.profilePhoto ? (
                <img src={form.profilePhoto} alt="Foto" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-muted-foreground">
                  {form.firstName?.[0] || "?"}{form.lastName?.[0] || ""}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Foto e profilit</p>
              <p>Kliko për të ngarkuar një foto</p>
            </div>
          </div>

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
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Specializimi *</label>
            <Input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Telefoni *</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Statusi</label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Doctor["status"] })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="on-leave">Pushim</SelectItem>
                <SelectItem value="inactive">Joaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Orari i punës</label>
            <div className="space-y-2">
              {days.map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <label className="flex items-center gap-2 w-28 text-sm">
                    <input
                      type="checkbox"
                      checked={schedule[day].enabled}
                      onChange={(e) => setSchedule({ ...schedule, [day]: { ...schedule[day], enabled: e.target.checked } })}
                      className="rounded border-border"
                    />
                    {day}
                  </label>
                  {schedule[day].enabled && (
                    <>
                      <Input
                        type="time"
                        value={schedule[day].start}
                        onChange={(e) => setSchedule({ ...schedule, [day]: { ...schedule[day], start: e.target.value } })}
                        className="h-8 text-xs w-24"
                      />
                      <span className="text-xs text-muted-foreground">–</span>
                      <Input
                        type="time"
                        value={schedule[day].end}
                        onChange={(e) => setSchedule({ ...schedule, [day]: { ...schedule[day], end: e.target.value } })}
                        className="h-8 text-xs w-24"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" size="sm">{editDoctor ? "Ruaj" : "Shto"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
