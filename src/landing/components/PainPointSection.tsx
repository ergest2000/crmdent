import { Circle, CheckCircle2, Star } from "lucide-react";
import { useRef, useCallback, useEffect, useState } from "react";

const floatingPills = [
  { label: "Dosje të Humbura", gradient: "from-pink-400 to-rose-500", startX: -120, startY: -100, rotate: -6 },
  { label: "Faturim Manual", gradient: "from-emerald-400 to-green-500", startX: 80, startY: -80, rotate: 3 },
  { label: "Staf i Çorganizuar", gradient: "from-violet-400 to-blue-500", startX: -140, startY: 40, rotate: -3 },
  { label: "Stok i Pakontrolluar", gradient: "from-orange-400 to-amber-500", startX: 100, startY: 60, rotate: 6 },
  { label: "Humbje Kohe", gradient: "from-cyan-400 to-teal-500", startX: -40, startY: 120, rotate: -2 },
];

const DraggablePill = ({ label, gradient, startX, startY, rotate }: typeof floatingPills[0]) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: startX, y: startY });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const onStart = useCallback((clientX: number, clientY: number) => {
    dragStart.current = { x: clientX, y: clientY, px: pos.x, py: pos.y };
    setDragging(true);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
      setPos({
        x: dragStart.current.px + (clientX - dragStart.current.x),
        y: dragStart.current.py + (clientY - dragStart.current.y),
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
      ref={ref}
      onMouseDown={(e) => onStart(e.clientX, e.clientY)}
      onTouchStart={(e) => onStart(e.touches[0].clientX, e.touches[0].clientY)}
      className={`absolute select-none cursor-grab active:cursor-grabbing rounded-full bg-gradient-to-r ${gradient} px-5 py-2.5 text-white text-sm font-semibold whitespace-nowrap transition-shadow duration-200`}
      style={{
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotate(${rotate}deg) ${dragging ? 'scale(1.08)' : 'scale(1)'}`,
        boxShadow: dragging ? '0 12px 28px -4px rgba(0,0,0,0.2)' : '0 6px 16px -4px rgba(0,0,0,0.12)',
        zIndex: dragging ? 50 : 10,
        touchAction: 'none',
      }}
    >
      {label}
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

          {/* Label në mes */}
          <div className="flex justify-center mb-8">
            <span className="inline-block rounded-full bg-foreground text-background px-4 py-1.5 text-xs font-semibold">
              Pain Point
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
            {/* Left side only */}
            <div className="max-w-2xl mx-auto w-full">
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
          </div>

        </div>
      </div>
    </section>
  );
};

export default PainPointSection;
