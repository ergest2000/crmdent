import { useEffect, useState } from "react";

const PRIMARY = "#0EA5E9";
const PRIMARY_LIGHT = "#E0F2FE";
const PRIMARY_MID = "#38BDF8";
const PRIMARY_DARK = "#0369A1";
const BG = "rgba(224,242,254,0.5)";
const BORDER = "rgba(14,165,233,0.18)";
const TEXT = "#0F172A";
const TEXT_MUTED = "#64748B";
const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";
const AMBER = "#D97706";
const AMBER_LIGHT = "#FEF3C7";
const RED = "#DC2626";
const RED_LIGHT = "#FEE2E2";

const ProfileAvatar = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="19" cy="19" r="19" fill={PRIMARY_LIGHT} />
    <circle cx="19" cy="19" r="18.5" stroke={PRIMARY_MID} strokeWidth="1" />
    <circle cx="19" cy="15" r="5.5" fill={PRIMARY_MID} />
    <path d="M7 33c0-6.627 5.373-10 12-10s12 3.373 12 10" fill={PRIMARY_MID} />
  </svg>
);

const SECTIONS = [
  {
    id: "historiku",
    label: "Historiku",
    render: () => (
      <div style={{ animation: "pcFadeUp 0.4s ease both" }}>
        {[
          { date: "08 Prill 2026", desc: "Pastrim & kontroll rutinor", doctor: "Dr. Hoxha", color: GREEN, colorLight: GREEN_LIGHT, delay: 0 },
          { date: "12 Janar 2026", desc: "Plombë dhëmb 14", doctor: "Dr. Hoxha", color: PRIMARY, colorLight: PRIMARY_LIGHT, delay: 0.1 },
          { date: "05 Tet 2025", desc: "Kontroll 6-mujor", doctor: "Dr. Hoxha", color: GREEN, colorLight: GREEN_LIGHT, delay: 0.2 },
          { date: "20 Qer 2025", desc: "Pastrim tartari", doctor: "Dr. Hoxha", color: GREEN, colorLight: GREEN_LIGHT, delay: 0.3 },
        ].map((v, i, arr) => (
          <div key={v.date} style={{
            display: "flex", gap: 10, marginBottom: i === arr.length - 1 ? 0 : 11,
            animation: `pcFadeUp 0.3s ${v.delay}s ease both`, opacity: 0, animationFillMode: "forwards",
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: v.color, marginTop: 3, flexShrink: 0 }} />
              {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 3 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: i < arr.length - 1 ? 4 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: TEXT }}>{v.desc}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 3, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: TEXT_MUTED }}>{v.date}</span>
                <span style={{ width: 2, height: 2, borderRadius: "50%", background: TEXT_MUTED, display: "inline-block" }} />
                <span style={{ fontSize: 10, color: TEXT_MUTED }}>{v.doctor}</span>
              </div>
            </div>
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 20, height: "fit-content",
              background: v.colorLight, color: v.color, fontWeight: 500, flexShrink: 0,
            }}>Kryer</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "trajtimet",
    label: "Trajtimet",
    render: () => (
      <div style={{ animation: "pcFadeUp 0.4s ease both" }}>
        {[
          { label: "Pastrimi i tartarit", status: "Kryer", t: "done", delay: 0 },
          { label: "Plombë dhëmb 14", status: "Radhë e ardhshme", t: "next", delay: 0.1 },
          { label: "Rrënjë kanali", status: "Planifikuar", t: "plan", delay: 0.2 },
          { label: "Korona qeramike", status: "Planifikuar", t: "plan", delay: 0.3 },
        ].map((p) => (
          <div key={p.label} style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 11,
            animation: `pcFadeUp 0.3s ${p.delay}s ease both`, opacity: 0, animationFillMode: "forwards",
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
              background: p.t === "done" ? GREEN_LIGHT : p.t === "next" ? AMBER_LIGHT : PRIMARY_LIGHT,
            }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke={p.t === "done" ? GREEN : p.t === "next" ? AMBER : PRIMARY} strokeWidth="1.4" />
                <path d="M4.5 6.5l1.5 1.5L8.5 5" stroke={p.t === "done" ? GREEN : p.t === "next" ? AMBER : PRIMARY} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontSize: 12, flex: 1, color: TEXT }}>{p.label}</span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500,
              ...(p.t === "done" ? { background: GREEN_LIGHT, color: GREEN }
                : p.t === "next" ? { background: AMBER_LIGHT, color: AMBER }
                : { background: PRIMARY_LIGHT, color: PRIMARY_DARK }),
            }}>{p.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "faturat",
    label: "Faturat",
    render: () => (
      <div style={{ animation: "pcFadeUp 0.4s ease both" }}>
        {[
          { name: "Pastrim & kontroll", date: "12 Mar 2026", amount: "3,500 ALL", paid: true, delay: 0 },
          { name: "Plombë kompozite", date: "28 Jan 2026", amount: "5,000 ALL", paid: true, delay: 0.1 },
          { name: "Radiografi panoramike", date: "05 Jan 2026", amount: "2,000 ALL", paid: true, delay: 0.2 },
          { name: "Korona qeramike", date: "—", amount: "18,000 ALL", paid: false, delay: 0.3 },
        ].map((inv) => (
          <div key={inv.name} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 0", borderBottom: `0.5px solid ${BORDER}`,
            animation: `pcFadeUp 0.3s ${inv.delay}s ease both`, opacity: 0, animationFillMode: "forwards",
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: TEXT }}>{inv.name}</div>
              <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 1 }}>{inv.date}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: inv.paid ? GREEN : RED }}>{inv.amount}</div>
              <div style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 10, marginTop: 2, display: "inline-block",
                background: inv.paid ? GREEN_LIGHT : RED_LIGHT,
                color: inv.paid ? GREEN : RED,
              }}>{inv.paid ? "Paguar" : "Pa paguar"}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "dokumentet",
    label: "Dokumentet",
    render: () => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, animation: "pcFadeUp 0.4s ease both" }}>
        {[
          { name: "Radiografi panoramike", size: "2.4 MB", bg: PRIMARY_LIGHT, ic: PRIMARY, delay: 0 },
          { name: "Plan trajtimi 2026", size: "148 KB", bg: "#EDE9FE", ic: "#7C3AED", delay: 0.08 },
          { name: "Formulari i pranimit", size: "96 KB", bg: GREEN_LIGHT, ic: GREEN, delay: 0.14 },
          { name: "Raport i analizave", size: "312 KB", bg: AMBER_LIGHT, ic: AMBER, delay: 0.2 },
        ].map((d) => (
          <div key={d.name} style={{
            background: BG, borderRadius: 8, padding: "9px 11px",
            border: `0.5px solid ${BORDER}`,
            animation: `pcFadeUp 0.3s ${d.delay}s ease both`, opacity: 0, animationFillMode: "forwards",
          }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: d.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="2" y="1" width="7.5" height="10.5" rx="1.5" stroke={d.ic} strokeWidth="1.2" />
                <path d="M3.5 4.5h5M3.5 6.5h5M3.5 8.5h3" stroke={d.ic} strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: TEXT, lineHeight: 1.3 }}>{d.name}</div>
            <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>{d.size}</div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function PatientCardAnimation() {
  const [active, setActive] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % SECTIONS.length);
      setKey((k) => k + 1);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes pcFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pcFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pcBarGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>

      <div style={{ width: "100%", padding: "4px 0", fontFamily: "inherit" }}>
        <div style={{
          background: "rgba(255,255,255,0.82)",
          borderRadius: 18,
          border: `0.5px solid ${BORDER}`,
          overflow: "hidden",
          maxWidth: 340,
          margin: "0 auto",
          boxShadow: `0 4px 24px rgba(14,165,233,0.08)`,
        }}>

          {/* Header */}
          <div style={{
            padding: "13px 15px 11px",
            borderBottom: `0.5px solid ${BORDER}`,
            display: "flex", alignItems: "center", gap: 10,
            background: `linear-gradient(135deg, rgba(224,242,254,0.6) 0%, rgba(255,255,255,0.4) 100%)`,
          }}>
            <ProfileAvatar />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Arjola Kelmendi</div>
              <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 1 }}>28 vjeç · Klinika Tiranë</div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
              background: GREEN_LIGHT, color: GREEN, border: `0.5px solid #86EFAC`,
            }}>Aktive</span>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `0.5px solid ${BORDER}`, background: "rgba(224,242,254,0.2)" }}>
            {SECTIONS.map((s, i) => (
              <div key={s.id} style={{
                flex: 1, padding: "7px 2px", fontSize: 10, textAlign: "center", cursor: "default",
                borderBottom: i === active ? `2px solid ${PRIMARY}` : "2px solid transparent",
                color: i === active ? PRIMARY : TEXT_MUTED,
                fontWeight: i === active ? 600 : 400,
                transition: "all 0.3s ease",
                background: i === active ? "rgba(224,242,254,0.5)" : "transparent",
              }}>{s.label}</div>
            ))}
          </div>

          {/* Body */}
          <div style={{ padding: "13px 15px 15px", minHeight: 168 }} key={key}>
            {SECTIONS[active].render()}
          </div>
        </div>
      </div>
    </>
  );
}
