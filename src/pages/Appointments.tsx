import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, CheckCircle, XCircle, Clock, CalendarDays, Filter, Coffee, Search } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { useAppointmentStore } from "@/stores/appointment-store";
import { useDoctorStore } from "@/stores/doctor-store";
import { StatusBadge } from "@/components/StatusBadge";
import { AppointmentDialog } from "@/components/AppointmentDialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, addWeeks, addMonths } from "date-fns";
import { sq } from "date-fns/locale";
import type { Appointment } from "@/lib/mock-data";

const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 - 18:00
const HOUR_HEIGHT = 80; // px per hour slot

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: "bg-emerald-50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  confirmed: { bg: "bg-primary/5", text: "text-primary", dot: "bg-primary" },
  pending: { bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  "in-treatment": { bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

const statusLabels: Record<string, string> = {
  completed: "Përfunduar",
  confirmed: "Konfirmuar",
  pending: "Në pritje",
  "in-treatment": "Në trajtim",
  cancelled: "Anuluar",
};

const appointmentCardColors = [
  "bg-blue-50/80 dark:bg-blue-950/20 border-l-blue-400",
  "bg-violet-50/80 dark:bg-violet-950/20 border-l-violet-400",
  "bg-rose-50/80 dark:bg-rose-950/20 border-l-rose-400",
  "bg-amber-50/80 dark:bg-amber-950/20 border-l-amber-400",
  "bg-emerald-50/80 dark:bg-emerald-950/20 border-l-emerald-400",
  "bg-cyan-50/80 dark:bg-cyan-950/20 border-l-cyan-400",
];

type ViewMode = "day" | "week";
type FilterPreset = "today" | "week" | "month" | "custom";

function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function CurrentTimeIndicator() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const minutes = now.getHours() * 60 + now.getMinutes();
  const topPx = ((minutes - 7 * 60) / 60) * HOUR_HEIGHT;

  if (now.getHours() < 7 || now.getHours() >= 19) return null;

  return (
    <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${topPx}px` }}>
      <div className="relative flex items-center">
        <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-destructive" />
        <div className="w-full h-[2px] bg-destructive" />
        <div className="absolute left-8 -top-3 bg-destructive text-destructive-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
          {format(now, "HH:mm")}
        </div>
      </div>
    </div>
  );
}

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [filterPreset, setFilterPreset] = useState<FilterPreset>("today");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editApt, setEditApt] = useState<Appointment | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const appointments = useAppointmentStore((s) => s.appointments);
  const updateAppointment = useAppointmentStore((s) => s.updateAppointment);
  const deleteAppointment = useAppointmentStore((s) => s.deleteAppointment);
  const doctors = useDoctorStore((s) => s.doctors);

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const scrollTo = Math.max(0, ((now.getHours() - 7) * HOUR_HEIGHT) - 100);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [viewMode]);

  const dateRange = useMemo(() => {
    if (filterPreset === "custom" && customRange) return customRange;
    const today = new Date();
    switch (filterPreset) {
      case "today": return { from: today, to: today };
      case "week": return { from: startOfWeek(currentDate, { weekStartsOn: 1 }), to: endOfWeek(currentDate, { weekStartsOn: 1 }) };
      case "month": return { from: startOfMonth(currentDate), to: endOfMonth(currentDate) };
      default: return { from: currentDate, to: currentDate };
    }
  }, [filterPreset, currentDate, customRange]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const d = new Date(a.date);
      const inRange = d >= new Date(dateRange.from.toDateString()) && d <= new Date(dateRange.to.toDateString());
      const matchesDoctor = doctorFilter === "all" || a.dentist === doctorFilter;
      return inRange && matchesDoctor;
    });
  }, [appointments, dateRange, doctorFilter]);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const selectedDateStr = currentDate.toISOString().split("T")[0];
  const dayAppointments = useMemo(() => {
    return appointments.filter((a) => a.date === selectedDateStr);
  }, [appointments, selectedDateStr]);

  const visibleDoctors = useMemo(() => {
    if (doctorFilter === "all") return doctors.filter((d) => d.status === "active");
    return doctors.filter((d) => `Dr. ${d.lastName}` === doctorFilter && d.status === "active");
  }, [doctors, doctorFilter]);

  const navigate = (dir: number) => {
    if (viewMode === "week") {
      if (filterPreset === "week") setCurrentDate((d) => addWeeks(d, dir));
      else if (filterPreset === "month") setCurrentDate((d) => addMonths(d, dir));
      else setCurrentDate((d) => addDays(d, dir));
    } else {
      setCurrentDate((d) => addDays(d, dir));
    }
  };

  const handleConfirm = (id: string) => {
    updateAppointment(id, { status: "confirmed" });
    toast({ title: "Takimi u konfirmua" });
  };

  const handleCancel = (id: string) => {
    updateAppointment(id, { status: "cancelled" });
    toast({ title: "Takimi u anulua" });
  };

  const handleComplete = (id: string) => {
    updateAppointment(id, { status: "completed" });
    toast({ title: "Takimi u përfundua" });
  };

  const headerLabel = useMemo(() => {
    if (viewMode === "day") return format(currentDate, "EEEE, d MMMM yyyy", { locale: sq });
    if (filterPreset === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "d MMM", { locale: sq })} – ${format(end, "d MMM yyyy", { locale: sq })}`;
    }
    if (filterPreset === "month") return format(currentDate, "MMMM yyyy", { locale: sq });
    if (customRange) return `${format(customRange.from, "d MMM", { locale: sq })} – ${format(customRange.to, "d MMM", { locale: sq })}`;
    return format(currentDate, "EEEE, d MMMM yyyy", { locale: sq });
  }, [viewMode, filterPreset, currentDate, customRange]);

  const totalAppts = viewMode === "day" ? dayAppointments.length : filteredAppointments.length;

  // Check if a doctor is available at a given day/hour
  const isDoctorAvailable = (doc: typeof doctors[0], dayOfWeek: string, hour: number) => {
    const daySchedule = doc.schedule.find((s) => s.day === dayOfWeek);
    if (!daySchedule) return false;
    const startH = parseInt(daySchedule.start.split(":")[0]);
    const endH = parseInt(daySchedule.end.split(":")[0]);
    return hour >= startH && hour < endH;
  };

  // Check if a slot is blocked
  const isSlotBlocked = (doc: typeof doctors[0], dateStr: string, hour: number) => {
    return doc.blockedSlots.some((b) => {
      if (b.date !== dateStr) return false;
      const startH = parseInt(b.startTime.split(":")[0]);
      const endH = parseInt(b.endTime.split(":")[0]);
      return hour >= startH && hour < endH;
    });
  };

  // Get day of week name in Albanian
  const getDayName = (date: Date) => {
    const dayNames = ["E diel", "E hënë", "E martë", "E mërkurë", "E enjte", "E premte", "E shtunë"];
    return dayNames[date.getDay()];
  };

  const dayName = getDayName(currentDate);

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-lg font-bold text-foreground">{totalAppts}</span>
            <span className="text-sm">takime gjithsej</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Today */}
          <Button variant="outline" size="sm" className="text-xs h-8 px-3 font-medium" onClick={() => { setCurrentDate(new Date()); setFilterPreset("today"); setViewMode("day"); }}>
            Sot
          </Button>

          {/* Navigation */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium text-foreground capitalize min-w-[160px]">{headerLabel}</span>

          <div className="h-5 w-px bg-border" />

          {/* View mode */}
          <div className="flex bg-muted/50 rounded-lg p-0.5 gap-0.5">
            <button onClick={() => { setViewMode("day"); setFilterPreset("today"); }} className={`px-4 py-1.5 text-xs rounded-md transition-all ${viewMode === "day" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              Ditë
            </button>
            <button onClick={() => { setViewMode("week"); setFilterPreset("week"); }} className={`px-4 py-1.5 text-xs rounded-md transition-all ${viewMode === "week" ? "bg-background text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              Javë
            </button>
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Doctor filter */}
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="h-8 w-[180px] text-xs border-border/50">
              <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Të gjithë doktorët" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjithë doktorët</SelectItem>
              {doctors.filter((d) => d.status === "active").map((doc) => (
                <SelectItem key={doc.id} value={`Dr. ${doc.lastName}`}>Dr. {doc.firstName} {doc.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ExportMenu
            onExportPDF={() => {
              const data = (viewMode === "day" ? dayAppointments : filteredAppointments).map((a) => ({ date: a.date, time: a.time, patient: a.patientName, treatment: a.treatment, dentist: a.dentist, room: a.room, status: a.status }));
              exportPDF({ title: "Lista e Takimeve", filename: "takimet", columns: [
                { header: "Data", key: "date" }, { header: "Ora", key: "time" }, { header: "Pacienti", key: "patient" }, { header: "Trajtimi", key: "treatment" }, { header: "Dentisti", key: "dentist" }, { header: "Salla", key: "room" }, { header: "Statusi", key: "status" },
              ], data });
            }}
            onExportCSV={() => {
              const data = (viewMode === "day" ? dayAppointments : filteredAppointments).map((a) => ({ date: a.date, time: a.time, patient: a.patientName, treatment: a.treatment, dentist: a.dentist, room: a.room, status: a.status }));
              exportCSV({ title: "Lista e Takimeve", filename: "takimet", columns: [
                { header: "Data", key: "date" }, { header: "Ora", key: "time" }, { header: "Pacienti", key: "patient" }, { header: "Trajtimi", key: "treatment" }, { header: "Dentisti", key: "dentist" }, { header: "Salla", key: "room" }, { header: "Statusi", key: "status" },
              ], data });
            }}
          />
          <Button size="sm" className="gap-1.5 ml-1 shadow-sm" onClick={() => { setEditApt(undefined); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" />
            Takim i ri
          </Button>
        </div>
      </div>

      {/* ==================== DAY VIEW — Doctor columns ==================== */}
      {viewMode === "day" ? (
        <div className="rounded-xl bg-card shadow-subtle overflow-hidden border border-border/40">
          {/* Doctor column headers */}
          <div className="grid border-b border-border/50" style={{ gridTemplateColumns: `56px repeat(${visibleDoctors.length}, 1fr)` }}>
            <div className="px-2 py-3 text-[10px] text-muted-foreground font-mono" />
            {visibleDoctors.map((doc, i) => {
              const docAppts = dayAppointments.filter((a) => a.dentist === `Dr. ${doc.lastName}`);
              const isAvailableToday = doc.schedule.some((s) => s.day === dayName);
              return (
                <div key={doc.id} className={`px-4 py-3 border-l border-border/30 ${!isAvailableToday ? "bg-muted/30" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${appointmentCardColors[i % appointmentCardColors.length].split(" ")[0]} text-foreground`}>
                      {doc.firstName[0]}{doc.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">Dr. {doc.firstName} {doc.lastName}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Sot: {docAppts.length} pacient{docAppts.length !== 1 ? "ë" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid with doctor columns */}
          <div ref={scrollRef} className="overflow-y-auto relative" style={{ maxHeight: "calc(100vh - 240px)" }}>
            {/* Current time line */}
            {isSameDay(currentDate, new Date()) && <CurrentTimeIndicator />}

            {hours.map((hour) => (
              <div key={hour} className="grid border-b border-border/10" style={{ gridTemplateColumns: `56px repeat(${visibleDoctors.length}, 1fr)`, height: `${HOUR_HEIGHT}px` }}>
                <div className="px-1 py-1 text-[11px] font-mono text-muted-foreground tabular-nums text-right pr-2 pt-1">
                  {hour <= 12 ? `${hour}am` : `${hour - 12}pm`}
                </div>
                {visibleDoctors.map((doc, docIdx) => {
                  const docDayStr = selectedDateStr;
                  const available = isDoctorAvailable(doc, dayName, hour);
                  const blocked = isSlotBlocked(doc, docDayStr, hour);
                  const docAppts = dayAppointments.filter(
                    (a) => a.dentist === `Dr. ${doc.lastName}` && Math.floor(timeToMinutes(a.time) / 60) === hour
                  );
                  const slotKey = `${doc.id}-${hour}`;
                  const isBreakHour = hour === 13; // 1pm break

                  return (
                    <div
                      key={slotKey}
                      className={`border-l border-border/20 relative transition-colors ${
                        !available ? "bg-muted/40" : 
                        blocked ? "bg-destructive/5" : 
                        hoveredSlot === slotKey ? "bg-primary/[0.03]" : ""
                      }`}
                      onMouseEnter={() => setHoveredSlot(slotKey)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      onClick={() => {
                        if (available && !blocked) {
                          setEditApt(undefined);
                          setDialogOpen(true);
                        }
                      }}
                      style={{ cursor: available && !blocked ? "pointer" : "default" }}
                    >
                      {/* NOT AVAILABLE overlay */}
                      {!available && hour === Math.min(...hours.filter((h) => !isDoctorAvailable(doc, dayName, h))) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                            JO NË DISPOZICION
                          </span>
                        </div>
                      )}

                      {/* Break time indicator */}
                      {isBreakHour && available && docAppts.length === 0 && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5">
                          <div className="h-px flex-1 bg-border/50 ml-2" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, hsl(var(--border)) 4px, hsl(var(--border)) 8px)" }} />
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                            <Coffee className="h-3 w-3" />
                            <span className="font-medium uppercase tracking-wider">Pushim</span>
                          </div>
                          <div className="h-px flex-1 bg-border/50 mr-2" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 4px, hsl(var(--border)) 4px, hsl(var(--border)) 8px)" }} />
                        </div>
                      )}

                      {/* Blocked overlay */}
                      {blocked && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{
                          backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 6px, hsl(var(--destructive) / 0.06) 6px, hsl(var(--destructive) / 0.06) 12px)"
                        }}>
                          <span className="text-[9px] font-medium uppercase tracking-wider text-destructive/60 bg-background/80 px-2 py-0.5 rounded">
                            Bllokuar
                          </span>
                        </div>
                      )}

                      {/* Appointments */}
                      {docAppts.map((apt) => {
                        const topOffset = timeToMinutes(apt.time) % 60;
                        const heightPx = (apt.duration / 60) * HOUR_HEIGHT;
                        const color = appointmentCardColors[docIdx % appointmentCardColors.length];
                        const status = statusColors[apt.status] || statusColors.pending;

                        return (
                          <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={clinicalTransition}
                            className={`absolute left-1 right-1 rounded-lg border-l-[3px] px-2.5 py-1.5 cursor-pointer hover:shadow-elevated transition-shadow duration-150 ${color}`}
                            style={{ top: `${(topOffset / 60) * HOUR_HEIGHT}px`, height: `${Math.max(heightPx, 36)}px`, zIndex: 10 }}
                            onClick={(e) => { e.stopPropagation(); setEditApt(apt); setDialogOpen(true); }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[8px] font-bold shrink-0">
                                    {apt.patientName.split(" ").map((n) => n[0]).join("")}
                                  </div>
                                  <p className="text-xs font-semibold text-foreground truncate">{apt.patientName}</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                                  {apt.time} › {format(new Date(`2000-01-01T${apt.time}`).getTime() + apt.duration * 60000, "HH:mm", { locale: sq })}
                                </p>
                              </div>
                              <div className={`flex items-center gap-1 shrink-0 ${status.text}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                <span className="text-[9px] font-medium">{statusLabels[apt.status]}</span>
                              </div>
                            </div>
                            {heightPx > 50 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center rounded-md bg-background/60 px-1.5 py-0.5 text-[9px] font-medium text-foreground/70 border border-border/30">
                                  {apt.treatment}
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}

                      {/* Add button on hover for empty available slots */}
                      {available && !blocked && docAppts.length === 0 && hoveredSlot === slotKey && !isBreakHour && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ==================== WEEK VIEW ==================== */
        <div className="rounded-xl bg-card shadow-subtle overflow-hidden border border-border/40">
          {/* Week header */}
          <div className="grid border-b border-border/50" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
            <div className="px-2 py-2.5 text-[10px] text-muted-foreground" />
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const dayStr = day.toISOString().split("T")[0];
              const dayCount = filteredAppointments.filter((a) => a.date === dayStr).length;
              return (
                <div
                  key={dayStr}
                  className={`px-2 py-2.5 text-center border-l border-border/30 cursor-pointer hover:bg-muted/30 transition-colors ${isToday ? "bg-primary/5" : ""}`}
                  onClick={() => { setCurrentDate(day); setViewMode("day"); setFilterPreset("today"); }}
                >
                  <p className={`text-[10px] uppercase tracking-wider ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                    {format(day, "EEE", { locale: sq })}
                  </p>
                  <p className={`text-lg font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                    {format(day, "d")}
                  </p>
                  {dayCount > 0 && (
                    <div className="flex justify-center mt-0.5">
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 rounded-full font-medium">{dayCount}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div ref={scrollRef} className="overflow-y-auto relative" style={{ maxHeight: "calc(100vh - 280px)" }}>
            {hours.map((hour) => (
              <div key={hour} className="grid min-h-[52px] border-b border-border/10" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
                <div className="px-1 py-1 text-[11px] font-mono text-muted-foreground tabular-nums text-right pr-2 pt-1.5">
                  {hour <= 12 ? `${hour}am` : `${hour - 12}pm`}
                </div>
                {weekDays.map((day) => {
                  const dayStr = day.toISOString().split("T")[0];
                  const hourAppts = filteredAppointments.filter(
                    (a) => a.date === dayStr && Math.floor(timeToMinutes(a.time) / 60) === hour
                  );
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={`${dayStr}-${hour}`}
                      className={`border-l border-border/20 relative px-0.5 py-0.5 cursor-pointer hover:bg-muted/20 transition-colors ${isToday ? "bg-primary/[0.02]" : ""}`}
                      onClick={() => { setCurrentDate(day); setViewMode("day"); setFilterPreset("today"); }}
                    >
                      {hourAppts.map((apt) => (
                        <motion.div
                          key={apt.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={clinicalTransition}
                          className="rounded bg-primary/5 border-l-[3px] border-l-primary px-1.5 py-0.5 mb-0.5 cursor-pointer hover:shadow-md transition-shadow text-[10px] leading-tight"
                          onClick={(e) => { e.stopPropagation(); setEditApt(apt); setDialogOpen(true); }}
                        >
                          <p className="font-medium text-foreground truncate">{apt.patientName}</p>
                          <p className="text-muted-foreground truncate">{apt.time} · {apt.treatment}</p>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment list below calendar */}
      {(viewMode === "day" ? dayAppointments : filteredAppointments).length > 0 && (
        <div className="rounded-xl bg-card shadow-subtle overflow-hidden border border-border/40">
          <div className="px-4 py-2.5 border-b border-border/50 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-xs font-medium text-foreground">
              Lista e takimeve ({(viewMode === "day" ? dayAppointments : filteredAppointments).length})
            </h3>
          </div>
          <div className="divide-y divide-border/30">
            {(viewMode === "day" ? dayAppointments : filteredAppointments)
              .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
              .map((apt, i) => {
                const status = statusColors[apt.status] || statusColors.pending;
                return (
                  <motion.div key={apt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...clinicalTransition, delay: i * 0.02 }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 group transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                      {apt.patientName.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums w-12 shrink-0">{apt.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                      <p className="text-xs text-muted-foreground truncate">{apt.treatment} · {apt.dentist} · {apt.room}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 ${status.text}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      <span className="text-[10px] font-medium">{statusLabels[apt.status]}</span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {apt.status === "pending" && (
                        <button onClick={() => handleConfirm(apt.id)} className="p-1.5 rounded-md hover:bg-muted text-emerald-600 transition-colors" title="Konfirmo">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {(apt.status === "confirmed" || apt.status === "in-treatment") && (
                        <button onClick={() => handleComplete(apt.id)} className="p-1.5 rounded-md hover:bg-muted text-primary transition-colors" title="Përfundo">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => { setEditApt(apt); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edito">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      {apt.status !== "cancelled" && apt.status !== "completed" && (
                        <button onClick={() => handleCancel(apt.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Anulo">
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => setDeleteId(apt.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Fshi">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      <AppointmentDialog open={dialogOpen} onOpenChange={setDialogOpen} editAppointment={editApt} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>Jeni i sigurt që doni të fshini këtë takim?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteAppointment(deleteId); toast({ title: "Takimi u fshi" }); setDeleteId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Custom date picker popover */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild><span /></PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={customRange ? { from: customRange.from, to: customRange.to } : undefined}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                setCustomRange({ from: range.from, to: range.to });
                setFilterPreset("custom");
                setCalendarOpen(false);
              } else if (range?.from) {
                setCustomRange({ from: range.from, to: range.from });
              }
            }}
            className="p-3 pointer-events-auto"
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
