import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, Clock, Ban, Users, Stethoscope } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { useDoctorStore, type Doctor } from "@/stores/doctor-store";
import { useAppointmentStore } from "@/stores/appointment-store";
import { DoctorDialog } from "@/components/DoctorDialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { toast } from "@/hooks/use-toast";
import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import { sq } from "date-fns/locale";

const hours = Array.from({ length: 12 }, (_, i) => i + 7);

export default function Doctors() {
  const doctors = useDoctorStore((s) => s.doctors);
  const deleteDoctor = useDoctorStore((s) => s.deleteDoctor);
  const addBlockedSlot = useDoctorStore((s) => s.addBlockedSlot);
  const removeBlockedSlot = useDoctorStore((s) => s.removeBlockedSlot);
  const appointments = useAppointmentStore((s) => s.appointments);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Doctor | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [calendarDocId, setCalendarDocId] = useState<string | null>(null);
  const [blockDialogDoc, setBlockDialogDoc] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({ date: "", startTime: "08:00", endTime: "17:00", reason: "" });

  const calendarDoc = doctors.find((d) => d.id === calendarDocId);

  const handleBlock = () => {
    if (!blockDialogDoc || !blockForm.date) return;
    addBlockedSlot(blockDialogDoc, blockForm);
    toast({ title: "Orari u bllokua" });
    setBlockDialogDoc(null);
    setBlockForm({ date: "", startTime: "08:00", endTime: "17:00", reason: "" });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i));

  const exportData = doctors.map((d) => ({
    emri: `Dr. ${d.firstName} ${d.lastName}`,
    specializimi: d.specialization,
    telefoni: d.phone,
    email: d.email,
    statusi: d.status,
    paciente: d.stats.patients,
  }));

  const exportColumns = [
    { header: "Emri", key: "emri" },
    { header: "Specializimi", key: "specializimi" },
    { header: "Telefoni", key: "telefoni" },
    { header: "Email", key: "email" },
    { header: "Statusi", key: "statusi" },
    { header: "Pacientë", key: "paciente" },
  ];

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Dentistë</h1>
          <p className="text-sm text-muted-foreground">{doctors.length} dentistë të regjistruar</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportMenu
            onExportPDF={() => exportPDF({ title: "Lista e Doktorëve", filename: "doktoret", columns: exportColumns, data: exportData })}
            onExportCSV={() => exportCSV({ title: "Lista e Doktorëve", filename: "doktoret", columns: exportColumns, data: exportData })}
          />
          <Button size="sm" className="gap-1.5" onClick={() => { setEditDoc(undefined); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Shto Dentist
          </Button>
        </div>
      </div>

      {/* Doctor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc, i) => {
          const docAppointments = appointments.filter((a) => a.dentist === `Dr. ${doc.lastName}`);
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...clinicalTransition, delay: i * 0.05 }}
              className="rounded-card bg-card shadow-subtle p-5 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {doc.profilePhoto ? (
                      <img src={doc.profilePhoto} alt={`Dr. ${doc.firstName}`} className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {doc.firstName[0]}{doc.lastName[0]}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm text-[10px]" title="Dentist">🦷</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Dr. {doc.firstName} {doc.lastName}</h3>
                    <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                  </div>
                </div>
                <StatusBadge status={doc.status} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{doc.stats.patients} pacientë</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>{doc.stats.treatments} trajtime</span>
                </div>
              </div>

              {/* Contact */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>📞 {doc.phone}</p>
                <p>✉️ {doc.email}</p>
              </div>

              {/* Schedule */}
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Orari i punës</p>
                <div className="flex flex-wrap gap-1">
                  {doc.schedule.map((s) => (
                    <span key={s.day} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {s.day} {s.start}–{s.end}
                    </span>
                  ))}
                  {doc.schedule.length === 0 && <span className="text-[10px] text-muted-foreground">Pa orar</span>}
                </div>
              </div>

              {/* Blocked slots */}
              {doc.blockedSlots.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-destructive mb-1.5">Orare të bllokuara</p>
                  <div className="space-y-1">
                    {doc.blockedSlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between text-[10px] bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded px-2 py-1">
                        <span className="text-destructive">{slot.date} · {slot.startTime}–{slot.endTime} — {slot.reason}</span>
                        <button onClick={() => { removeBlockedSlot(doc.id, slot.id); toast({ title: "Bllokimi u hoq" }); }} className="text-destructive hover:text-destructive/80">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setCalendarDocId(doc.id)}>
                  <Calendar className="h-3 w-3" /> Kalendari
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setBlockDialogDoc(doc.id)}>
                  <Ban className="h-3 w-3" /> Blloko Orar
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => { setEditDoc(doc); setDialogOpen(true); }}>
                  <Edit className="h-3 w-3" /> Edito
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive" onClick={() => setDeleteId(doc.id)}>
                  <Trash2 className="h-3 w-3" /> Fshi
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Doctor Calendar Dialog */}
      <Dialog open={!!calendarDocId} onOpenChange={() => setCalendarDocId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kalendari i Dr. {calendarDoc?.firstName} {calendarDoc?.lastName}</DialogTitle>
          </DialogHeader>
          {calendarDoc && (
            <div className="rounded-card bg-muted/30 overflow-hidden">
              <div className="grid border-b border-border/50" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
                <div className="px-2 py-2" />
                {weekDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={day.toISOString()} className={`px-2 py-2 text-center border-l border-border/30 ${isToday ? "bg-primary/5" : ""}`}>
                      <p className={`text-[10px] uppercase tracking-wider ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                        {format(day, "EEE", { locale: sq })}
                      </p>
                      <p className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>{format(day, "d")}</p>
                    </div>
                  );
                })}
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                {hours.map((hour) => (
                  <div key={hour} className="grid min-h-[44px] border-b border-border/10" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
                    <div className="px-1 py-1 text-[10px] font-mono text-muted-foreground text-right pr-2 pt-1">
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    {weekDays.map((day) => {
                      const dayStr = day.toISOString().split("T")[0];
                      const docAppts = appointments.filter(
                        (a) => a.date === dayStr && a.dentist === `Dr. ${calendarDoc.lastName}` && Math.floor(parseInt(a.time.split(":")[0])) === hour
                      );
                      const blocked = calendarDoc.blockedSlots.some(
                        (b) => b.date === dayStr && parseInt(b.startTime) <= hour && parseInt(b.endTime) > hour
                      );
                      return (
                        <div key={`${dayStr}-${hour}`} className={`border-l border-border/20 px-0.5 py-0.5 ${blocked ? "bg-red-50 dark:bg-red-950/20" : ""}`}>
                          {blocked && <div className="text-[9px] text-destructive px-1">Bllokuar</div>}
                          {docAppts.map((apt) => (
                            <div key={apt.id} className="rounded bg-primary/10 px-1.5 py-0.5 mb-0.5 text-[10px]">
                              <p className="font-medium text-foreground truncate">{apt.patientName}</p>
                              <p className="text-muted-foreground truncate">{apt.time} · {apt.treatment}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block Slot Dialog */}
      <Dialog open={!!blockDialogDoc} onOpenChange={() => setBlockDialogDoc(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Blloko Orar</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Data *</label>
              <Input type="date" value={blockForm.date} onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ora fillimit</label>
                <Input type="time" value={blockForm.startTime} onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ora mbarimit</label>
                <Input type="time" value={blockForm.endTime} onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })} className="h-9 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Arsyeja</label>
              <Input value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder="p.sh. Pushim, Mungesë..." className="h-9 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setBlockDialogDoc(null)}>Anulo</Button>
              <Button size="sm" onClick={handleBlock}>Blloko</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DoctorDialog open={dialogOpen} onOpenChange={setDialogOpen} editDoctor={editDoc} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>Jeni i sigurt që doni të fshini këtë dentist?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteDoctor(deleteId); toast({ title: "Dentisti u fshi" }); setDeleteId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
