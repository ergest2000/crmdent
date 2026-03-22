import { type ToothCondition, type ToothSurface } from "@/stores/patient-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const conditionFills: Record<ToothCondition, string> = {
  healthy: "none",
  caries: "#ef4444",
  filling: "#3b82f6",
  crown: "#f97316",
  implant: "#a855f7",
  "root-canal": "#dc2626",
  extraction: "#9ca3af",
  "in-treatment": "#eab308",
};

const conditionLabels: Record<ToothCondition, string> = {
  healthy: "I shëndetshëm",
  caries: "Karies",
  filling: "Mbushje",
  crown: "Kurorë",
  implant: "Implant",
  "root-canal": "Kanal",
  extraction: "I hequr",
  "in-treatment": "Në trajtim",
};

export { conditionFills as conditionColors, conditionLabels };

// ── ViewBox: 40 wide × 70 tall (crown top ~30, root bottom ~40) ──
// Upper teeth: crown at top, roots going down
// The chart rotates them so roots point toward center of arch

type ToothType = "molar3" | "molar2" | "molar1" | "premolar2" | "premolar1" | "canine" | "lateral" | "central";

function getToothType(num: number): ToothType {
  const n = num % 10;
  if (n === 8) return "molar3";
  if (n === 7) return "molar2";
  if (n === 6) return "molar1";
  if (n === 5) return "premolar2";
  if (n === 4) return "premolar1";
  if (n === 3) return "canine";
  if (n === 2) return "lateral";
  return "central";
}

function isLowerTooth(num: number): boolean {
  const q = Math.floor(num / 10);
  return q === 3 || q === 4;
}

// Crown outlines (top portion 0-30 of viewBox)
const crownPaths: Record<ToothType, string> = {
  molar3:
    "M6,28 C4,24 5,18 6,14 C7,10 9,6 12,4 C14,2 17,1 20,1 C23,1 26,2 28,4 C31,6 33,10 34,14 C35,18 36,24 34,28 C32,30 28,31 20,31 C12,31 8,30 6,28 Z",
  molar2:
    "M5,28 C3,24 4,17 5,13 C6,9 8,5 11,3 C13,1 17,0 20,0 C23,0 27,1 29,3 C32,5 34,9 35,13 C36,17 37,24 35,28 C33,31 27,32 20,32 C13,32 7,31 5,28 Z",
  molar1:
    "M5,28 C3,23 4,16 6,12 C7,8 9,4 12,2 C14,0 17,0 20,0 C23,0 26,0 28,2 C31,4 33,8 34,12 C36,16 37,23 35,28 C33,31 27,32 20,32 C13,32 7,31 5,28 Z",
  premolar2:
    "M9,28 C7,24 8,18 9,14 C10,10 12,6 14,4 C16,2 18,1 20,1 C22,1 24,2 26,4 C28,6 30,10 31,14 C32,18 33,24 31,28 C29,30 25,31 20,31 C15,31 11,30 9,28 Z",
  premolar1:
    "M10,28 C8,24 9,18 10,14 C11,10 13,6 15,4 C17,2 18,1 20,1 C22,1 23,2 25,4 C27,6 29,10 30,14 C31,18 32,24 30,28 C28,30 25,31 20,31 C15,31 12,30 10,28 Z",
  canine:
    "M12,28 C10,24 11,18 12,14 C13,10 15,5 17,3 C18,1 19,0 20,0 C21,0 22,1 23,3 C25,5 27,10 28,14 C29,18 30,24 28,28 C26,30 24,31 20,31 C16,31 14,30 12,28 Z",
  lateral:
    "M13,28 C11,24 12,18 13,14 C14,10 15,6 17,4 C18,2 19,1 20,1 C21,1 22,2 23,4 C25,6 26,10 27,14 C28,18 29,24 27,28 C25,30 23,31 20,31 C17,31 15,30 13,28 Z",
  central:
    "M12,28 C10,24 11,18 12,14 C13,9 15,5 17,3 C18,1 19,0 20,0 C21,0 22,1 23,3 C25,5 27,9 28,14 C29,18 30,24 28,28 C26,30 24,31 20,31 C16,31 14,30 12,28 Z",
};

