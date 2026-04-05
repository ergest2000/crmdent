import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { CardDateFilter, useCardDateFilter } from "@/components/dashboard/DashboardDateFilter";

const monthlyData = [
  { month: "Jan", value: 1800, date: "2026-01-15" },
  { month: "Shk", value: 2400, date: "2026-02-15" },
  { month: "Mar", value: 3200, date: "2026-03-15" },
  { month: "Pri", value: 2800, date: "2026-04-15" },
  { month: "Maj", value: 4500, date: "2026-05-15" },
  { month: "Qer", value: 5200, date: "2026-06-15" },
  { month: "Kor", value: 6800, date: "2026-07-15" },
  { month: "Gus", value: 7200, date: "2026-08-15" },
  { month: "Sht", value: 6400, date: "2026-09-15" },
  { month: "Tet", value: 8100, date: "2026-10-15" },
  { month: "Nën", value: 9300, date: "2026-11-15" },
  { month: "Dhj", value: 10500, date: "2026-12-15" },
];

export function CashflowChart() {
  const { preset, dateRange, change } = useCardDateFilter("year");

  const data = useMemo(() => {
    const f = monthlyData.filter((d) => {
      const date = new Date(d.date);
      return date >= dateRange.from && date <= dateRange.to;
    });
    return f.length > 0 ? f : monthlyData;
  }, [dateRange]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const lastMonth = data[data.length - 1]?.value ?? 0;
  const prevMonth = data[data.length - 2]?.value ?? 1;
  const pctChange = (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1);
  const isUp = lastMonth >= prevMonth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-card bg-card shadow-subtle p-5 flex flex-col"
    >
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-sm font-medium text-foreground">Të ardhura</h3>
        <CardDateFilter value={preset} dateRange={dateRange} onChange={change} />
      </div>

      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Totali i të ardhurave</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums font-mono text-foreground">
            €{total.toLocaleString()}
          </span>
          <span className={`text-xs font-medium flex items-center gap-0.5 ${isUp ? "text-status-completed" : "text-destructive"}`}>
            <TrendingUp className={`h-3 w-3 ${!isUp ? "rotate-180" : ""}`} />
            {pctChange}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={30} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, boxShadow: "var(--shadow-elevated)" }}
            formatter={(value: number) => [`€${value.toLocaleString()}`, "Total"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#cashflowGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
