import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePatientStore } from "@/stores/patient-store";
import { isInRange } from "@/lib/date-filter";
import { CardDateFilter, useCardDateFilter } from "@/components/dashboard/DashboardDateFilter";

export function PatientsCard() {
  const { preset, dateRange, change } = useCardDateFilter("month");
  const patients = usePatientStore((s) => s.patients);

  const { newCount, returning, newPct, retPct, total } = useMemo(() => {
    const filtered = patients.filter((p) => p.lastVisit && isInRange(p.lastVisit, dateRange));
    const base = filtered.length > 0 ? filtered : patients;
    const t = base.length;
    const now = new Date();
    const nc = base.filter((p) => {
      if (!p.lastVisit) return false;
      const d = new Date(p.lastVisit);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const ret = t - nc;
    return {
      total: t,
      newCount: nc,
      returning: ret,
      newPct: t > 0 ? ((nc / t) * 100).toFixed(1) : "0",
      retPct: t > 0 ? ((ret / t) * 100).toFixed(1) : "0",
    };
  }, [patients, dateRange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded-card bg-card shadow-subtle p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Pacientët</h3>
        <CardDateFilter value={preset} dateRange={dateRange} onChange={change} />
      </div>
      <div className="flex gap-6 mb-4">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums font-mono text-foreground">{newCount}</p>
          <p className="text-[11px] text-muted-foreground">{newPct}%</p>
          <p className="text-[10px] text-muted-foreground">Të rinj</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums font-mono text-foreground">{returning}</p>
          <p className="text-[11px] text-muted-foreground">{retPct}%</p>
          <p className="text-[10px] text-muted-foreground">Kthyer</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums font-mono text-foreground">{total}</p>
          <p className="text-[11px] text-muted-foreground">100%</p>
          <p className="text-[10px] text-muted-foreground">Gjithsej</p>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted-foreground">Të rinj</span>
          <span className="text-muted-foreground">Kthyer</span>
        </div>
        <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-muted">
          <div className="bg-primary rounded-l-full transition-all duration-500" style={{ width: `${newPct}%` }} />
          <div className="bg-status-completed rounded-r-full transition-all duration-500" style={{ width: `${retPct}%` }} />
        </div>
      </div>
    </motion.div>
  );
}
