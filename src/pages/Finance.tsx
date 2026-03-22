import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight, Plus, Trash2 } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { expenseCategoryLabels, paymentMethodLabels } from "@/lib/mock-data";
import { useFinanceStore } from "@/stores/finance-store";
import { useInvoiceStore } from "@/stores/invoice-store";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const categoryBarColors: Record<string, string> = {
  supplies: "bg-blue-500",
  salary: "bg-primary",
  rent: "bg-amber-500",
  utilities: "bg-purple-500",
  equipment: "bg-rose-500",
  other: "bg-muted-foreground",
};

export default function Finance() {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [deleteExpId, setDeleteExpId] = useState<string | null>(null);

  const { payments, expenses, deleteExpense } = useFinanceStore();
  const fiscalInvoices = useInvoiceStore((s) => s.invoices);

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalUnpaid = fiscalInvoices.reduce((s, i) => s + Math.max(0, i.total - i.paid), 0);
  const overdueAmount = fiscalInvoices.filter((i) => i.status === "overdue").reduce((s, i) => s + (i.total - i.paid), 0);
  const netIncome = totalRevenue - totalExpenses;

  const expensesByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const recentPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const billingAlerts = fiscalInvoices
    .filter((i) => i.status === "overdue" || (i.status === "partial" && i.total - i.paid > 200))
    .map((i) => ({ id: i.id, patientName: i.patientName, amount: i.total - i.paid, dueDate: i.dueDate, type: i.status }));

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Pasqyra Financiare</h1>
          <p className="text-sm text-muted-foreground">Mars 2026</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportPDF={() => {
              const config = { title: "Pasqyra Financiare", filename: "financat", columns: [
                { header: "Përshkrimi", key: "description" }, { header: "Kategoria", key: "category" }, { header: "Data", key: "date" }, { header: "Shuma", key: "amount", align: "right" as const }, { header: "Lloji", key: "type" },
              ], data: expenses.map((e) => ({ description: e.description, category: expenseCategoryLabels[e.category], date: e.date, amount: `€${e.amount.toFixed(2)}`, type: e.recurring ? "Periodik" : "Njëherësh" })) };
              exportPDF(config);
            }}
            onExportCSV={() => {
              const config = { title: "Pasqyra Financiare", filename: "financat", columns: [
                { header: "Përshkrimi", key: "description" }, { header: "Kategoria", key: "category" }, { header: "Data", key: "date" }, { header: "Shuma", key: "amount" }, { header: "Lloji", key: "type" },
              ], data: expenses.map((e) => ({ description: e.description, category: expenseCategoryLabels[e.category], date: e.date, amount: `€${e.amount.toFixed(2)}`, type: e.recurring ? "Periodik" : "Njëherësh" })) };
              exportCSV(config);
            }}
          />
          <Button size="sm" className="gap-1.5" onClick={() => setExpenseDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Regjistro Shpenzim
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Të ardhura", value: totalRevenue, icon: TrendingUp, color: "text-emerald-600", arrow: ArrowUpRight },
          { label: "Shpenzime", value: totalExpenses, icon: TrendingDown, color: "text-rose-600", arrow: ArrowDownRight },
          { label: "Fitimi neto", value: netIncome, icon: Wallet, color: netIncome >= 0 ? "text-emerald-600" : "text-destructive", arrow: null },
          { label: "Borxhe të vonuara", value: overdueAmount, icon: AlertTriangle, color: "text-destructive", arrow: null },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: i * 0.05 }} className="rounded-card bg-card p-4 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              {stat.arrow && <stat.arrow className={`h-3.5 w-3.5 ${stat.color}`} />}
            </div>
            <p className={`text-2xl font-semibold tabular-nums font-mono ${stat.color}`}>€{stat.value.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Expense Breakdown */}
        <div className="col-span-1 rounded-card bg-card shadow-subtle">
          <div className="px-4 py-3 border-b border-border/50"><h2 className="text-sm font-medium text-foreground">Shpenzimet sipas kategorisë</h2></div>
          <div className="p-4 space-y-3">
            {Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a).map(([category, amount]) => {
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{expenseCategoryLabels[category]}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">€{amount.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${categoryBarColors[category] || "bg-muted-foreground"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-border/30">
              <span className="text-foreground">Total shpenzime</span>
              <span className="font-mono tabular-nums text-foreground">€{totalExpenses.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="col-span-1 rounded-card bg-card shadow-subtle">
          <div className="px-4 py-3 border-b border-border/50"><h2 className="text-sm font-medium text-foreground">Pagesat e fundit</h2></div>
          <div className="divide-y divide-border/50">
            {recentPayments.map((pay) => (
              <div key={pay.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{pay.patientName}</p>
                  <p className="text-xs text-muted-foreground">{pay.date} · {paymentMethodLabels[pay.method]}</p>
                </div>
                <span className="text-sm font-medium font-mono tabular-nums text-emerald-600">+€{pay.amount.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Alerts */}
        <div className="col-span-1 rounded-card bg-card shadow-subtle">
          <div className="px-4 py-3 border-b border-border/50">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />Alarme faturimi
            </h2>
          </div>
          {billingAlerts.length > 0 ? (
            <div className="divide-y divide-border/50">
              {billingAlerts.map((alert) => (
                <div key={alert.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{alert.patientName}</p>
                    <span className="text-sm font-medium font-mono tabular-nums text-destructive">€{alert.amount.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{alert.id}</span>
                    <span className="text-xs text-destructive">Afati: {alert.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4"><p className="text-sm text-muted-foreground">Asnjë alarm aktiv.</p></div>
          )}
        </div>
      </div>

      {/* Expenses list */}
      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50"><h2 className="text-sm font-medium text-foreground">Shpenzimet e klinikës</h2></div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Përshkrimi</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kategoria</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
              <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Shuma</th>
              <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Lloji</th>
              <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {expenses.map((exp, i) => (
              <motion.tr key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...clinicalTransition, delay: i * 0.03 }} className="hover:bg-muted/30 transition-colors duration-150 group">
                <td className="px-4 py-3 text-sm text-foreground">{exp.description}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{expenseCategoryLabels[exp.category]}</span>
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-foreground">{exp.date}</td>
                <td className="px-4 py-3 text-right"><span className="text-sm font-medium tabular-nums font-mono text-foreground">€{exp.amount.toFixed(2)}</span></td>
                <td className="px-4 py-3"><span className={`text-xs ${exp.recurring ? "text-primary" : "text-muted-foreground"}`}>{exp.recurring ? "Periodik" : "Njëherësh"}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setDeleteExpId(exp.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExpenseDialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen} />

      <AlertDialog open={!!deleteExpId} onOpenChange={() => setDeleteExpId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>Jeni i sigurt që doni të fshini këtë shpenzim?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteExpId) { deleteExpense(deleteExpId); toast({ title: "Shpenzimi u fshi" }); setDeleteExpId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
