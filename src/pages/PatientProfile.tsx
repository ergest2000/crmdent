import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, User, FileText, AlertTriangle, Pill, Activity } from "lucide-react";
import { usePatientStore } from "@/stores/patient-store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { PatientDialog } from "@/components/PatientDialog";
import { DentalChart } from "@/components/DentalChart";
import { DentalHistory } from "@/components/dental/DentalHistory";
import { SimpleTreatmentPlan } from "@/components/patient/SimpleTreatmentPlan";
import { PatientAttachments } from "@/components/patient/PatientAttachments";
import { PatientCommunication } from "@/components/PatientCommunication";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const patients = usePatientStore((s) => s.patients);
  const fetchPatients = usePatientStore((s) => s.fetchPatients);
  const patient = patients.find((p) => p.id === id);

  useEffect(() => {
    if (patients.length === 0) {
      fetchPatients();
    }
  }, [patients.length, fetchPatients]);

  if (!patient) {
    return (
      <div className="p-6 max-w-7xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/patients")} className="gap-1.5 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" />
          Kthehu te pacientët
        </Button>
        <div className="rounded-card bg-card shadow-subtle p-8 text-center text-muted-foreground text-sm">
          Pacienti nuk u gjet.
        </div>
      </div>
    );
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;
  const initials = `${patient.firstName[0] || ""}${patient.lastName[0] || ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={clinicalTransition}
      className="p-6 space-y-4 max-w-7xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/patients")} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Pacientët
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="text-base font-semibold text-foreground">{fullName}</h1>
          <StatusBadge status={patient.status} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate(`/app/patients/${patient.id}/intake`)}>
            <FileText className="h-3.5 w-3.5" />
            Anamneza
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
            <Edit className="h-3.5 w-3.5" />
            Edito
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-card bg-card shadow-subtle p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-base font-medium text-muted-foreground shrink-0">
            {initials}
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">ID Pacienti</p>
              <p className="text-sm font-mono text-foreground">{patient.id}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Telefoni</p>
              <p className="text-sm text-foreground">{patient.phone || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
              <p className="text-sm text-foreground truncate">{patient.email || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Datëlindja</p>
              <p className="text-sm text-foreground">{patient.dateOfBirth || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><User className="h-3 w-3" /> Gjinia</p>
              <p className="text-sm text-foreground">{patient.gender || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Adresa</p>
              <p className="text-sm text-foreground truncate">{patient.address || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Vizita e fundit</p>
              <p className="text-sm tabular-nums text-foreground">{patient.lastVisit || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Balanca</p>
              <p className={`text-sm font-medium tabular-nums font-mono ${patient.balance > 0 ? "text-destructive" : "text-foreground"}`}>
                €{patient.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {patient.companion && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">👤 Shoqëruesi: <span className="text-foreground">{patient.companion}</span></p>
          </div>
        )}
      </div>

      {/* Medical alerts */}
      {(patient.medical.allergies.length > 0 || patient.medical.chronicDiseases.length > 0 || patient.medical.medications.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {patient.medical.allergies.length > 0 && (
            <div className="rounded-card bg-card shadow-subtle p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Alergjitë</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.medical.allergies.map((a, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">{a}</span>
                ))}
              </div>
            </div>
          )}
          {patient.medical.chronicDiseases.length > 0 && (
            <div className="rounded-card bg-card shadow-subtle p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Activity className="h-3.5 w-3.5 text-amber-600" />
                <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Sëmundje kronike</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.medical.chronicDiseases.map((d, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400">{d}</span>
                ))}
              </div>
            </div>
          )}
          {patient.medical.medications.length > 0 && (
            <div className="rounded-card bg-card shadow-subtle p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Pill className="h-3.5 w-3.5 text-primary" />
                <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">Medikamente</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.medical.medications.map((m, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="dental" className="w-full">
        <TabsList>
          <TabsTrigger value="dental">Harta dentare</TabsTrigger>
          <TabsTrigger value="treatments">Plani i trajtimit</TabsTrigger>
          <TabsTrigger value="history">Historiku</TabsTrigger>
          <TabsTrigger value="documents">Dokumentet</TabsTrigger>
          <TabsTrigger value="communication">Komunikimi</TabsTrigger>
        </TabsList>

        <TabsContent value="dental" className="mt-4">
          <div className="rounded-card bg-card shadow-subtle p-4">
            <DentalChart patientId={patient.id} />
          </div>
        </TabsContent>

        <TabsContent value="treatments" className="mt-4">
          <SimpleTreatmentPlan patientId={patient.id} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="rounded-card bg-card shadow-subtle p-4">
            <DentalHistory records={patient.dentalRecords} />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <PatientAttachments patient={patient} />
        </TabsContent>

        <TabsContent value="communication" className="mt-4">
          <PatientCommunication patient={patient} />
        </TabsContent>
      </Tabs>

      <PatientDialog open={editOpen} onOpenChange={setEditOpen} editPatient={patient} />
    </motion.div>
  );
}
