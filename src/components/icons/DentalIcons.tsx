import type { SVGProps } from "react";

// Ikona me porosi në stilin e lucide-react (lucide 0.462.0 s'ka ikonë "Tooth").
// Përdoren si <Tooth className="h-4 w-4" /> — pra pa width/height fikse, që klasat
// Tailwind ta kontrollojnë madhësinë; stroke = currentColor për të trashëguar ngjyrën.

const TOOTH_PATH =
  "M12 5.5c-1.074 -.586 -2.583 -1.5 -4 -1.5c-2.317 0 -4 1.998 -4 4.5c0 1.858 .268 3.155 .864 4.635c.371 .921 .864 2.062 1.478 3.423c.921 2.042 1.658 3.914 2.658 3.914c.869 0 1.212 -1.442 1.5 -3c.235 -1.271 .445 -2 1.042 -2c.597 0 .807 .729 1.042 2c.288 1.558 .631 3 1.5 3c1 0 1.737 -1.872 2.658 -3.914c.614 -1.361 1.107 -2.502 1.478 -3.423c.596 -1.48 .864 -2.777 .864 -4.635c0 -2.502 -1.683 -4.5 -4 -4.5c-1.417 0 -2.926 .914 -4 1.5z";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

// Dhëmb — për "Trajtimet".
export function Tooth({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} className={className}>
      <path d={TOOTH_PATH} />
    </svg>
  );
}

// Dhëmb + pasqyrë dentari — simbol dentisti, për "Dentistë".
export function Dentist({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)} className={className}>
      <g transform="translate(-2.2 1.2) scale(0.66)">
        <path d={TOOTH_PATH} />
      </g>
      <circle cx="18" cy="6.5" r="2.6" />
      <path d="M16.3 8.5 L13 12.4" />
    </svg>
  );
}
