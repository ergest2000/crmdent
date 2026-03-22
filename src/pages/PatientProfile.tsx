import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, User, Users, Download, ClipboardList } from "lucide-react";
import { usePatientStore } from "@/stores/patient-store";
import { useAppointmentStore } from "@/stores/appointment-store";
import { useInvoiceStore } from "@/stores/invoice-store";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { useState } from "react";
import { PatientDialog } from "@/components/PatientDialog";
import { DentalChart } from "@/components/DentalChart";
import { PatientAttachments } from "@/components/patient/PatientAttachments";
import { TreatmentPlanSection } from "@/components/patient/TreatmentPlanSection";

import { toast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/lib/invoice-pdf";


export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patients = usePatientStore((s) => s.patients);
  const updatePatient = usePatientStore((s) => s.updatePatient);
  const allAppointments = useAppointmentStore((s) => s.appointments);
  const allInvoices = useInvoiceStore((s) => s.invoices);

  const patient = useMemo(() => patients.find((p) => p.id === id), [patients, id]);
  const appointments = useMemo(() => allAppointments.filter((a) => a.patientId === id), [allAppointments, id]);
  const invoices = useMemo(() => allInvoices.filter((inv) => inv.patientId === id), [allInvoices, id]);
  const [editOpen, setEditOpen] = useState(false);

  if (!patient) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")} className="gap-1.5 mb-4">
          <ArrowLeft className="h-4 w-4" /> Kthehu
        </Button>
        <p className="text-muted-foreground">Pacienti nuk u gjet.</p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const pastAppointments = appointments.filter((a) => a.date < today || a.status === "completed");
  const futureAppointments = appointments.filter((a) => a.date >= today && a.status !== "completed");

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patients")} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-foreground">{patient.firstName} {patient.lastName}</h1>
          <p className="text-sm text-muted-foreground">{patient.id} · Regjistruar {patient.lastVisit}</p>
        </div>
        <StatusBadge status={patient.status} />
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/patients/${patient.id}/intake`)}>
          <ClipboardList className="h-3.5 w-3.5" /> Formulari
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
          <Edit className="h-3.5 w-3.5" /> Edito
        </Button>
      </div>

      {/* Personal info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Phone, label: "Telefoni", value: patient.phone || "—" },
          { icon: Mail, label: "Email", value: patient.email || "—" },
          { icon: Calendar, label: "Data e lindjes", value: patient.dateOfBirth || "—" },
          { icon: MapPin, label: "Adresa", value: patient.address || "—" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...clinicalTransition, delay: i * 0.05 }} className="rounded-card bg-card p-4 shadow-subtle">
            <div className="flex items-center gap-2 text-muted-foreground mb-2"><item.icon className="h-3.5 w-3.5" /><span className="text-xs">{item.label}</span></div>
            <p className="text-sm font-medium text-foreground">{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Extra info row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-card bg-card p-4 shadow-subtle">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><User className="h-3.5 w-3.5" /><span className="text-xs">Gjinia</span></div>
          <p className="text-sm font-medium text-foreground">{patient.gender === "M" ? "Mashkull" : patient.gender === "F" ? "Femër" : "—"}</p>
        </div>
        <div className="rounded-card bg-card p-4 shadow-subtle">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="h-3.5 w-3.5" /><span className="text-xs">Vizita e fundit</span></div>
          <p className="text-sm font-medium text-foreground">{patient.lastVisit}</p>
        </div>
        <div className="rounded-card bg-card p-4 shadow-subtle">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><FileText className="h-3.5 w-3.5" /><span className="text-xs">Balanca</span></div>
          <p className={`text-sm font-medium font-mono ${patient.balance > 0 ? "text-destructive" : "text-foreground"}`}>€{patient.balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Companion info */}
      {patient.companion && (
        <div className="rounded-card bg-blue-50 border border-blue-200 p-3 flex items-center gap-3">
          <Users className="h-4 w-4 text-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-700">Shoqëruesi</p>
            <p className="text-sm text-blue-600">{patient.companion}</p>
          </div>
        </div>
      )}

      {/* Attachments — always visible at top */}
      <PatientAttachments patient={patient} />

      {/* Tabs */}
      <Tabs defaultValue="dental" className="w-full">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="dental" className="text-xs">Skema Dentare</TabsTrigger>
          <TabsTrigger value="treatment-plan" className="text-xs">Plani i Trajtimit</TabsTrigger>
          <TabsTrigger value="treatments" className="text-xs">Historiku ({patient.dentalRecords.length})</TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs">Takimet ({appointments.length})</TabsTrigger>
          <TabsTrigger value="invoices" className="text-xs">Faturat ({invoices.length})</TabsTrigger>
        </TabsList>

        {/* Dental Chart */}
        <TabsContent value="dental" className="mt-4">
          <DentalChart patientId={patient.id} />
        </TabsContent>

        {/* Treatment Plan */}
        <TabsContent value="treatment-plan" className="mt-4">
          <TreatmentPlanSection patientId={patient.id} />
        </TabsContent>




        {/* Treatment History */}
        <TabsContent value="treatments" className="mt-4">
          <div className="rounded-card bg-card shadow-subtle overflow-hidden">
            {patient.dentalRecords.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Dhëmbi</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Trajtimi</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Dentisti</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Shënime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[...patient.dentalRecords].reverse().map((r, i) => {
                    const condLabels: Record<string, string> = {
                      healthy: "I shëndetshëm", caries: "Karies", filling: "Mbushje",
                      "root-canal": "Trajtim kanali", implant: "Implant", crown: "Kurorë",
                      extraction: "Nxjerrje", "in-treatment": "Në trajtim",
                    };
                    return (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm font-mono text-foreground">#{r.toothNumber}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.condition} /></td>
                        <td className="px-4 py-3 text-sm text-foreground">{r.date}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{r.dentist}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{r.notes || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">Nuk ka trajtime të regjistruara. Përdorni grafin dentare për të shtuar trajtime.</div>
            )}
          </div>
        </TabsContent>

        {/* Appointments */}
        <TabsContent value="appointments" className="mt-4 space-y-4">
          {/* Upcoming */}
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Vizitat e ardhshme ({futureAppointments.length})</h4>
            <div className="rounded-card bg-card shadow-subtle overflow-hidden">
              {futureAppointments.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Ora</th>
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Trajtimi</th>
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Dentisti</th>
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {futureAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm text-foreground">{a.date}</td>
                        <td className="px-4 py-3 text-sm font-mono text-foreground">{a.time}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{a.treatment}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{a.dentist}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">Nuk ka vizita të ardhshme.</div>
              )}
            </div>
          </div>

          {/* Past */}
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Vizitat e kaluara ({pastAppointments.length})</h4>
            <div className="rounded-card bg-card shadow-subtle overflow-hidden">
              {pastAppointments.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Ora</th>
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Trajtimi</th>
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Dentisti</th>
                      <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {pastAppointments.map((a) => (
                      <tr key={a.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm text-foreground">{a.date}</td>
                        <td className="px-4 py-3 text-sm font-mono text-foreground">{a.time}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{a.treatment}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{a.dentist}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">Nuk ka vizita të kaluara.</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="mt-4">
          <div className="rounded-card bg-card shadow-subtle overflow-hidden">
            {invoices.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Nr. Faturës</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
                    <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Total</th>
                    <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Paguar</th>
                    <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Statusi</th>
                    <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm text-foreground">{inv.date}</td>
                      <td className="px-4 py-3 text-right text-sm font-mono text-foreground">€{inv.total.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-sm font-mono text-emerald-600">€{inv.paid.toFixed(2)}</td>
                      <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => {
                          generateInvoicePDF(inv);
                          toast({ title: "PDF u shkarkua" });
                        }}>
                          <Download className="h-3 w-3" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">Nuk ka fatura të regjistruara.</div>
            )}
          </div>
        </TabsContent>



      </Tabs>

      {/* Edit Patient Dialog */}
      <PatientDialog open={editOpen} onOpenChange={setEditOpen} editPatient={patient} />

    </div>
  );
}
