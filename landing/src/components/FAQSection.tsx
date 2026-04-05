import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus } from "lucide-react";

const FAQSection = () => {
  const { t } = useLanguage();

  return (
    <section id="faq" className="py-20 md:py-24 section-gradient">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-20 items-start max-w-6xl mx-auto">
          {/* Left side - Title */}
          <div className="lg:sticky lg:top-32">
            <span className="inline-flex items-center gap-2 rounded-full glass-badge px-4 py-1.5 text-xs font-medium text-primary mb-6">
              {t.faq.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight font-heading">
              {t.faq.title}
            </h2>
          </div>

          {/* Right side - Accordion */}
          <Accordion type="single" collapsible className="space-y-3">
            {t.faq.items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass rounded-2xl px-6 shadow-sm"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline py-5 [&>svg:last-child]:hidden">
                  {item.q}
                  <Plus className="h-5 w-5 shrink-0 text-muted-foreground ml-auto transition-transform duration-200" />
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground font-light pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
