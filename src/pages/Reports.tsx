import { useState } from "react";
import { BarChart3, Download, Calendar, TrendingUp, Users, Stethoscope, FileSpreadsheet } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { useAppointmentStore } from "@/stores/appointment-store";
import { useFinanceStore } from "@/stores/finance-store";
import { useTreatmentStore } from "@/stores/treatment-store";
import { usePatientStore } from "@/stores/patient-store";
import { useStaffStore } from "@/stores/staff-store";
import { useInvoiceStore } from "@/stores/invoice-store";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type ReportTab = "patients" | "visits" | "financial" | "treatments";

export default function Reports() {
  const [tab, setTab] = useState<ReportTab>("patients");

  const patients = usePatientStore((s) => s.patients);
  const appointments = useAppointmentStore((s) => s.appointments);
  const { payments, expenses } = useFinanceStore();
  const treatments = useTreatmentStore((s) => s.treatments);
  const staff = useStaffStore((s) => s.staff);
  const invoices = useInvoiceStore((s) => s.invoices);

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const unpaidTotal = invoices.reduce((s, i) => s + Math.max(0, i.total - i.paid), 0);
  const activePatients = patients.filter((p) => p.status === "active").length;
  const dentists = staff.filter((s) => s.role === "dentist");

  const handleExportCSV = () => {
    const makeConfig = (title: string, filename: string, columns: { header: string; key: string }[], data: Record<string, any>[]) => 
      exportCSV({ title, filename, columns, data });
    switch (tab) {
      case "patients":
        makeConfig("Pacientët", "raporti-pacienteve", [
          { header: "ID", key: "id" }, { header: "Emri", key: "firstName" }, { header: "Mbiemri", key: "lastName" }, { header: "Telefoni", key: "phone" }, { header: "Email", key: "email" }, { header: "Statusi", key: "status" }, { header: "Vizita e Fundit", key: "lastVisit" }, { header: "Balanca", key: "balance" },
        ], patients.map((p) => ({ ...p, balance: `€${p.balance}` })));
        break;
      case "visits":
        makeConfig("Takimet", "raporti-takimeve", [
          { header: "ID", key: "id" }, { header: "Data", key: "date" }, { header: "Ora", key: "time" }, { header: "Pacienti", key: "patientName" }, { header: "Trajtimi", key: "treatment" }, { header: "Dentisti", key: "dentist" }, { header: "Salla", key: "room" }, { header: "Statusi", key: "status" },
        ], appointments);
        break;
      case "financial":
        makeConfig("Financiare", "raporti-financiar", [
          { header: "Kategoria", key: "category" }, { header: "Shuma", key: "amount" },
        ], [
          { category: "Të ardhura totale", amount: `€${totalRevenue}` }, { category: "Shpenzime totale", amount: `€${totalExpenses}` }, { category: "Fitimi neto", amount: `€${totalRevenue - totalExpenses}` }, { category: "Papaguar", amount: `€${unpaidTotal}` },
          ...expenses.map((e) => ({ category: e.description, amount: `€${e.amount}` })),
        ]);
        break;
      case "treatments":
        makeConfig("Trajtimet", "raporti-trajtimeve", [
          { header: "ID", key: "id" }, { header: "Emri", key: "name" }, { header: "Kategoria", key: "category" }, { header: "Çmimi", key: "price" }, { header: "Kohëzgjatja", key: "duration" },
        ], treatments.map((t) => ({ ...t, price: `€${t.price}`, duration: `${t.duration} min` })));
        break;
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Raporte & Analitika</h1>
          <p className="text-sm text-muted-foreground">Periudha: Mars 2026</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportPDF={() => {
              const configs: Record<ReportTab, () => void> = {
                patients: () => exportPDF({ title: "Raporti i Pacientëve", filename: "raporti-pacienteve", columns: [
                  { header: "Emri", key: "name" }, { header: "Statusi", key: "status" }, { header: "Vizita e fundit", key: "lastVisit" }, { header: "Balanca", key: "balance", align: "right" },
                ], data: patients.map((p) => ({ name: `${p.firstName} ${p.lastName}`, status: p.status, lastVisit: p.lastVisit, balance: `€${p.balance.toFixed(0)}` })) }),
                visits: () => exportPDF({ title: "Raporti i Takimeve", filename: "raporti-takimeve", columns: [
                  { header: "Data", key: "date" }, { header: "Ora", key: "time" }, { header: "Pacienti", key: "patient" }, { header: "Trajtimi", key: "treatment" }, { header: "Statusi", key: "status" },
                ], data: appointments.map((a) => ({ date: a.date, time: a.time, patient: a.patientName, treatment: a.treatment, status: a.status })) }),
                financial: () => exportPDF({ title: "Raporti Financiar", filename: "raporti-financiar", columns: [
                  { header: "Kategoria", key: "category" }, { header: "Shuma", key: "amount", align: "right" },
                ], data: [{ category: "Të ardhura", amount: `€${totalRevenue}` }, { category: "Shpenzime", amount: `€${totalExpenses}` }, { category: "Fitimi neto", amount: `€${totalRevenue - totalExpenses}` }, { category: "Papaguar", amount: `€${unpaidTotal}` }] }),
                treatments: () => exportPDF({ title: "Raporti i Trajtimeve", filename: "raporti-trajtimeve", columns: [
                  { header: "Emri", key: "name" }, { header: "Kategoria", key: "category" }, { header: "Çmimi", key: "price", align: "right" }, { header: "Kohëzgjatja", key: "duration", align: "right" },
                ], data: treatments.map((t) => ({ name: t.name, category: t.category, price: `€${t.price}`, duration: `${t.duration} min` })) }),
              };
              configs[tab]();
            }}
            onExportCSV={handleExportCSV}
          />
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Pacientë aktivë", value: `${activePatients}`, icon: Users, detail: `nga ${patients.length}` },
          { label: "Takime", value: `${appointments.length}`, icon: Calendar, detail: "gjithsej" },
          { label: "Të ardhura", value: `€${totalRevenue.toFixed(0)}`, icon: TrendingUp, detail: "paguar" },
          { label: "Pa paguar", value: `€${unpaidTotal.toFixed(0)}`, icon: BarChart3, detail: "mbetur" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: i * 0.05 }} className="rounded-card bg-card p-4 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{stat.detail}</span>
            </div>
            <p className="text-2xl font-semibold tabular-nums font-mono text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/50 pb-px">
        {([
          { key: "patients", label: "Pacientët" },
          { key: "visits", label: "Vizitat" },
          { key: "financial", label: "Financiare" },
          { key: "treatments", label: "Procedurat" },
        ] as { key: ReportTab; label: string }[]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 text-sm transition-colors duration-150 border-b-2 -mb-px ${tab === t.key ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "patients" && (
        <div className="rounded-card bg-card shadow-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Pacienti</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Vizita e fundit</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Balanca</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Alergjitë</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {patients.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...clinicalTransition, delay: i * 0.03 }} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{p.firstName} {p.lastName}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${p.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-sm tabular-nums text-foreground">{p.lastVisit}</td>
                  <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-foreground">€{p.balance.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">{p.allergies.length > 0 ? p.allergies.join(", ") : "—"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "visits" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-card bg-card shadow-subtle">
            <div className="px-4 py-3 border-b border-border/50"><h2 className="text-sm font-medium text-foreground">Vizitat sipas dentistit</h2></div>
            <div className="divide-y divide-border/50">
              {dentists.map((d) => (
                <div key={d.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{d.firstName[0]}{d.lastName[0]}</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Dr. {d.lastName}</p>
                      <p className="text-xs text-muted-foreground">{d.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums text-foreground">{d.stats.visits}</p>
                    <p className="text-xs text-muted-foreground">vizita</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-card bg-card shadow-subtle">
            <div className="px-4 py-3 border-b border-border/50"><h2 className="text-sm font-medium text-foreground">Takime sipas statusit</h2></div>
            <div className="p-4 space-y-3">
              {["confirmed", "pending", "completed", "cancelled", "in-treatment"].map((status) => {
                const count = appointments.filter((a) => a.status === status).length;
                const pct = appointments.length > 0 ? (count / appointments.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground capitalize">{status}</span>
                      <span className="font-mono tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "financial" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-card bg-card shadow-subtle">
            <div className="px-4 py-3 border-b border-border/50"><h2 className="text-sm font-medium text-foreground">Përmbledhje financiare</h2></div>
            <div className="p-4 space-y-3">
              {[
                { label: "Të ardhura totale", value: totalRevenue, color: "text-emerald-600" },
                { label: "Shpenzime totale", value: totalExpenses, color: "text-rose-600" },
                { label: "Fitimi neto", value: totalRevenue - totalExpenses, color: totalRevenue - totalExpenses >= 0 ? "text-emerald-600" : "text-destructive" },
                { label: "Fatura të papaguara", value: unpaidTotal, color: "text-amber-600" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-foreground">{row.label}</span>
                  <span className={`font-mono tabular-nums font-medium ${row.color}`}>€{row.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-card bg-card shadow-subtle">
            <div className="px-4 py-3 border-b border-border/50"><h2 className="text-sm font-medium text-foreground">Shpenzimet sipas kategorisë</h2></div>
            <div className="p-4 space-y-3">
              {Object.entries(expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>)).sort(([, a], [, b]) => b - a).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-foreground capitalize">{cat}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">€{amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "treatments" && (
        <div className="rounded-card bg-card shadow-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Procedura</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kategoria</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Çmimi</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kohëzgjatja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {treatments.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...clinicalTransition, delay: i * 0.03 }} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{t.name}</td>
                  <td className="px-4 py-3"><span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{t.category}</span></td>
                  <td className="px-4 py-3 text-right text-sm font-mono tabular-nums text-foreground">€{t.price}</td>
                  <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{t.duration} min</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
