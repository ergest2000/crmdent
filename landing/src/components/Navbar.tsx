import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: t.nav.features, href: "#features" },
    { label: t.nav.functions || "Funksione", href: "#functions" },
    { label: t.nav.clinic || "Klinika", href: "#modern" },
    { label: t.nav.faq || "Pyetje të Shpeshta", href: "#faq" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center px-4 pt-4">
      {/* Pill navbar */}
      <nav className={`w-full max-w-4xl rounded-full transition-all duration-300 ${
        scrolled || open
          ? "bg-card/90 backdrop-blur-xl shadow-lg shadow-foreground/5 border border-border"
          : "bg-card/70 backdrop-blur-md border border-border/50"
      }`}>
        <div className="flex h-14 items-center justify-between px-5">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground font-heading">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black font-heading">D</span>
            DenteOS
          </a>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => handleNavClick(e, l.href)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2.5">
            <LanguageSwitcher />
            <a href="/login">
              <button className="rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                {t.nav.login || "Hyr"}
              </button>
            </a>
            <a href="/login">
              <Button size="sm" className="rounded-full px-5 font-semibold shadow-md shadow-primary/15 text-xs h-8 font-heading">
                {t.nav.tryFree}
              </Button>
            </a>
          </div>

          <button className="md:hidden text-foreground p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden w-full max-w-4xl mt-2 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-xl shadow-foreground/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 flex flex-col gap-0.5">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => handleNavClick(e, l.href)} className="rounded-xl py-3 px-4 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-border/50 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-4 py-1">
              <span className="text-xs text-muted-foreground font-medium">Language</span>
              <LanguageSwitcher />
            </div>
            <a href="/login">
              <button className="w-full rounded-xl py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                {t.nav.login || "Hyr"}
              </button>
            </a>
            <a href="/login">
              <Button size="sm" className="w-full rounded-full font-semibold shadow-md shadow-primary/15 font-heading h-11 text-sm">{t.nav.tryFree}</Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
