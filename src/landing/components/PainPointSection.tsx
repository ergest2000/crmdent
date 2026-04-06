import { Circle, CheckCircle2, Star } from "lucide-react";
import { useRef, useCallback, useEffect, useState } from "react";

const floatingPills = [
  { label: "Pa historik pacienti", gradient: "from-pink-400 to-rose-500", x: 18, y: 15, rotate: -6, duration: 3.2 },
  { label: "Faturim Manual", gradient: "from-emerald-400 to-green-500", x: 58, y: 25, rotate: 3, duration: 2.8 },
  { label: "Staf i Çorganizuar", gradient: "from-violet-400 to-blue-500", x: 8, y: 52, rotate: -3, duration: 3.6 },
  { label: "Humbje Kohe", gradient: "from-orange-400 to-amber-500", x: 52, y: 60, rotate: 6, duration: 2.5 },
  { label: "Pa kujdes pas vizitës", gradient: "from-cyan-400 to-teal-500", x: 25, y: 78, rotate: -2, duration: 4.0 },
];

const FloatingPill = ({ label, gradient, x, y, rotate, duration }: typeof floatingPills[0]) => {
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const onStart = useCallback((clientX: number, clientY: number) => {
    dragStart.current = { mx: clientX, my: clientY, px: pos.x, py: pos.y };
    setDragging(true);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
      setPos({
        x: dragStart.current.px + (clientX - dragStart.current.mx),
        y: dragStart.current.py + (clientY - dragStart.current.my),
      });
    };
    const onEnd = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [dragging]);

  return (
    <div
      onMouseDown={(e) => onStart(e.clientX, e.clientY)}
      onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY)}
      className={`absolute select-none cursor-grab active:cursor-grabbing rounded-full bg-gradient-to-r ${gradient} px-5 py-2.5 text-white text-sm font-semibold whitespace-nowrap hover:scale-105 transition-transform`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotate}deg) ${dragging ? 'scale(1.08)' : ''}`,
        boxShadow: dragging ? '0 12px 28px -4px rgba(0,0,0,0.2)' : '0 6px 16px -4px rgba(0,0,0,0.15)',
        zIndex: dragging ? 50 : 10,
        touchAction: 'none',
        animation: dragging ? 'none' : `float-${Math.round(duration * 10)} ${duration}s ease-in-out infinite`,
      }}
    >
      {label}
      <style>{`
        @keyframes float-${Math.round(duration * 10)} {
          0%, 100% { transform: translate(${pos.x}px, ${pos.y}px) rotate(${rotate}deg) translateY(0px); }
          50% { transform: translate(${pos.x}px, ${pos.y}px) rotate(${rotate}deg) translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

const PainPointSection = () => {
  const bullets = [
    { icon: Circle, title: "Të dhëna të shpërndara", desc: "Historiku i pacientëve, trajtimet dhe dokumentet janë të shpërndara. DenteOS i centralizon të gjitha në profilin e çdo pacienti." },
    { icon: CheckCircle2, title: "Faturim dhe financa manuale", desc: "Faturimi kërkon shumë kohë dhe gabimet janë të shpeshta. DenteOS gjeneron fatura dhe raportet financiare automatikisht." },
    { icon: Star, title: "Mungesë kontrolli mbi stafin dhe stokun", desc: "Stafi nuk koordinohet mirë dhe stoku i materialeve dentare nuk monitorohet. DenteOS organizon çdo gjë nga njëri modul i vetëm." },
  ];

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: "#F5F6FA" }}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-card border border-border p-6 sm:p-10 md:p-14 shadow-sm">

          <div className="mb-8 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 text-xs font-semibold">
              ✦ Problemet e Klinikave Dentare
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground font-heading">
                Klinika juaj meriton<br />
                të funksionojë pa kaos
              </h2>
              <div className="mt-8 flex flex-col gap-6">
                {bullets.map((point, i) => {
                  const Icon = point.icon;
                  return (
                    <div key={i} className="flex gap-3.5 items-start">
                      <div className="mt-0.5 flex-shrink-0">
                        <Icon size={22} className="text-primary" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{point.title}</h3>
                        <p className="text-sm text-muted-foreground font-light mt-1 leading-relaxed">{point.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-[320px] sm:min-h-[380px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50/60 to-slate-100/60 border border-border/40">
              {floatingPills.map((pill, i) => (
                <FloatingPill key={i} {...pill} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PainPointSection;
