import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, Building2, Activity } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";

interface ClinicActivity {
  clinic_id: string;
  clinic_name: string;
  user_count: number;
  is_active: boolean;
}

export default function SuperAdminAnalytics() {
  const { clinics, plans } = useAuthStore();
  const [clinicActivity, setClinicActivity] = useState<ClinicActivity[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsByStatus, setLeadsByStatus] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [clinics]);

  const fetchAnalytics = async () => {
    setLoading(true);

    // Fetch user counts per clinic
    const activities: ClinicActivity[] = [];
    for (const clinic of clinics) {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("clinic_id", clinic.id);
      activities.push({
        clinic_id: clinic.id,
        clinic_name: clinic.name,
        user_count: count || 0,
        is_active: clinic.is_active,
      });
    }
    setClinicActivity(activities);

    // Fetch leads grouped by status
    const { data: leads } = await supabase.from("leads").select("status");
    if (leads) {
      setTotalLeads(leads.length);
      const byStatus: Record<string, number> = {};
      leads.forEach((l) => {
        byStatus[l.status] = (byStatus[l.status] || 0) + 1;
      });
      setLeadsByStatus(byStatus);
    }

    setLoading(false);
  };

  const statusLabels: Record<string, string> = {
    new: "Të rinj",
    contacted: "Kontaktuar",
    consulting: "Konsultim",
    waiting: "Në pritje",
    converted: "Konvertuar",
    lost: "Humbur",
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    consulting: "bg-purple-100 text-purple-700",
    waiting: "bg-orange-100 text-orange-700",
    converted: "bg-emerald-100 text-emerald-700",
    lost: "bg-red-100 text-red-700",
  };

  const maxUsers = Math.max(...clinicActivity.map((c) => c.user_count), 1);

  return (
    <div className="p-5 space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Analytics Global
        </h1>
        <p className="text-sm text-muted-foreground">Statistika dhe aktiviteti i platformës</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition }} className="rounded-card bg-card shadow-subtle p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Building2 className="h-4 w-4" /><span className="text-xs">Klinika</span></div>
          <p className="text-2xl font-semibold">{clinics.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: 0.05 }} className="rounded-card bg-card shadow-subtle p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Users className="h-4 w-4" /><span className="text-xs">Përdorues</span></div>
          <p className="text-2xl font-semibold">{clinicActivity.reduce((s, c) => s + c.user_count, 0)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: 0.1 }} className="rounded-card bg-card shadow-subtle p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><TrendingUp className="h-4 w-4" /><span className="text-xs">Leads</span></div>
          <p className="text-2xl font-semibold">{totalLeads}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: 0.15 }} className="rounded-card bg-card shadow-subtle p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><BarChart3 className="h-4 w-4" /><span className="text-xs">Konversion</span></div>
          <p className="text-2xl font-semibold">
            {totalLeads > 0 ? Math.round(((leadsByStatus["converted"] || 0) / totalLeads) * 100) : 0}%
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Clinic Activity Bar Chart (CSS-based) */}
        <div className="rounded-card bg-card shadow-subtle p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Përdorues për Klinikë
          </h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Duke ngarkuar...</div>
          ) : clinicActivity.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Nuk ka të dhëna</div>
          ) : (
            <div className="space-y-3">
              {clinicActivity.map((ca) => (
                <div key={ca.clinic_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground truncate max-w-[200px]">{ca.clinic_name}</span>
                    <span className="text-muted-foreground">{ca.user_count} përdorues</span>
                  </div>
                  <div className="h-6 bg-muted/50 rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(ca.user_count / maxUsers) * 100}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full rounded-md ${ca.is_active ? "bg-primary/70" : "bg-muted-foreground/30"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leads by Status */}
        <div className="rounded-card bg-card shadow-subtle p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Leads sipas Statusit
          </h3>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Duke ngarkuar...</div>
          ) : totalLeads === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Nuk ka leads</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(leadsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[status] || "bg-muted text-muted-foreground"}`}>
                      {statusLabels[status] || status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalLeads) * 100}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full bg-primary/60 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plans usage */}
      <div className="rounded-card bg-card shadow-subtle p-5">
        <h3 className="text-sm font-semibold mb-4">Përdorimi i Planeve</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const clinicsOnPlan = clinics.filter((c) => c.plan_id === plan.id);
            return (
              <div key={plan.id} className="p-4 rounded-lg bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{plan.name}</h4>
                  <span className="text-xs text-primary font-semibold">€{plan.price}/muaj</span>
                </div>
                <p className="text-2xl font-bold">{clinicsOnPlan.length}</p>
                <p className="text-xs text-muted-foreground">{clinicsOnPlan.length === 1 ? "klinikë" : "klinika"} aktive</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {clinicsOnPlan.map((c) => (
                    <span key={c.id} className="text-[10px] bg-card px-1.5 py-0.5 rounded shadow-sm truncate max-w-[120px]">{c.name}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
