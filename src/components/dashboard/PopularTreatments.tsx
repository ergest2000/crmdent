import { motion } from "framer-motion";
import { CardDateFilter, useCardDateFilter } from "@/components/dashboard/DashboardDateFilter";

const treatmentStats = [
  { id: "TRT-001", name: "Pastrim dhëmbësh", count: 86 },
  { id: "TRT-005", name: "Heqje dhëmbi", count: 34 },
  { id: "TRT-006", name: "Kontroll i përgjithshëm", count: 142 },
  { id: "TRT-002", name: "Mbushje", count: 68 },
  { id: "TRT-003", name: "Trajtim kanali", count: 22 },
];

export function PopularTreatments() {
  const { preset, dateRange, change } = useCardDateFilter("month");

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
      <div className="space-y-2.5">
        {treatmentStats.slice(0, 5).map((t) => (
          <div key={t.id} className="flex items-center gap-3 group cursor-pointer">
            <div className="w-1 h-6 rounded-full bg-primary/70 group-hover:bg-primary transition-colors" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">{t.count} trajtimë</p>
            </div>
            <span className="text-xs font-medium tabular-nums font-mono text-muted-foreground">{t.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
