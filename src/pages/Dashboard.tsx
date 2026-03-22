import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Receipt, ArrowUpRight } from "lucide-react";
import { todayAppointments } from "@/lib/mock-data";
import { useLeadStore } from "@/stores/lead-store";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Skeleton } from "@/components/ui/skeleton";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CashflowChart } from "@/components/dashboard/CashflowChart";
import { ExpensesDonut } from "@/components/dashboard/ExpensesDonut";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { PatientsCard } from "@/components/dashboard/PatientsCard";
import { PopularTreatments } from "@/components/dashboard/PopularTreatments";


export default function Dashboard() {
  const navigate = useNavigate();
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [invoicePreselect, setInvoicePreselect] = useState<{
    patientId?: string; treatment?: string; dentist?: string;
  }>({});
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchLeads = useLeadStore((s) => s.fetchLeads);

  useEffect(() => {
    fetchLeads();
    const t = setTimeout(() => setInitialLoading(false), 600);
    return () => clearTimeout(t);
  }, [fetchLeads]);

  const handleCreateInvoice = (apt: typeof todayAppointments[0]) => {
    setInvoicePreselect({ patientId: apt.patientId, treatment: apt.treatment, dentist: apt.dentist });
    setCreateInvoiceOpen(true);
  };

  return (
    <div className="p-5 space-y-5 max-w-[1400px]">
      <DashboardHeader />

      {/* Row 1: Cashflow (wide) + Expenses donut */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          {initialLoading ? <Skeleton className="w-full h-[310px] rounded-card" /> : <CashflowChart />}
        </div>
        <div className="col-span-12 lg:col-span-4">
          {initialLoading ? <Skeleton className="w-full h-[310px] rounded-card" /> : <ExpensesDonut />}
        </div>
      </div>

      {/* Row 2: Income/Expense + Patients + Popular Treatments in one row */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4">
          {initialLoading ? <Skeleton className="w-full h-[320px] rounded-card" /> : <IncomeExpenseChart />}
        </div>
        <div className="col-span-12 md:col-span-4">
          {initialLoading ? <Skeleton className="w-full h-[320px] rounded-card" /> : <PatientsCard />}
        </div>
        <div className="col-span-12 md:col-span-4">
          {initialLoading ? <Skeleton className="w-full h-[320px] rounded-card" /> : <PopularTreatments />}
        </div>
      </div>

      {/* Row 3: Today's appointments */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...clinicalTransition, delay: 0.3 }}
        className="rounded-card bg-card shadow-subtle"
        style={{ maxHeight: 380 }}
      >
        <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            Takimet e Sotme
          </h3>
          <Button size="sm" variant="ghost" className="gap-1 text-xs h-7" onClick={() => navigate("/appointments")}>
            Shiko të gjitha <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="divide-y divide-border/50 overflow-y-auto" style={{ maxHeight: 330 }}>
          {todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nuk ka takime sot</p>
            </div>
          ) : (
            todayAppointments.map((apt, i) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...clinicalTransition, delay: i * 0.03 }}
                className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors duration-150 group"
              >
                <span className="text-sm font-medium tabular-nums font-mono text-foreground w-12 shrink-0">{apt.time}</span>
                <div className={`w-0.5 h-7 rounded-full shrink-0 ${
                  apt.treatment.includes("Root") || apt.treatment.includes("Extraction")
                    ? "bg-destructive"
                    : apt.treatment.includes("Clean")
                    ? "bg-primary"
                    : "bg-status-pending"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{apt.patientName}</p>
                  <p className="text-xs text-muted-foreground">{apt.treatment} · {apt.dentist} · {apt.room}</p>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums font-mono shrink-0">{apt.duration}′</span>
                <StatusBadge status={apt.status} />
                <button
                  onClick={() => handleCreateInvoice(apt)}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                  title="Krijo faturë"
                >
                  <Receipt className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <CreateInvoiceDialog
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
        preselectedPatientId={invoicePreselect.patientId}
        preselectedTreatment={invoicePreselect.treatment}
        preselectedDentist={invoicePreselect.dentist}
      />
    </div>
  );
}
