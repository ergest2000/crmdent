import { useLanguage } from "../contexts/LanguageContext";
import dashboardImg from "../../dashboard-crm.jpg";

const HeroSection = () => {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Grid mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="42" height="42" patternUnits="userSpaceOnUse">
              <path d="M 42 0 L 42 42 L 0 42" fill="none" stroke="hsl(199 89% 48% / 0.1)" strokeWidth="1" />
              <path d="M 0 0 L 42 0 L 42 42 L 0 42 Z" fill="none" stroke="hsl(199 89% 48% / 0.1)" strokeWidth="1" />
            </pattern>
            <radialGradient id="grid-fade" cx="50%" cy="40%" r="55%" fx="50%" fy="40%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="70%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="grid-mask">
              <rect width="100%" height="100%" fill="url(#grid-fade)" />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" mask="url(#grid-mask)" />
        </svg>
      </div>
      <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-[80px] pointer-events-none" />
      <div className="absolute top-[10%] right-[-60px] w-[300px] h-[300px] rounded-full bg-primary/[0.05] blur-[80px] pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center pt-24 sm:pt-28 md:pt-36 px-4 sm:px-6">
        <h1 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-[4.2rem] font-semibold leading-[1.1] tracking-[-0.02em] text-foreground animate-fade-in font-heading">
          {t.hero.title1}<br />
          {t.hero.title2}{" "}
          <span className="italic text-primary font-light" style={{ fontFamily: "'Playfair Display', serif" }}>{t.hero.title3}</span>
        </h1>
        <p
          className="mt-5 sm:mt-6 max-w-[520px] text-center text-sm sm:text-base md:text-lg font-light text-muted-foreground leading-relaxed animate-fade-in"
          style={{ animationDelay: "0.2s", animationFillMode: "both" }}
        >
          {t.hero.subtitle}
        </p>
        <div className="mt-12 sm:mt-16 md:mt-20 mb-[-2rem] sm:mb-[-4rem] w-full max-w-5xl animate-fade-in" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
          <div className="glass rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xl shadow-primary/5">
            <div className="rounded-xl overflow-hidden border border-border bg-card">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-secondary border-b border-border">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <span className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="hidden sm:block rounded-md bg-muted px-16 py-1 text-xs text-muted-foreground">
                    app.denteos.al
                  </div>
                </div>
              </div>
              <img
                src={dashboardImg}
                alt="DenteOS Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
