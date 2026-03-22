import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { ArrowLeft, Save, Download, Printer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { usePatientStore } from "@/stores/patient-store";
import { useIntakeFormStore, type IntakeFormData } from "@/stores/intake-form-store";
import { YesNoField } from "@/components/intake/YesNoField";
import { SignaturePad } from "@/components/intake/SignaturePad";
import { exportIntakeFormPDF } from "@/lib/intake-form-pdf";
import { useSettingsStore } from "@/stores/settings-store";

const VISIT_TAGS = [
  "Kontroll rutinë",
  "Dhimbje",
  "Estetikë dentare",
  "Implantologji",
  "Urgjencë",
  "Restaurim",
  "ALL-ON-4",
];

export default function PatientIntakeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patient = usePatientStore((s) => s.patients.find((p) => p.id === id));
  const { getForm, saveForm, createForm } = useIntakeFormStore();
  const clinicSettings = useSettingsStore((s) => s.settings);

  const [form, setForm] = useState<IntakeFormData | null>(null);

  useEffect(() => {
    if (!id) return;
    let existing = getForm(id);
    if (!existing) {
      existing = createForm(id);
    }
    // Prefill from patient data
    if (patient && !existing.firstName) {
      existing = {
        ...existing,
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        dateOfBirth: patient.dateOfBirth || "",
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
      };
    }
    setForm(existing);
  }, [id]);

  if (!form || !patient) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 mb-4">
          <ArrowLeft className="h-4 w-4" /> Kthehu
        </Button>
        <p className="text-muted-foreground">Pacienti nuk u gjet.</p>
      </div>
    );
  }

  const update = (patch: Partial<IntakeFormData>) => {
    setForm((prev) => prev ? { ...prev, ...patch } : prev);
  };

  const toggleTag = (tag: string) => {
    const tags = form.visitReasonTags.includes(tag)
      ? form.visitReasonTags.filter((t) => t !== tag)
      : [...form.visitReasonTags, tag];
    update({ visitReasonTags: tags });
  };

  const handleSave = () => {
    saveForm(form);
    toast({ title: "Formulari u ruajt me sukses" });
  };

  const handleExportPDF = () => {
    exportIntakeFormPDF(form, clinicSettings.name, `${clinicSettings.phone}  |  ${clinicSettings.email}`, clinicSettings.address);
    toast({ title: "PDF u shkarkua" });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div {...clinicalTransition} className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${id}`)} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Profili
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Formulari i Aplikimit</h1>
            <p className="text-sm text-muted-foreground">{patient.firstName} {patient.lastName}</p>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="h-3.5 w-3.5" /> Ruaj
          </Button>
        </div>
      </div>

      {/* Section 1: Personal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            Të Dhënat Personale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Emri *</Label>
              <Input value={form.firstName} onChange={(e) => update({ firstName: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Mbiemri *</Label>
              <Input value={form.lastName} onChange={(e) => update({ lastName: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Datëlindja</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => update({ dateOfBirth: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Gjinia</Label>
              <Select value={form.gender} onValueChange={(v) => update({ gender: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Mashkull</SelectItem>
                  <SelectItem value="F">Femër</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Telefoni *</Label>
              <Input value={form.phone} onChange={(e) => update({ phone: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update({ email: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Adresa</Label>
              <Input value={form.address} onChange={(e) => update({ address: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Qyteti / Shteti</Label>
              <Input value={form.city} onChange={(e) => update({ city: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Kontakt Emergjence (opsionale)</Label>
              <Input value={form.emergencyContact} onChange={(e) => update({ emergencyContact: e.target.value })} placeholder="Emri, telefoni" className="h-9 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox checked={form.acceptNotifications} onCheckedChange={(c) => update({ acceptNotifications: !!c })} />
            <Label className="text-xs font-normal">Pranoj të marr njoftime (reminder për takime dhe oferta)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Visit Reason */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
            Arsyeja e Vizitës
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {VISIT_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={form.visitReasonTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => toggleTag(tag)}
              >
                {form.visitReasonTags.includes(tag) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {tag}
              </Badge>
            ))}
          </div>
          <div>
            <Label className="text-xs">Përshkrim i detajuar</Label>
            <Textarea
              value={form.visitReason}
              onChange={(e) => update({ visitReason: e.target.value })}
              placeholder="Përshkruani arsyen e vizitës..."
              className="text-sm min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Medical History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
            Anamneza Mjekësore
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <YesNoField label="Sëmundje kardiovaskulare (hipertension, aritmi, infarkt)?" checked={form.cardiovascular} onCheckedChange={(v) => update({ cardiovascular: v })} details={form.cardiovascularDetails} onDetailsChange={(v) => update({ cardiovascularDetails: v })} />
          <YesNoField label="Diabet? (Vlera e fundit e HbA1c?)" checked={form.diabetes} onCheckedChange={(v) => update({ diabetes: v })} details={form.diabetesDetails} onDetailsChange={(v) => update({ diabetesDetails: v })} detailsPlaceholder="Vlera HbA1c, tipi..." />
          <YesNoField label="Probleme respiratore (astmë, apne)?" checked={form.respiratory} onCheckedChange={(v) => update({ respiratory: v })} details={form.respiratoryDetails} onDetailsChange={(v) => update({ respiratoryDetails: v })} />
          <YesNoField label="Probleme me koagulimin e gjakut?" checked={form.coagulation} onCheckedChange={(v) => update({ coagulation: v })} details={form.coagulationDetails} onDetailsChange={(v) => update({ coagulationDetails: v })} />
          <YesNoField label="Sëmundje infektive (HIV, hepatit, TBC)?" checked={form.infectious} onCheckedChange={(v) => update({ infectious: v })} details={form.infectiousDetails} onDetailsChange={(v) => update({ infectiousDetails: v })} />
          <YesNoField label="Alergji (latex, metale, ushqime)?" checked={form.allergies} onCheckedChange={(v) => update({ allergies: v })} details={form.allergiesDetails} onDetailsChange={(v) => update({ allergiesDetails: v })} />
        </CardContent>
      </Card>

      {/* Section 4: Medications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
            Medikamente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <YesNoField label="Merr antikoagulantë? (Aspirin, Warfarin, etj.)" checked={form.anticoagulants} onCheckedChange={(v) => update({ anticoagulants: v })} details={form.anticoagulantsDetails} onDetailsChange={(v) => update({ anticoagulantsDetails: v })} />
          <YesNoField label="Merr bifosfonate?" checked={form.bisphosphonates} onCheckedChange={(v) => update({ bisphosphonates: v })} details={form.bisphosphonatesDetails} onDetailsChange={(v) => update({ bisphosphonatesDetails: v })} />
          <YesNoField label="Po merr antibiotikë / antiinflamatorë aktualisht?" checked={form.currentMedication} onCheckedChange={(v) => update({ currentMedication: v })} details={form.currentMedicationDetails} onDetailsChange={(v) => update({ currentMedicationDetails: v })} />
          <YesNoField label="Alergji ndaj ilaçeve? (Penicillin, anestezi lokale, FANS)" checked={form.drugAllergy} onCheckedChange={(v) => update({ drugAllergy: v })} details={form.drugAllergyDetails} onDetailsChange={(v) => update({ drugAllergyDetails: v })} />
        </CardContent>
      </Card>

      {/* Section 5: Lifestyle */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">5</span>
            Stil Jete & Zakone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <YesNoField label="Pi duhan / vape?" checked={form.smoking} onCheckedChange={(v) => update({ smoking: v })} details={form.smokingDetails} onDetailsChange={(v) => update({ smokingDetails: v })} detailsPlaceholder="Sa cigare / ditë?" />
          <YesNoField label="Konsumon alkool?" checked={form.alcohol} onCheckedChange={(v) => update({ alcohol: v })} details={form.alcoholDetails} onDetailsChange={(v) => update({ alcoholDetails: v })} />
          <div className="rounded-lg border p-3 bg-card">
            <Label className="text-sm font-normal">Higjiena orale — sa herë lan dhëmbët në ditë?</Label>
            <Select value={form.oralHygiene} onValueChange={(v) => update({ oralHygiene: v })}>
              <SelectTrigger className="h-8 text-sm mt-1.5"><SelectValue placeholder="Zgjidh" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Asnjëherë</SelectItem>
                <SelectItem value="1">1 herë</SelectItem>
                <SelectItem value="2">2 herë</SelectItem>
                <SelectItem value="3">3+ herë</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Special Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">6</span>
            Status i Veçantë (Femra)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <YesNoField label="Shtatzënë?" checked={form.pregnant} onCheckedChange={(v) => update({ pregnant: v })} />
          {form.pregnant && (
            <div className="pl-3">
              <Label className="text-xs">Në cilin tremujor?</Label>
              <Select value={form.trimester} onValueChange={(v) => update({ trimester: v })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Zgjidh" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">I parë (1-12 javë)</SelectItem>
                  <SelectItem value="2">I dytë (13-26 javë)</SelectItem>
                  <SelectItem value="3">I tretë (27-40 javë)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <YesNoField label="Ushqen me gji?" checked={form.breastfeeding} onCheckedChange={(v) => update({ breastfeeding: v })} />
        </CardContent>
      </Card>

      {/* Section 7: Clinical */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">7</span>
            Informacion Klinik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Sa kohë ka problemi?</Label>
            <Input value={form.problemDuration} onChange={(e) => update({ problemDuration: e.target.value })} placeholder="p.sh. 2 javë, 3 muaj" className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-2 block">Nivel dhimbje: <span className="font-bold text-primary">{form.painLevel}/10</span></Label>
            <Slider
              value={[form.painLevel]}
              onValueChange={([v]) => update({ painLevel: v })}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Pa dhimbje</span>
              <span>Dhimbje maksimale</span>
            </div>
          </div>
          <div>
            <Label className="text-xs">Vërejtje shtesë</Label>
            <Textarea
              value={form.additionalNotes}
              onChange={(e) => update({ additionalNotes: e.target.value })}
              placeholder="Informacione shtesë klinike..."
              className="text-sm min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 8: Consent & Signature */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">8</span>
            Dokumente & Konsent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox checked={form.consentGDPR} onCheckedChange={(c) => update({ consentGDPR: !!c })} className="mt-0.5" />
              <Label className="text-xs font-normal leading-snug">Pranoj kushtet e përpunimit të të dhënave personale (GDPR)</Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox checked={form.consentTreatment} onCheckedChange={(c) => update({ consentTreatment: !!c })} className="mt-0.5" />
              <Label className="text-xs font-normal leading-snug">Jap konsentimin për trajtimin dentar</Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox checked={form.consentCommunication} onCheckedChange={(c) => update({ consentCommunication: !!c })} className="mt-0.5" />
              <Label className="text-xs font-normal leading-snug">Pranoj komunikimin përmes telefonit, email ose SMS</Label>
            </div>
          </div>
          <Separator />
          <div>
            <Label className="text-xs mb-2 block">Firma e Pacientit</Label>
            <SignaturePad value={form.signatureData} onChange={(v) => update({ signatureData: v })} />
          </div>
        </CardContent>
      </Card>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 pb-8 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Eksporto PDF
        </Button>
        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save className="h-3.5 w-3.5" /> Ruaj Formularin
        </Button>
      </div>
    </motion.div>
  );
}
