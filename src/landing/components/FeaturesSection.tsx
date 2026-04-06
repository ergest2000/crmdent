import { useRef, useState, useEffect, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { HeartPulse, Users, CalendarDays, FileBarChart, Stethoscope, Receipt, Package, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import LottieAnimation from "./LottieAnimation";
import featDashboard from "../feat-dashboard.png";
import featPatients from "../feat-patients.png";
import featCalendar from "../feat-calendar.png";
import featReports from "../feat-reports.png";

const FeaturesSection = () => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const itemWidth = el.scrollWidth / additionalFeatures.length;
    setActiveIdx(Math.round(scrollLeft / itemWidth));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const mainFeatures = [
    { title: t.features.dashboard, desc: t.features.dashboardDesc, img: featDashboard, alt: "Dashboard", lottie: "https://assets-v2.lottiefiles.com/a/893c142c-ad89-11ee-ba6e-93f23076acee/cM5ZCXu3ed.lottie" },
    { title: t.features.patients, desc: t.features.patientsDesc, img: featPatients, alt: "Patients", lottie: "" },
    { title: t.features.calendar, desc: t.features.calendarDesc, img: featCalendar, alt: "Calendar", lottie: "https://lottie.host/2261fc2f-c0f9-4d83-9669-e4e94266cea9/rwe80Hxs8O.lottie" },
    { title: t.features.reports, desc: t.features.reportsDesc, img: featReports, alt: "Reports", lottie: "" },
  ];

  const additionalFeatures = [
    { icon: Users, title: t.features.leads, desc: t.features.leadsDesc },
    { icon: HeartPulse, title: t.features.dentists, desc: t.features.dentistsDesc },
    { icon: Receipt, title: t.features.invoices, desc: t.features.invoicesDesc },
    { icon: TrendingUp, title: t.features.finance, desc: t.features.financeDesc },
    { icon: Package, title: t.features.stock, desc: t.features.stockDesc },
    { icon: Stethoscope, title: t.features.treatments, desc: t.features.treatmentsDesc },
  ];

  return (
    <section id="features" className="py-20 md:py-24 section-gradient">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-10 md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full glass-badge px-3 py-1 text-[11px] sm:px-4 sm:py-1.5 sm:text-xs font-medium text-primary mb-4 sm:mb-6">
            {t.features.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground font-heading">
            {t.features.title}{" "}
            <span className="italic text-primary font-light" style={{ fontFamily: "'Playfair Display', serif" }}>{t.features.titleHighlight}</span>
          </h2>
        </div>

        {/* 2x2 Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {mainFeatures.map((feat) => (
            <div
              key={feat.alt}
              className="group rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between min-h-[400px] sm:min-h-[520px] overflow-hidden cursor-default transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
              style={{
                background: 'linear-gradient(135deg, hsla(199, 89%, 70%, 0.15) 0%, hsla(199, 89%, 48%, 0.08) 50%, hsla(185, 60%, 60%, 0.1) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid hsla(199, 89%, 48%, 0.18)',
                boxShadow: '0 4px 24px -4px hsla(199, 89%, 48%, 0.08)',
              }}
            >
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {feat.title}
                </h3>
                <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xs">
                  {feat.desc}
                </p>
              </div>
              <div className="mt-4 sm:mt-6 flex justify-center">
                {feat.lottie ? (
                  <div className="w-full flex-1 min-h-[280px] sm:min-h-[360px]" style={{ filter: feat.alt === "Calendar" ? "hue-rotate(170deg) saturate(3) brightness(0.95)" : "hue-rotate(200deg) saturate(1.2)" }}>
                    <LottieAnimation src={feat.lottie} style={{ width: "100%", height: "100%" }} />
                  </div>
                ) : (
                  <img
                    src={feat.img}
                    alt={feat.alt}
                    className="w-[90%] sm:w-[85%] object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional features */}
        <div id="functions" className="max-w-5xl mx-auto mt-20 sm:mt-24 md:mt-28 text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground mb-5 sm:mb-6 font-heading">
            {t.features.moreTitle}{" "}
            <span className="bg-primary/10 px-2 py-0.5 rounded-lg text-primary">{t.features.moreHighlight}</span>
          </h3>

          {/* Mobile carousel */}
          <div className="relative lg:hidden">
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4">
              {additionalFeatures.map((item) => (
                <div
                  key={item.title}
                  className="glass flex-shrink-0 w-[75%] snap-start flex items-start gap-3 rounded-xl p-4 text-left"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {additionalFeatures.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = scrollRef.current;
                    if (!el) return;
                    const itemWidth = el.scrollWidth / additionalFeatures.length;
                    el.scrollTo({ left: itemWidth * i, behavior: "smooth" });
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIdx ? "w-6 bg-primary" : "w-1.5 bg-primary/25"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-3">
            {additionalFeatures.map((item) => (
              <div
                key={item.title}
                className="glass flex items-start gap-3 rounded-xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