// Root paths (below crown, y=30 to y=68)
const rootPaths: Record<ToothType, string[]> = {
  molar3: [
    // 3 roots: mesial-buccal, distal-buccal, palatal
    "M10,30 C10,28 9,28 9,30 L8,42 C7,48 8,54 10,58 C11,60 12,62 13,60 C14,58 14,52 13,46 L12,38 Z",
    "M28,30 C28,28 29,28 29,30 L30,42 C31,48 32,54 30,58 C29,60 28,62 27,60 C26,58 26,52 27,46 L28,38 Z",
    "M18,30 L17,40 C16,46 17,54 19,60 C19.5,62 20.5,62 21,60 C23,54 24,46 23,40 L22,30 Z",
  ],
  molar2: [
    "M9,30 L8,40 C7,46 7,52 9,58 C10,60 11,62 12,60 C13,56 13,50 12,44 L11,36 Z",
    "M29,30 L30,40 C31,46 31,52 29,58 C28,60 27,62 26,60 C25,56 25,50 26,44 L27,36 Z",
    "M18,30 L17,38 C16,44 17,52 19,58 C19.5,60 20.5,60 21,58 C23,52 24,44 23,38 L22,30 Z",
  ],
  molar1: [
    "M9,30 L8,38 C7,44 7,52 9,60 C10,63 11,65 12,62 C13,58 13,50 12,44 L11,36 Z",
    "M29,30 L30,38 C31,44 31,52 29,60 C28,63 27,65 26,62 C25,58 25,50 26,44 L27,36 Z",
    "M18,30 L17,36 C16,42 17,52 19,60 C19.5,62 20.5,62 21,60 C23,52 24,42 23,36 L22,30 Z",
  ],
  premolar2: [
    // 2 roots
    "M15,30 L14,38 C13,44 13,52 15,58 C16,60 17,61 18,58 C19,54 18,46 17,40 L16,34 Z",
    "M25,30 L26,38 C27,44 27,52 25,58 C24,60 23,61 22,58 C21,54 22,46 23,40 L24,34 Z",
  ],
  premolar1: [
    // Single root
    "M16,30 L15,38 C14,46 15,56 18,62 C19,64 21,64 22,62 C25,56 26,46 25,38 L24,30 Z",
  ],
  canine: [
    // Single long root
    "M16,30 L15,38 C14,46 14,56 17,64 C18,67 19,68 20,68 C21,68 22,67 23,64 C26,56 26,46 25,38 L24,30 Z",
  ],
  lateral: [
    // Single root
    "M17,30 L16,38 C15,44 15,52 18,60 C19,62 20,63 20,63 C20,63 21,62 22,60 C25,52 25,44 24,38 L23,30 Z",
  ],
  central: [
    // Single root
    "M16,30 L15,36 C14,44 14,52 17,60 C18,63 19,64 20,64 C21,64 22,63 23,60 C26,52 26,44 25,36 L24,30 Z",
  ],
};

// Fissure/groove lines on the crown
const crownFissures: Record<ToothType, string> = {
  molar3: "M11,14 C13,18 16,16 20,20 C24,16 27,18 29,14 M20,20 L20,26",
  molar2: "M10,12 C13,17 16,14 20,18 C24,14 27,17 30,12 M20,18 L20,26",
  molar1: "M10,10 C13,15 16,12 20,16 C24,12 27,15 30,10 M20,16 L20,26",
  premolar2: "M13,12 C15,16 18,14 20,18 C22,14 25,16 27,12",
  premolar1: "M14,12 C16,16 18,14 20,18 C22,14 24,16 26,12",
  canine: "",
  lateral: "M17,14 C18,18 20,16 20,20 C20,16 22,18 23,14",
  central: "M17,14 C18,18 20,16 20,20 C20,16 22,18 23,14",
};

