import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { CardDateFilter, useCardDateFilter } from "@/components/dashboard/DashboardDateFilter";

const allData = [
  { month: "Jan", income: 4200, expense: 3100, date: "2026-01-15" },
  { month: "Shk", income: 5100, expense: 3800, date: "2026-02-15" },
  { month: "Mar", income: 6300, expense: 4500, date: "2026-03-15" },
  { month: "Pri", income: 5800, expense: 4200, date: "2026-04-15" },
  { month: "Maj", income: 7200, expense: 5100, date: "2026-05-15" },
  { month: "Qer", income: 8400, expense: 6000, date: "2026-06-15" },
  { month: "Kor", income: 7600, expense: 5500, date: "2026-07-15" },
  { month: "Gus", income: 6900, expense: 4800, date: "2026-08-15" },
  { month: "Sht", income: 7800, expense: 5300, date: "2026-09-15" },
  { month: "Tet", income: 6200, expense: 4100, date: "2026-10-15" },
  { month: "Nën", income: 7800, expense: 5300, date: "2026-11-15" },
  { month: "Dhj", income: 8500, expense: 6200, date: "2026-12-15" },
];

export function IncomeExpenseChart() {
  const { preset, dateRange, change } = useCardDateFilter("month");

  const data = useMemo(() => {
    const f = allData.filter((d) => {
      const date = new Date(d.date);
      return date >= dateRange.from && date <= dateRange.to;
    });
    return f.length > 0 ? f : allData.slice(-6);
  }, [dateRange]);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const incomeChange = 4.5;
  const expenseChange = -2.4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-card bg-card shadow-subtle p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Të ardhura & Shpenzime</h3>
        <CardDateFilter value={preset} dateRange={dateRange} onChange={change} />
      </div>

      <div className="flex gap-6 mb-3">
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-status-completed" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Të ardhura</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold tabular-nums font-mono text-foreground">€{(totalIncome / 1000).toFixed(1)}k</span>
            <span className="text-[11px] font-medium text-status-completed flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />{incomeChange}%
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-status-pending" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Shpenzime</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold tabular-nums font-mono text-foreground">€{(totalExpense / 1000).toFixed(1)}k</span>
            <span className="text-[11px] font-medium text-destructive flex items-center gap-0.5">
              <TrendingDown className="h-3 w-3" />{Math.abs(expenseChange)}%
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={30} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, boxShadow: "var(--shadow-elevated)" }}
            formatter={(value: number, name: string) => [`€${value.toLocaleString()}`, name === "income" ? "Të ardhura" : "Shpenzime"]} />
          <Bar dataKey="income" fill="hsl(var(--status-completed))" radius={[4, 4, 0, 0]} animationDuration={600} />
          <Bar dataKey="expense" fill="hsl(var(--status-pending))" radius={[4, 4, 0, 0]} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
