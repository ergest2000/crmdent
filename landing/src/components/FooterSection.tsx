import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin } from "lucide-react";

const FooterSection = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-10">

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">{t.footer.contact}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-light">
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="text-primary" /> info@dentacrm.al
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="text-primary" /> +355 69 123 4567
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={14} className="text-primary" /> Rruga Ismail Qemali, Tiranë
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">{t.footer.links}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground font-light">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-light">
          <span>© {new Date().getFullYear()} DentaCRM. {t.footer.rights}</span>
          <span>Made with ♥ in Albania</span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
