import { useState, useRef } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Cloud, CalendarCheck, FileCheck, Shield, ArrowLeftRight } from "lucide-react";

const icons = [CalendarCheck, FileCheck, Cloud, ArrowLeftRight, Shield];

const ModernClinicSection = () => {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const ActiveIcon = icons[active];
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDotClick = (i: number) => {
    setActive(i);
    const el = scrollRef.current;
    if (!el) return;
    const itemWidth = el.scrollWidth / t.modern.points.length;
    el.scrollTo({ left: itemWidth * i, behavior: "smooth" });
  };

  return (
    <section id="modern" className="py-20 md:py-24 section-gradient-alt">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 rounded-full glass-badge px-4 py-1.5 text-xs font-medium text-primary mb-6">
            {t.modern.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground font-heading">
            {t.modern.title}
          </h2>
          <p className="mt-4 sm:mt-6 text-muted-foreground text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            {t.modern.desc}
          </p>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:grid mx-auto max-w-5xl grid-cols-[1fr_1.4fr] gap-6 items-start">
          {/* Left - Feature list */}
          <div className="flex flex-col gap-2">
            {t.modern.points.map((text, i) => {
              const Icon = icons[i];
              const isActive = active === i;
              return (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`flex flex-col items-start gap-2 rounded-xl px-5 py-4 text-left transition-all duration-200 ${
                    isActive ? "glass" : "border border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
                    <span className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                      {text}
                    </span>
                  </div>
                  {isActive && (
                    <>
                      <p className="text-sm text-muted-foreground font-light mt-1 pl-[30px]">
                        {t.modern.desc.split(".")[0]}.
                      </p>
                      <div className="mt-2 ml-[30px] h-0.5 w-10 rounded-full bg-primary" />
                    </>
                  )}
                </button>
              );
            })}
          </div>
          {/* Right - Feature preview card */}
          <div className="glass rounded-2xl p-1 shadow-xl shadow-primary/5">
            <div className="rounded-xl bg-gradient-to-br from-card to-secondary border border-border p-8 min-h-[340px] flex flex-col items-center justify-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <ActiveIcon size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {t.modern.points[active]}
              </h3>
              <p className="text-sm text-muted-foreground font-light max-w-sm leading-relaxed">
                {t.modern.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile carousel */}
        <div className="lg:hidden mx-auto max-w-5xl">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-6 px-6"
            onScroll={() => {
              const el = scrollRef.current;
              if (!el) return;
              const itemWidth = el.scrollWidth / t.modern.points.length;
              setActive(Math.round(el.scrollLeft / itemWidth));
            }}
          >
            {t.modern.points.map((text, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={i}
                  className="glass flex-shrink-0 w-[80vw] max-w-[320px] snap-center rounded-2xl p-6 flex flex-col items-center text-center gap-4"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Icon size={26} className="text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{text}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">
                    {t.modern.desc.split(".")[0]}.
                  </p>
                  <div className="h-0.5 w-10 rounded-full bg-primary/40" />
                </div>
              );
            })}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {t.modern.points.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "w-6 bg-primary" : "w-1.5 bg-primary/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernClinicSection;
