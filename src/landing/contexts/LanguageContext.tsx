import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "sq" | "en" | "it";

const translations = {
  sq: {
    nav: { features: "Karakteristikat", functions: "Funksione", clinic: "Klinika", faq: "Pyetje të Shpeshta", login: "Hyr", tryFree: "Provo Falas" },
    hero: {
      title1: "Menaxhimi i klinikës tuaj",
      title2: "nuk ka qenë kurrë",
      title3: "kaq i lehtë.",
      subtitle: "Leads, pacientë, doktorë, takime, trajtime, fatura, financa dhe stoku — të gjitha në një platformë të vetme. DenteOS.",
    },
    features: {
      badge: "✦ Karakteristikat",
      title: "Çdo gjë që nevojitet,",
      titleHighlight: "në një vend.",
      dashboard: "Paneli i Kontrollit",
      dashboardDesc: "KPI-të kryesore të klinikës: pacientë aktivë, takime sot, të ardhura dhe stok — të gjitha live në një pamje të centralizuar.",
      patients: "Menaxhimi i Pacientëve",
      patientsDesc: "Profil i plotë për çdo pacient: historiku dentar, planet e trajtimit, faturat, dokumentet dhe komunikimi — me një klikim.",
      calendar: "Kalendari i Takimeve",
      calendarDesc: "Planifikim i takimeve me drag & drop sipas doktorëve. Shiko disponueshmërinë dhe menaxho oraret në kohë reale.",
      reports: "Raporte & Analitika",
      reportsDesc: "Raporte financiare, trajtime të njohura, performanca e doktorëve dhe tendenca të klinikës — të gjitha në grafikë të pastër.",
      moreTitle: "...dhe shumë",
      moreHighlight: "funksione shtesë",
      leads: "Leads",
      leadsDesc: "Gjurmo pacientët potencialë, menaxho statusin e tyre dhe kthe çdo kontakt në pacient aktiv.",
      dentists: "Doktorët",
      dentistsDesc: "Shto dhe menaxho doktorët, specialitetet dhe oraret e tyre. Çdo doktor ka profilin e vet të plotë.",
      invoices: "Faturat",
      invoicesDesc: "Gjenero fatura profesionale për çdo trajtim, ndiq pagesat dhe eksporto raportet financiare.",
      finance: "Financa",
      financeDesc: "Monitoro të ardhurat, shpenzimet dhe fluksin e parasë së klinikës me grafikë interaktivë.",
      stock: "Stoku i Produkteve",
      stockDesc: "Menaxho inventarin e materialeve dentare, vendos pragje minimale dhe ndiq konsumin.",
      treatments: "Trajtimet",
      treatmentsDesc: "Krijo plane trajtimi me faza për çdo pacient, cakto doktorin përgjegjës dhe dokumento çdo procedurë.",
    },
    modern: {
      badge: "✦ Klinika Moderne",
      title: "Ndërtuar për klinikën e sotme",
      desc: "DenteOS mbulon çdo aspekt të menaxhimit: nga recepsioni tek doktori, nga fatura tek stoku. Një sistem i vetëm për të gjithë ekipin.",
      points: [
        "Menaxhim i plotë i pacientëve dhe historikut dentar",
        "Kalendar i zgjuar me caktim sipas doktorit",
        "Fatura dhe raporte financiare automatike",
        "Kontroll i stokut dhe materialeve dentare",
        "Siguri dhe backup automatik i të dhënave",
      ],
    },
    faq: {
      badge: "✦ Pyetjet më të shpeshta",
      title: "Pyetje të Shpeshta",
      items: [
        { q: "A mund ta provoj DenteOS falas?", a: "Po. DenteOS ofron 7 ditë provë falas, pa asnjë detyrim. Mund të testoni të gjitha funksionet dhe të shihni nëse është i përshtatshëm për klinikën tuaj." },
        { q: "A është i vështirë për t'u përdorur?", a: "Jo. DenteOS është ndërtuar që të jetë i thjeshtë dhe intuitiv. Stafi juaj mund ta përdorë që ditën e parë pa trajnim kompleks." },
        { q: "A është i sigurt sistemi?", a: "Po. Të gjitha të dhënat ruhen me standarde të larta sigurie dhe backup automatik, kështu që nuk rrezikoni humbje të informacionit." },
        { q: "A mund ta përdor nga telefoni?", a: "Po. DenteOS funksionon në desktop, tablet dhe mobile, kështu që mund ta menaxhoni klinikën nga kudo." },
        { q: "Sa kohë duhet për ta implementuar?", a: "Shumë shpejt. Në shumicën e rasteve, klinikat fillojnë ta përdorin brenda 1 dite." },
        { q: "A mund të menaxhoj më shumë se një doktor?", a: "Po. Mund të shtoni doktorë të shumtë, të menaxhoni oraret dhe performancën e secilit." },
        { q: "A përfshin faturimin dhe financat?", a: "Po. DenteOS gjeneron fatura automatike, ndjek pagesat dhe ofron raporte financiare në kohë reale." },
        { q: "Çfarë ndodh pas 7 ditëve falas?", a: "Pas provës, mund të zgjidhni të vazhdoni me një plan me pagesë. Nëse nuk vazhdoni, nuk ka asnjë detyrim." },
        { q: "A ofroni suport?", a: "Po. Ofrojmë suport të shpejtë dhe të dedikuar për çdo problem apo pyetje që mund të keni." },
        { q: "A është i përshtatshëm për klinika të vogla?", a: "Po. DenteOS është i përshtatshëm si për klinika të vogla ashtu edhe për klinika të mëdha." },
      ],
    },
    trial: {
      badge: "✦ Prova Falas",
      title: "Provoje falas për 7 ditë",
      subtitle: "Regjistrohu në më pak se 2 minuta. Pa kosto, pa surpriza.",
      button: "Fillo Provën Falas",
    },
    footer: {
      desc: "Platforma e kompletuar për menaxhimin e klinikave dentare.",
      contact: "Kontakti",
      links: "Lidhje",
      rights: "Të gjitha të drejtat e rezervuara.",
    },
  },
  en: {
    nav: { features: "Features", functions: "Functions", clinic: "Clinic", faq: "FAQ", login: "Login", tryFree: "Try Free" },
    hero: {
      title1: "Managing your clinic",
      title2: "has never been",
      title3: "this easy.",
      subtitle: "Leads, patients, doctors, appointments, treatments, invoices, finance and stock — all in one platform. DenteOS.",
    },
    features: {
      badge: "✦ Features",
      title: "Everything you need,",
      titleHighlight: "in one place.",
      dashboard: "Control Panel",
      dashboardDesc: "Key clinic KPIs: active patients, today's appointments, revenue and stock — all live in a centralized view.",
      patients: "Patient Management",
      patientsDesc: "Full profile for every patient: dental history, treatment plans, invoices, documents and communication — with one click.",
      calendar: "Appointment Calendar",
      calendarDesc: "Drag & drop appointment scheduling by doctor. View availability and manage schedules in real time.",
      reports: "Reports & Analytics",
      reportsDesc: "Financial reports, popular treatments, doctor performance and clinic trends — all in clean charts.",
      moreTitle: "...and many",
      moreHighlight: "more features",
      leads: "Leads",
      leadsDesc: "Track potential patients, manage their status and convert every contact into an active patient.",
      dentists: "Doctors",
      dentistsDesc: "Add and manage doctors, their specialties and schedules. Every doctor has their own full profile.",
      invoices: "Invoices",
      invoicesDesc: "Generate professional invoices for every treatment, track payments and export financial reports.",
      finance: "Finance",
      financeDesc: "Monitor clinic revenue, expenses and cash flow with interactive charts.",
      stock: "Product Stock",
      stockDesc: "Manage dental material inventory, set minimum thresholds and track consumption.",
      treatments: "Treatments",
      treatmentsDesc: "Create phased treatment plans for each patient, assign the responsible doctor and document every procedure.",
    },
    modern: {
      badge: "✦ Modern Clinic",
      title: "Built for today's clinic",
      desc: "DenteOS covers every aspect of management: from reception to doctor, from invoice to stock. One system for the entire team.",
      points: [
        "Complete patient and dental history management",
        "Smart calendar with scheduling by doctor",
        "Automatic invoices and financial reports",
        "Stock and dental material control",
        "Security and automatic data backup",
      ],
    },
    faq: {
      badge: "✦ Frequently Asked Questions",
      title: "Frequently Asked Questions",
      items: [
        { q: "Can I try DenteOS for free?", a: "Yes. DenteOS offers a 7-day free trial with no obligation. You can test all features and see if it fits your clinic." },
        { q: "Is it hard to use?", a: "No. DenteOS is built to be simple and intuitive. Your staff can use it from day one without complex training." },
        { q: "Is the system secure?", a: "Yes. All data is stored with high security standards and automatic backup, so you don't risk losing information." },
        { q: "Can I use it from my phone?", a: "Yes. DenteOS works on desktop, tablet and mobile, so you can manage your clinic from anywhere." },
        { q: "How long does implementation take?", a: "Very quickly. In most cases, clinics start using it within 1 day." },
        { q: "Can I manage more than one doctor?", a: "Yes. You can add multiple doctors, manage their schedules and track each one's performance." },
        { q: "Does it include billing and finance?", a: "Yes. DenteOS generates automatic invoices, tracks payments and provides real-time financial reports." },
        { q: "What happens after the 7-day free trial?", a: "After the trial, you can choose to continue with a paid plan. If you don't continue, there's no obligation." },
        { q: "Do you offer support?", a: "Yes. We provide fast and dedicated support for any issue or question you may have." },
        { q: "Is it suitable for small clinics?", a: "Yes. DenteOS is suitable for both small and large clinics." },
      ],
    },
    trial: {
      badge: "✦ Free Trial",
      title: "Try it free for 7 days",
      subtitle: "Sign up in less than 2 minutes. No costs, no surprises.",
      button: "Start Free Trial",
    },
    footer: {
      desc: "The complete platform for dental clinic management.",
      contact: "Contact",
      links: "Links",
      rights: "All rights reserved.",
    },
  },
  it: {
    nav: { features: "Funzionalità", functions: "Funzioni", clinic: "Clinica", faq: "Domande Frequenti", login: "Accedi", tryFree: "Prova Gratis" },
    hero: {
      title1: "La gestione della tua clinica",
      title2: "non è mai stata",
      title3: "così semplice.",
      subtitle: "Lead, pazienti, dottori, appuntamenti, trattamenti, fatture, finanza e magazzino — tutto in un'unica piattaforma. DenteOS.",
    },
    features: {
      badge: "✦ Funzionalità",
      title: "Tutto ciò che serve,",
      titleHighlight: "in un posto.",
      dashboard: "Pannello di Controllo",
      dashboardDesc: "KPI principali della clinica: pazienti attivi, appuntamenti oggi, entrate e magazzino — tutto live in una vista centralizzata.",
      patients: "Gestione Pazienti",
      patientsDesc: "Profilo completo per ogni paziente: storia dentale, piani di trattamento, fatture, documenti e comunicazione — con un clic.",
      calendar: "Calendario Appuntamenti",
      calendarDesc: "Pianificazione drag & drop per dottore. Visualizza disponibilità e gestisci orari in tempo reale.",
      reports: "Report & Analisi",
      reportsDesc: "Report finanziari, trattamenti popolari, performance dei dottori e tendenze — tutto in grafici chiari.",
      moreTitle: "...e molte",
      moreHighlight: "funzioni aggiuntive",
      leads: "Lead",
      leadsDesc: "Tieni traccia dei potenziali pazienti, gestisci il loro stato e converti ogni contatto in paziente attivo.",
      dentists: "Dottori",
      dentistsDesc: "Aggiungi e gestisci dottori, specialità e orari. Ogni dottore ha il proprio profilo completo.",
      invoices: "Fatture",
      invoicesDesc: "Genera fatture professionali per ogni trattamento, monitora i pagamenti ed esporta report finanziari.",
      finance: "Finanza",
      financeDesc: "Monitora entrate, spese e flusso di cassa della clinica con grafici interattivi.",
      stock: "Magazzino Prodotti",
      stockDesc: "Gestisci l'inventario dei materiali dentali, imposta soglie minime e monitora il consumo.",
      treatments: "Trattamenti",
      treatmentsDesc: "Crea piani di trattamento a fasi per ogni paziente, assegna il dottore responsabile e documenta ogni procedura.",
    },
    modern: {
      badge: "✦ Clinica Moderna",
      title: "Costruito per la clinica di oggi",
      desc: "DenteOS copre ogni aspetto della gestione: dalla reception al dottore, dalla fattura al magazzino. Un sistema unico per tutto il team.",
      points: [
        "Gestione completa dei pazienti e della storia dentale",
        "Calendario intelligente con pianificazione per dottore",
        "Fatture e report finanziari automatici",
        "Controllo del magazzino e dei materiali dentali",
        "Sicurezza e backup automatico dei dati",
      ],
    },
    faq: {
      badge: "✦ Domande Frequenti",
      title: "Domande Frequenti",
      items: [
        { q: "Posso provare DenteOS gratuitamente?", a: "Sì. DenteOS offre 7 giorni di prova gratuita senza alcun obbligo. Puoi testare tutte le funzioni e vedere se è adatto alla tua clinica." },
        { q: "È difficile da usare?", a: "No. DenteOS è costruito per essere semplice e intuitivo. Il tuo staff può usarlo dal primo giorno senza formazione complessa." },
        { q: "Il sistema è sicuro?", a: "Sì. Tutti i dati sono archiviati con elevati standard di sicurezza e backup automatico, quindi non rischi di perdere informazioni." },
        { q: "Posso usarlo dal telefono?", a: "Sì. DenteOS funziona su desktop, tablet e mobile, quindi puoi gestire la clinica da qualsiasi luogo." },
        { q: "Quanto tempo richiede l'implementazione?", a: "Molto rapidamente. Nella maggior parte dei casi, le cliniche iniziano a usarlo entro 1 giorno." },
        { q: "Posso gestire più di un dottore?", a: "Sì. Puoi aggiungere più dottori, gestire i loro orari e monitorare le performance di ciascuno." },
        { q: "Include fatturazione e finanza?", a: "Sì. DenteOS genera fatture automatiche, traccia i pagamenti e fornisce report finanziari in tempo reale." },
        { q: "Cosa succede dopo i 7 giorni gratuiti?", a: "Dopo la prova, puoi scegliere di continuare con un piano a pagamento. Se non continui, non c'è alcun obbligo." },
        { q: "Offrite supporto?", a: "Sì. Offriamo supporto rapido e dedicato per qualsiasi problema o domanda tu possa avere." },
        { q: "È adatto alle cliniche piccole?", a: "Sì. DenteOS è adatto sia alle cliniche piccole che a quelle grandi." },
      ],
    },
    trial: {
      badge: "✦ Prova Gratuita",
      title: "Provalo gratis per 7 giorni",
      subtitle: "Registrati in meno di 2 minuti. Nessun costo, nessuna sorpresa.",
      button: "Inizia la Prova Gratuita",
    },
    footer: {
      desc: "La piattaforma completa per la gestione delle cliniche dentali.",
      contact: "Contatto",
      links: "Link",
      rights: "Tutti i diritti riservati.",
    },
  },
} as const;

type Translations = {
  nav: { features: string; functions: string; clinic: string; faq: string; login: string; tryFree: string };
  hero: { title1: string; title2: string; title3: string; subtitle: string };
  features: {
    badge: string; title: string; titleHighlight: string;
    dashboard: string; dashboardDesc: string; patients: string; patientsDesc: string;
    calendar: string; calendarDesc: string; reports: string; reportsDesc: string;
    moreTitle: string; moreHighlight: string;
    leads: string; leadsDesc: string; dentists: string; dentistsDesc: string;
    invoices: string; invoicesDesc: string; finance: string; financeDesc: string;
    stock: string; stockDesc: string; treatments: string; treatmentsDesc: string;
  };
  modern: { badge: string; title: string; desc: string; points: readonly string[] };
  faq: { badge: string; title: string; items: readonly { q: string; a: string }[] };
  trial: { badge: string; title: string; subtitle: string; button: string };
  footer: { desc: string; contact: string; links: string; rights: string };
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "sq",
  setLang: () => {},
  t: translations.sq,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("denteos-lang");
    return (saved === "sq" || saved === "en" || saved === "it") ? saved : "sq";
  });
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("denteos-lang", l);
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export type { Lang };
