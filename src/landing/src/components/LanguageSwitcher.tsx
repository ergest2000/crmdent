import { useLanguage, type Lang } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const flags: Record<Lang, string> = { sq: "🇦🇱", en: "🇬🇧", it: "🇮🇹" };
const labels: Record<Lang, string> = { sq: "SQ", en: "EN", it: "IT" };
const allLangs: Lang[] = ["sq", "en", "it"];

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (l: Lang) => {
    setLang(l);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full glass-light px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
      >
        <span>{flags[lang]}</span>
        <span>{labels[lang]}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[100px] glass rounded-xl shadow-lg py-1">
          {allLangs.filter(l => l !== lang).map(l => (
            <button
              key={l}
              onClick={() => handleSelect(l)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span>{flags[l]}</span>
              <span>{labels[l]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
