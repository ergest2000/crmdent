import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { CardDateFilter, useCardDateFilter, getPresetRange } from "@/components/dashboard/DashboardDateFilter";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useFinanceStore } from "@/stores/finance-store";

const monthNames = ["Jan","Shk","Mar","Pri","Maj","Qer","Kor","Gus","Sht","Tet","Nën","Dhj"];

export function CashflowChart() {
  const { preset, dateRange, change } = useCardDateFilter("year");
  const invoices = useInvoiceStore((s) => s.invoices);
  const { payments } = useFinanceStore();

  const data = useMemo(() => {
    const yearRange = getPresetRange("year");
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthPayments = payments.filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() === i && d.getFullYear() === new Date().getFullYear();
      });
      return {
        month: monthNames[i],
        value: monthPayments.reduce((s, p) => s + p.amount, 0),
        date: `${new Date().getFullYear()}-${String(i + 1).padStart(2, "0")}-15`,
      };
    });

    const filtered = months.filter((d) => {
      const date = new Date(d.date);
      return date >= dateRange.from && date <= dateRange.to;
    });
    return filtered.length > 0 ? filtered : months;
  }, [payments, dateRange]);

  const total = data.reduce((s, d) => s + d.value, 0);
  const lastMonth = data[data.length - 1]?.value ?? 0;
  const prevMonth = data[data.length - 2]?.value ?? 1;
  const pctChange = prevMonth > 0 ? (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1) : "0";
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
          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#cashflowGradient)" dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} animationDuration={600} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
