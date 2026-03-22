import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { expenses } from "@/lib/mock-data";
import { isInRange } from "@/lib/date-filter";
import { CardDateFilter, useCardDateFilter } from "@/components/dashboard/DashboardDateFilter";

const categoryColors: Record<string, string> = {
  supplies: "hsl(260, 60%, 55%)",
  salary: "hsl(142, 60%, 50%)",
  rent: "hsl(200, 80%, 55%)",
  utilities: "hsl(0, 75%, 55%)",
  equipment: "hsl(30, 85%, 55%)",
  other: "hsl(45, 80%, 50%)",
};

const categoryLabels: Record<string, string> = {
  supplies: "Furnizime",
  salary: "Paga",
  rent: "Qira",
  utilities: "Shërbime",
  equipment: "Pajisje",
  other: "Të tjera",
};

export function ExpensesDonut() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { preset, dateRange, change } = useCardDateFilter("month");

  const filtered = useMemo(() => {
    const f = expenses.filter((e) => isInRange(e.date, dateRange));
    return f.length > 0 ? f : expenses;
  }, [dateRange]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const grouped = filtered.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const data = Object.entries(grouped)
    .map(([name, value]) => ({
      name, label: categoryLabels[name] || name, value,
      pct: ((value / total) * 100).toFixed(0),
      color: categoryColors[name] || "hsl(var(--muted))",
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="rounded-card bg-card shadow-subtle p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Shpenzimet</h3>
        <CardDateFilter value={preset} dateRange={dateRange} onChange={change} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-[140px] h-[140px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value"
                onMouseEnter={(_, i) => setActiveIndex(i)} onMouseLeave={() => setActiveIndex(null)} animationDuration={600}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} opacity={activeIndex === null || activeIndex === index ? 1 : 0.4} style={{ transition: "opacity 0.2s" }} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, boxShadow: "var(--shadow-elevated)" }}
                formatter={(value: number, name: string) => [`€${value.toLocaleString()}`, categoryLabels[name] || name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[9px] text-muted-foreground">Totali</p>
            <p className="text-sm font-semibold tabular-nums font-mono text-foreground">€{total.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.label}</span>
              </div>
              <span className="font-medium tabular-nums font-mono text-foreground">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Top shpenzime</p>
        <div className="grid grid-cols-2 gap-2">
          {data.slice(0, 4).map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />
              <div>
                <p className="text-[11px] text-muted-foreground">{d.label}</p>
                <p className="text-xs font-medium tabular-nums font-mono text-foreground">€{d.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