// Surface hit zones (within crown area 0-31)
const surfaceZones: { surface: ToothSurface; path: string }[] = [
  { surface: "occlusal", path: "M14,10 L26,10 L26,24 L14,24 Z" },
  { surface: "buccal", path: "M4,0 L36,0 L26,10 L14,10 Z" },
  { surface: "lingual", path: "M4,32 L36,32 L26,24 L14,24 Z" },
  { surface: "mesial", path: "M0,0 L14,10 L14,24 L0,32 Z" },
  { surface: "distal", path: "M40,0 L26,10 L26,24 L40,32 Z" },
];

interface Props {
  toothNumber: number;
  primaryCondition: ToothCondition;
  getSurfaceCondition: (surface: ToothSurface) => ToothCondition;
  isSelected: boolean;
  selectedSurface: ToothSurface | null;
  onClick: () => void;
  onSurfaceClick: (surface: ToothSurface) => void;
  hasRecords: boolean;
}

export function ToothSVG({
  toothNumber,
  primaryCondition,
  getSurfaceCondition,
  isSelected,
  selectedSurface,
  onClick,
  onSurfaceClick,
  hasRecords,
}: Props) {
  const toothType = getToothType(toothNumber);
  const lower = isLowerTooth(toothNumber);
  const crown = crownPaths[toothType];
  const roots = rootPaths[toothType];
  const fissure = crownFissures[toothType];

  const isHealthy = primaryCondition === "healthy";
  const fillColor = isHealthy ? "#f0f4f8" : conditionFills[primaryCondition] + "30";
  const rootFill = "#f5f5f5";
  const strokeColor = isSelected ? "#6366f1" : "#b0b8c9";
  const strokeW = isSelected ? 1.8 : 1;

  const tooltipText = isHealthy
    ? `#${toothNumber} — I shëndetshëm`
    : `#${toothNumber} — ${conditionLabels[primaryCondition]}`;

  // For lower teeth, flip vertically so roots point down
  const flipTransform = lower ? "scale(1,-1) translate(0,-70)" : "";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <g
          className="cursor-pointer"
          onClick={onClick}
          style={{ transition: "opacity 150ms" }}
        >
          <g transform={flipTransform}>
            {/* Roots (behind crown) */}
            {roots.map((rp, i) => (
              <path
                key={i}
                d={rp}
                fill={rootFill}
                stroke={strokeColor}
                strokeWidth={strokeW * 0.8}
                strokeLinejoin="round"
              />
            ))}

            {/* Selection glow */}
            {isSelected && (
              <path
                d={crown}
                fill="#6366f118"
                stroke="#6366f1"
                strokeWidth={3}
                strokeOpacity={0.35}
              />
            )}

            {/* Crown body */}
            <path
              d={crown}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />

            {/* Condition fill overlay on crown */}
            {!isHealthy && (
              <path
                d={crown}
                fill={conditionFills[primaryCondition]}
                fillOpacity={0.2}
                stroke="none"
              />
            )}

            {/* Fissure/groove lines */}
            {fissure && (
              <path
                d={fissure}
                fill="none"
                stroke={isHealthy ? "#9ca3af" : strokeColor}
                strokeWidth={0.7}
                strokeLinecap="round"
                strokeOpacity={0.45}
              />
            )}

            {/* Surface click zones (clipped to crown) */}
            <defs>
              <clipPath id={`crown-clip-${toothNumber}`}>
                <path d={crown} />
              </clipPath>
            </defs>
            <g clipPath={`url(#crown-clip-${toothNumber})`}>
              {surfaceZones.map(({ surface, path }) => {
                const cond = getSurfaceCondition(surface);
                const isSel = selectedSurface === surface;
                const hasCond = cond !== "healthy";
                return (
                  <path
                    key={surface}
                    d={path}
                    fill={hasCond ? conditionFills[cond] : "transparent"}
                    fillOpacity={hasCond ? 0.35 : 0}
                    stroke={isSel ? "#6366f1" : "transparent"}
                    strokeWidth={isSel ? 1.5 : 0}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSurfaceClick(surface);
                    }}
                  />
                );
              })}
            </g>
          </g>

          {/* Treatment indicator dot */}
          {hasRecords && (
            <circle
              cx={36}
              cy={lower ? 66 : 4}
              r={2.5}
              fill="#6366f1"
              stroke="#fff"
              strokeWidth={0.8}
            />
          )}
        </g>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}
