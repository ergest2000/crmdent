import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { CardDateFilter, useCardDateFilter } from "@/components/dashboard/DashboardDateFilter";
import { useFinanceStore } from "@/stores/finance-store";

const monthNames = ["Jan","Shk","Mar","Pri","Maj","Qer","Kor","Gus","Sht","Tet","Nën","Dhj"];

export function IncomeExpenseChart() {
  const { preset, dateRange, change } = useCardDateFilter("month");
  const { payments, expenses } = useFinanceStore();

  const data = useMemo(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const income = payments
        .filter((p) => { const d = new Date(p.date); return d.getMonth() === i && d.getFullYear() === year; })
        .reduce((s, p) => s + p.amount, 0);
      const expense = expenses
        .filter((e) => { const d = new Date(e.date); return d.getMonth() === i && d.getFullYear() === year; })
        .reduce((s, e) => s + e.amount, 0);
      return { month: monthNames[i], income, expense, date: `${year}-${String(i + 1).padStart(2, "0")}-15` };
    }).filter((d) => {
      const date = new Date(d.date);
      return date >= dateRange.from && date <= dateRange.to;
    });
  }, [payments, expenses, dateRange]);

  const totalIncome = data.reduce((s, d) => s + d.income, 0);
  const totalExpense = data.reduce((s, d) => s + d.expense, 0);
  const profit = totalIncome - totalExpense;
  const profitPct = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : "0";

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
            <span className="text-lg font-semibold tabular-nums font-mono text-foreground">€{totalIncome.toLocaleString()}</span>
            <span className="text-[11px] font-medium text-status-completed flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />{profitPct}%
            </span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-status-pending" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Shpenzime</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold tabular-nums font-mono text-foreground">€{totalExpense.toLocaleString()}</span>
            <span className="text-[11px] font-medium text-destructive flex items-center gap-0.5">
              <TrendingDown className="h-3 w-3" />{totalExpense > 0 ? ((totalExpense / (totalIncome || 1)) * 100).toFixed(1) : "0"}%
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
