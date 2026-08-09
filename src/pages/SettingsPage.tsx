import { useState, useEffect, useRef } from "react";
import { Settings, Clock, CreditCard, Save, Upload, Building2 } from "lucide-react";
import { useSettingsStore } from "@/stores/settings-store";
import { useClinicStore } from "@/stores/clinic-store";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();
  const [form, setForm] = useState(settings);

  const clinic = useClinicStore((s) => s.clinic);
  const fetchClinic = useClinicStore((s) => s.fetchClinic);
  const updateClinic = useClinicStore((s) => s.updateClinic);
  const uploadLogo = useClinicStore((s) => s.uploadLogo);

  const [clinicName, setClinicName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchClinic(); }, []);
  useEffect(() => {
    if (clinic) { setClinicName(clinic.name || ""); setLogoUrl(clinic.logo_url || null); }
  }, [clinic]);

  const handleLogoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadLogo(file);
    if (url) { setLogoUrl(url); toast({ title: "Logoja u ngarkua" }); }
    else toast({ title: "Ngarkimi i logos dështoi", variant: "destructive" });
  };

  const handleSave = async () => {
    setSaving(true);
    updateSettings(form);
    const ok = await updateClinic({ name: clinicName, logo_url: logoUrl });
    setSaving(false);
    toast({ title: ok ? "Cilësimet u ruajtën me sukses" : "Cilësimet u ruajtën (klinika s'u përditësua)" });
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-base font-semibold text-foreground">Cilësimet</h1>
        <p className="text-sm text-muted-foreground">Parametra të përgjithshëm të klinikës</p>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={clinicalTransition} className="space-y-6">
        {/* Branding: emri + logo */}
        <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />Identiteti i klinikës
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
              {logoUrl
                ? <img src={logoUrl} alt="logo" className="h-full w-full object-cover" />
                : <Building2 className="h-6 w-6 text-muted-foreground" />}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoPick} />
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" />Ngarko logon
              </Button>
              <p className="text-[11px] text-muted-foreground mt-1.5">PNG ose JPG, katror funksionon më mirë.</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Emri i klinikës</label>
            <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Telefoni</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground block mb-1.5">Adresa</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* Fiskale */}
        <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />Të dhënat fiskale
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">NIPT</label>
              <Input value={form.nipt} onChange={(e) => setForm({ ...form, nipt: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">IBAN</label>
              <Input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Emri i bankës</label>
              <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">TVSH (%)</label>
              <Input type="number" value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: Number(e.target.value) })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Afati i pagesës (ditë)</label>
              <Input type="number" value={form.paymentTermsDays} onChange={(e) => setForm({ ...form, paymentTermsDays: Number(e.target.value) })} className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Monedha</label>
              <Input value={form.currencySymbol} onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })} className="h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* Orari */}
        <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />Orari i punës
          </h3>
          <div className="space-y-2">
            {form.workingHours.map((s) => (
              <div key={s.day} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{s.day}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{s.hours}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5" />{saving ? "Duke ruajtur..." : "Ruaj ndryshimet"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
