import { useState, useEffect } from "react";
import { Settings, Clock, CreditCard, Bell, Globe, Mail, MessageSquare, Calendar, Shield, Save, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useIntegrationStore } from "@/stores/integration-store";
import { IntegrationConfigDialog } from "@/components/IntegrationConfigDialog";
import { useSettingsStore } from "@/stores/settings-store";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

type SettingsTab = "general" | "notifications" | "integrations" | "security";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("general");
  const { settings, updateSettings } = useSettingsStore();
  const [form, setForm] = useState(settings);
  const { integrations, loading: intLoading, fetchIntegrations, disconnectPlatform } = useIntegrationStore();
  const [configPlatform, setConfigPlatform] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "integrations") fetchIntegrations();
  }, [tab]);

  const handleSave = () => {
    updateSettings(form);
    toast({ title: "Cilësimet u ruajtën me sukses" });
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-base font-semibold text-foreground">Cilësimet</h1>
        <p className="text-sm text-muted-foreground">Parametra të përgjithshëm të klinikës</p>
      </div>

      <div className="flex items-center gap-1 border-b border-border/50 pb-px">
        {([
          { key: "general", label: "Të përgjithshme", icon: Settings },
          { key: "notifications", label: "Njoftimet", icon: Bell },
          { key: "integrations", label: "Integrimet", icon: Globe },
          { key: "security", label: "Siguria", icon: Shield },
        ] as { key: SettingsTab; label: string; icon: typeof Settings }[]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-2 text-sm transition-colors duration-150 border-b-2 -mb-px flex items-center gap-1.5 ${tab === t.key ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={clinicalTransition} className="space-y-6">
          <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Informacione të klinikës</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Emri i klinikës</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Telefoni</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Adresa</label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-9 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Të dhënat fiskale
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
            <Button size="sm" className="gap-1.5" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />Ruaj ndryshimet
            </Button>
          </div>
        </motion.div>
      )}

      {tab === "notifications" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={clinicalTransition} className="space-y-4">
          <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Kujtesa automatike</h3>
            {[
              { label: "Kujtesë SMS para takimit", detail: "24 orë përpara", enabled: true },
              { label: "Kujtesë email para takimit", detail: "48 orë përpara", enabled: true },
              { label: "Kujtesë kontrolli 6-mujor", detail: "Çdo 6 muaj", enabled: true },
              { label: "Kujtesë pagese e vonuar", detail: "7 ditë pas afatit", enabled: false },
              { label: "Falënderim pas vizitës", detail: "SMS automatik", enabled: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div><p className="text-sm text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.detail}</p></div>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
          </div>
          <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Njoftime për stafin</h3>
            {[
              { label: "Takim i ri i caktuar", enabled: true },
              { label: "Takim i anuluar", enabled: true },
              { label: "Pagesë e vonuar (> 30 ditë)", enabled: false },
              { label: "Raport ditor i vizitave", enabled: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <p className="text-sm text-foreground">{item.label}</p>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "integrations" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={clinicalTransition} className="space-y-4">
          {intLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!intLoading && [
            { platform: "whatsapp", icon: MessageSquare },
            { platform: "facebook", icon: MessageSquare },
            { platform: "instagram", icon: MessageSquare },
            { platform: "email", icon: Mail },
            { platform: "google_calendar", icon: Calendar },
          ].map((item) => {
            const integration = integrations.find((i) => i.platform === item.platform);
            const isConnected = integration?.is_connected ?? false;
            const displayName = integration?.display_name || item.platform;
            const connectedAccount = integration?.connected_account;

            return (
              <div key={item.platform} className="rounded-card bg-card shadow-subtle p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isConnected ? "bg-emerald-100" : "bg-muted"}`}>
                    <item.icon className={`h-5 w-5 ${isConnected ? "text-emerald-600" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{displayName}</p>
                      {isConnected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    {isConnected && connectedAccount ? (
                      <p className="text-xs text-emerald-600">Lidhur: {connectedAccount}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Nuk është lidhur</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={async () => {
                        await disconnectPlatform(item.platform);
                        toast({ title: `${displayName} u shkëput` });
                      }}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Shkëput
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setConfigPlatform(item.platform)}>Lidhu</Button>
                  )}
                </div>
              </div>
            );
          })}

          <IntegrationConfigDialog
            open={!!configPlatform}
            onOpenChange={(v) => { if (!v) setConfigPlatform(null); }}
            platform={configPlatform || ""}
            onSuccess={() => fetchIntegrations()}
          />
        </motion.div>
      )}

      {tab === "security" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={clinicalTransition} className="space-y-4">
          <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" />Siguria & Privatësia</h3>
            {[
              { label: "Autentifikimi me dy faktorë (2FA)", detail: "Shtresë shtesë sigurie për stafin", enabled: false },
              { label: "Sesion i automatshëm pas 30 min", detail: "Çkyçje automatike pas mosveprimtarisë", enabled: true },
              { label: "Audit log", detail: "Regjistro çdo ndryshim në sistem", enabled: true },
              { label: "Enkriptim i të dhënave", detail: "Të dhënat e pacientëve të enkriptuara", enabled: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <div><p className="text-sm text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.detail}</p></div>
                <Switch defaultChecked={item.enabled} />
              </div>
            ))}
          </div>
          <div className="rounded-card bg-card shadow-subtle p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Backup & Restore</h3>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-foreground">Backup automatik ditor</p><p className="text-xs text-muted-foreground">Backup i fundit: 14 Mars 2026, 02:00</p></div>
              <Button variant="outline" size="sm">Shkarko Backup</Button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-foreground">Eksport i të dhënave (GDPR)</p><p className="text-xs text-muted-foreground">Eksporto të gjitha të dhënat e pacientëve</p></div>
              <Button variant="outline" size="sm">Eksporto</Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
