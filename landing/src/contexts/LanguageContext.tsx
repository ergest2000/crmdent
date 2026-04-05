import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "sq" | "en" | "it";

const translations = {
  sq: {
    nav: { features: "Karakteristikat", functions: "Funksione", clinic: "Klinika", faq: "Pyetje të Shpeshta", login: "Hyr", tryFree: "Provo Falas" },
    hero: {
      title1: "Menaxhimi i klinikës tuaj",
      title2: "nuk ka qenë",
      title3: "më i lehtë.",
      subtitle: "Menaxhoni pacientët, takimet, faturat dhe trajtimet të gjitha nga një platformë e vetme e centralizuar.",
    },
    features: {
      badge: "✦ Karakteristikat",
      title: "Eksploro Funksionet",
      titleHighlight: "Kryesore",
      dashboard: "Paneli i Kontrollit",
      dashboardDesc: "Përmbledhje e qartë e të gjitha moduleve në një pamje intuitive dhe të centralizuar.",
      patients: "Menaxhimi i Pacientëve",
      patientsDesc: "Profili dhe historiku i pacientëve me një klikim të vetëm.",
      calendar: "Kalendari i Takimeve",
      calendarDesc: "Planifikim i takimeve në kohë reale me drag & drop.",
      reports: "Raporte & Analitika",
      reportsDesc: "Raporte për performancën e klinikës, në një panel të pastër dhe modern.",
      moreTitle: "...dhe më shumë",
      moreHighlight: "funksione shtesë",
      leads: "Leads",
      leadsDesc: "Gjurmo potencialët e rinj dhe menaxho kontaktet me lehtësi.",
      dentists: "Dentistët",
      dentistsDesc: "Organizim i stafit dhe përgjegjësive në mënyrë të qartë.",
      invoices: "Faturat",
      invoicesDesc: "Gjenerim dhe dërgim faturash automatik, gjithçka digital.",
      finance: "Financa",
      financeDesc: "Monitorim i të ardhurave dhe shpenzimeve në kohë reale.",
      stock: "Stoku",
      stockDesc: "Mbikëqyr inventarin e materialeve dentare me lehtësi.",
      treatments: "Trajtimet",
      treatmentsDesc: "Menaxhimi i procedurave dhe dokumentimi i trajtimeve.",
    },
    modern: {
      badge: "✦ Klinika Moderne",
      title: "Për Klinikën Moderne",
      desc: "Softuer i centralizuar për dentistët, menaxherët dhe recepsionin. Rezervime online, kalendar i zgjuar, formularë digitalë, siguri e plotë në cloud dhe migrim i thjeshtë nga sistemet ekzistuese.",
      points: [
        "Rezervime online dhe kalendar i zgjuar",
        "Formularë digitalë për pacientët",
        "Siguri e plotë në cloud",
        "Migrim i thjeshtë nga sistemet ekzistuese",
        "Mbrojtje e të dhënave sipas standardeve",
      ],
    },
    faq: {
      badge: "✦ FAQ",
      title: "Pyetje të Shpeshta",
      items: [
        { q: "A është i sigurt DentaCRM?", a: "Po, të gjitha të dhënat ruhen në cloud me enkriptim të plotë dhe backup automatik." },
        { q: "Sa kushton?", a: "Ofrojmë plane fleksibël duke filluar nga falas. Kontaktoni për çmime specifike." },
        { q: "A mund ta provoj falas?", a: "Po, ofrojmë 7 ditë provë falas pa nevojë për kartë krediti." },
        { q: "A funksionon në celular?", a: "Po, platforma është plotësisht responsive dhe funksionon në çdo pajisje." },
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
      title3: "easier.",
      subtitle: "Manage patients, appointments, invoices and treatments all from a single centralized platform.",
    },
    features: {
      badge: "✦ Features",
      title: "Explore Key",
      titleHighlight: "Features",
      dashboard: "Dashboard",
      dashboardDesc: "A clear overview of all modules in an intuitive, centralized view.",
      patients: "Patient Management",
      patientsDesc: "Patient profiles and history with a single click.",
      calendar: "Appointment Calendar",
      calendarDesc: "Real-time appointment scheduling with drag & drop.",
      reports: "Reports & Analytics",
      reportsDesc: "Clinic performance reports in a clean, modern panel.",
      moreTitle: "...and more",
      moreHighlight: "additional features",
      leads: "Leads",
      leadsDesc: "Track new prospects and manage contacts with ease.",
      dentists: "Dentists",
      dentistsDesc: "Organize staff and responsibilities clearly.",
      invoices: "Invoices",
      invoicesDesc: "Automatic invoice generation and sending, all digital.",
      finance: "Finance",
      financeDesc: "Real-time monitoring of income and expenses.",
      stock: "Stock",
      stockDesc: "Oversee dental material inventory with ease.",
      treatments: "Treatments",
      treatmentsDesc: "Procedure management and treatment documentation.",
    },
    modern: {
      badge: "✦ Modern Clinic",
      title: "For the Modern Clinic",
      desc: "Centralized software for dentists, managers and reception. Online bookings, smart calendar, digital forms, full cloud security and easy migration from existing systems.",
      points: [
        "Online bookings and smart calendar",
        "Digital forms for patients",
        "Full cloud security",
        "Easy migration from existing systems",
        "Data protection according to standards",
      ],
    },
    faq: {
      badge: "✦ FAQ",
      title: "Frequently Asked Questions",
      items: [
        { q: "Is DentaCRM secure?", a: "Yes, all data is stored in the cloud with full encryption and automatic backups." },
        { q: "How much does it cost?", a: "We offer flexible plans starting from free. Contact us for specific pricing." },
        { q: "Can I try it for free?", a: "Yes, we offer a 7-day free trial with no credit card required." },
        { q: "Does it work on mobile?", a: "Yes, the platform is fully responsive and works on any device." },
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
      title3: "più facile.",
      subtitle: "Gestisci pazienti, appuntamenti, fatture e trattamenti da un'unica piattaforma centralizzata.",
    },
    features: {
      badge: "✦ Funzionalità",
      title: "Esplora le Funzioni",
      titleHighlight: "Principali",
      dashboard: "Pannello di Controllo",
      dashboardDesc: "Panoramica chiara di tutti i moduli in una vista intuitiva e centralizzata.",
      patients: "Gestione Pazienti",
      patientsDesc: "Profilo e storico dei pazienti con un solo clic.",
      calendar: "Calendario Appuntamenti",
      calendarDesc: "Pianificazione appuntamenti in tempo reale con drag & drop.",
      reports: "Report & Analisi",
      reportsDesc: "Report sulle prestazioni della clinica in un pannello pulito e moderno.",
      moreTitle: "...e altre",
      moreHighlight: "funzionalità aggiuntive",
      leads: "Lead",
      leadsDesc: "Traccia nuovi potenziali e gestisci i contatti con facilità.",
      dentists: "Dentisti",
      dentistsDesc: "Organizzazione dello staff e delle responsabilità in modo chiaro.",
      invoices: "Fatture",
      invoicesDesc: "Generazione e invio automatico delle fatture, tutto digitale.",
      finance: "Finanza",
      financeDesc: "Monitoraggio in tempo reale di entrate e uscite.",
      stock: "Inventario",
      stockDesc: "Supervisiona l'inventario dei materiali dentali con facilità.",
      treatments: "Trattamenti",
      treatmentsDesc: "Gestione delle procedure e documentazione dei trattamenti.",
    },
    modern: {
      badge: "✦ Clinica Moderna",
      title: "Per la Clinica Moderna",
      desc: "Software centralizzato per dentisti, manager e reception. Prenotazioni online, calendario intelligente, moduli digitali, sicurezza cloud completa e migrazione semplice dai sistemi esistenti.",
      points: [
        "Prenotazioni online e calendario intelligente",
        "Moduli digitali per i pazienti",
        "Sicurezza cloud completa",
        "Migrazione semplice dai sistemi esistenti",
        "Protezione dei dati secondo gli standard",
      ],
    },
    faq: {
      badge: "✦ FAQ",
      title: "Domande Frequenti",
      items: [
        { q: "DentaCRM è sicuro?", a: "Sì, tutti i dati sono archiviati nel cloud con crittografia completa e backup automatici." },
        { q: "Quanto costa?", a: "Offriamo piani flessibili a partire da gratis. Contattaci per prezzi specifici." },
        { q: "Posso provarlo gratis?", a: "Sì, offriamo 7 giorni di prova gratuita senza carta di credito." },
        { q: "Funziona su mobile?", a: "Sì, la piattaforma è completamente responsive e funziona su qualsiasi dispositivo." },
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
    const saved = localStorage.getItem("dentacrm-lang");
    return (saved === "sq" || saved === "en" || saved === "it") ? saved : "sq";
  });
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("dentacrm-lang", l);
  };
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export type { Lang };
