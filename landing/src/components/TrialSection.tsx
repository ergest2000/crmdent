import { useState, useRef, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, X, ChevronDown, Search } from "lucide-react";
import { z } from "zod";
import { countries, roles, type CountryData } from "@/data/countriesAndRoles";

const formSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(20),
  clinicName: z.string().trim().max(100).optional(),
  position: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
});

const fieldLabels = {
  sq: { firstName: "Emri", lastName: "Mbiemri", email: "Email", phone: "Telefon", clinicName: "Emri i Klinikës", position: "Pozicioni", city: "Qyteti", country: "Shteti", submit: "Dërgo Kërkesën", success: "Faleminderit! Do t'ju kontaktojmë së shpejti.", searchCity: "Kërko qytetin...", selectCountry: "Zgjidh shtetin", selectCity: "Zgjidh qytetin", selectRole: "Zgjidh pozicionin" },
  en: { firstName: "First Name", lastName: "Last Name", email: "Email", phone: "Phone", clinicName: "Clinic Name", position: "Position", city: "City", country: "Country", submit: "Submit Request", success: "Thank you! We'll contact you soon.", searchCity: "Search city...", selectCountry: "Select country", selectCity: "Select city", selectRole: "Select position" },
  it: { firstName: "Nome", lastName: "Cognome", email: "Email", phone: "Telefono", clinicName: "Nome Clinica", position: "Posizione", city: "Città", country: "Paese", submit: "Invia Richiesta", success: "Grazie! Ti contatteremo presto.", searchCity: "Cerca città...", selectCountry: "Seleziona paese", selectCity: "Seleziona città", selectRole: "Seleziona posizione" },
} as const;

/* ── Reusable dropdown ── */
type DropdownOption = { value: string; label: string; prefix?: string };

const Dropdown = ({
  options, value, onChange, placeholder, searchable, error,
}: {
  options: DropdownOption[]; value: string; onChange: (v: string) => void;
  placeholder: string; searchable?: boolean; error?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = useMemo(() =>
    search ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())) : options
  , [search, options]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(""); }}
        className={`w-full flex items-center justify-between rounded-xl bg-background border px-4 py-2.5 text-sm transition-colors ${
          error ? "border-destructive" : "border-border"
        } ${value ? "text-foreground" : "text-muted-foreground"}`}
      >
        <span className="truncate">
          {selected ? <>{selected.prefix && <span className="mr-1.5">{selected.prefix}</span>}{selected.label}</> : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 glass rounded-xl shadow-lg max-h-56 overflow-hidden flex flex-col">
          {searchable && (
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                placeholder={placeholder}
              />
            </div>
          )}
          <div className="overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-muted-foreground text-center">—</div>
            ) : filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-muted ${
                  o.value === value ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                {o.prefix && <span>{o.prefix}</span>}
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main Section ── */
const TrialSection = () => {
  const { t, lang } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const labels = fieldLabels[lang];

  const [country, setCountry] = useState("AL");
  const [city, setCity] = useState("");
  const [position, setPosition] = useState("");

  const selectedCountry: CountryData | undefined = countries.find(c => c.code === country);

  const countryOptions: DropdownOption[] = countries.map(c => ({
    value: c.code, label: c.name[lang], prefix: c.flag,
  }));

  const cityOptions: DropdownOption[] = (selectedCountry?.cities ?? []).map(c => ({
    value: c, label: c,
  }));

  const roleOptions: DropdownOption[] = roles.map(r => ({
    value: r.value, label: r.label[lang],
  }));

  const handleCountryChange = (code: string) => {
    setCountry(code);
    setCity("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {
      ...Object.fromEntries(fd.entries()) as Record<string, string>,
      country: selectedCountry?.name[lang] ?? "",
      city,
      position,
    };
    const result = formSchema.safeParse(data);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  return (
    <section id="trial" className="relative overflow-hidden py-20 md:py-24 section-gradient-alt">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          {!showForm ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full glass-badge px-4 py-1.5 text-xs font-medium text-primary mb-6">
                {t.trial.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight font-heading">
                {t.trial.title}
              </h2>
              <p className="mt-3 sm:mt-4 text-muted-foreground text-sm sm:text-base md:text-lg font-light max-w-lg mx-auto">
                {t.trial.subtitle}
              </p>
              <div className="mt-10">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-200"
                >
                  {t.trial.button}
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : submitted ? (
            <div className="py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-xl font-semibold text-foreground">{labels.success}</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto glass rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-foreground text-left">{t.trial.button}</h3>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* First / Last name */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{labels.firstName}</label>
                  <input name="firstName" className={`w-full rounded-xl bg-background border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${errors.firstName ? "border-destructive" : "border-border"}`} placeholder={labels.firstName} />
                  {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{labels.lastName}</label>
                  <input name="lastName" className={`w-full rounded-xl bg-background border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${errors.lastName ? "border-destructive" : "border-border"}`} placeholder={labels.lastName} />
                  {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{labels.email}</label>
                  <input name="email" type="email" className={`w-full rounded-xl bg-background border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${errors.email ? "border-destructive" : "border-border"}`} placeholder={labels.email} />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{labels.phone}</label>
                  <div className={`flex items-center rounded-xl bg-background border transition-colors ${errors.phone ? "border-destructive" : "border-border"} focus-within:ring-2 focus-within:ring-primary/30`}>
                    <span className="pl-4 pr-2 text-sm text-muted-foreground select-none">{selectedCountry?.dialCode || "+355"}</span>
                    <input name="phone" type="tel" className="flex-1 bg-transparent py-2.5 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" placeholder={labels.phone} />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                </div>

                {/* Clinic name */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{labels.clinicName}</label>
                  <input name="clinicName" className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" placeholder={labels.clinicName} />
                </div>

                {/* Country dropdown */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{labels.country}</label>
                  <Dropdown options={countryOptions} value={country} onChange={handleCountryChange} placeholder={labels.selectCountry} error={!!errors.country} />
                  {errors.country && <p className="mt-1 text-xs text-destructive">{errors.country}</p>}
                </div>

                {/* City dropdown with search */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{labels.city}</label>
                  <Dropdown options={cityOptions} value={city} onChange={setCity} placeholder={labels.selectCity} searchable error={!!errors.city} />
                  {errors.city && <p className="mt-1 text-xs text-destructive">{errors.city}</p>}
                </div>

                {/* Position dropdown */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{labels.position}</label>
                  <Dropdown options={roleOptions} value={position} onChange={setPosition} placeholder={labels.selectRole} error={!!errors.position} />
                  {errors.position && <p className="mt-1 text-xs text-destructive">{errors.position}</p>}
                </div>

                {/* Submit */}
                <div className="sm:col-span-2 mt-4">
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-200">
                    {labels.submit}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrialSection;
