import { useMemo } from "react";
import { motion } from "framer-motion";
import { CardDateFilter, useCardDateFilter } from "@/components/dashboard/DashboardDateFilter";
import { useAppointmentStore } from "@/stores/appointment-store";

export function PopularTreatments() {
  const { preset, dateRange, change } = useCardDateFilter("month");
  const appointments = useAppointmentStore((s) => s.appointments);

  const treatmentStats = useMemo(() => {
    const filtered = appointments.filter((a) => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d >= dateRange.from && d <= dateRange.to;
    });
    const base = filtered.length > 0 ? filtered : appointments;
    const counts: Record<string, number> = {};
    base.forEach((a) => {
      counts[a.treatment] = (counts[a.treatment] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [appointments, dateRange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-card bg-card shadow-subtle p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Trajtimet më të shpeshta</h3>
        <CardDateFilter value={preset} dateRange={dateRange} onChange={change} />
      </div>
      {treatmentStats.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Nuk ka të dhëna</p>
      ) : (
        <div className="space-y-2.5">
          {treatmentStats.map((t, i) => (
            <div key={i} className="flex items-center gap-3 group cursor-pointer">
              <div className="w-1 h-6 rounded-full bg-primary/70 group-hover:bg-primary transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.count} trajtimë</p>
              </div>
              <span className="text-xs font-medium tabular-nums font-mono text-muted-foreground">{t.count}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
