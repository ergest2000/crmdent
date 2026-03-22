import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay } from "date-fns";
import { sq } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type DateFilterPreset = "today" | "week" | "month" | "year" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export function getPresetRange(preset: Exclude<DateFilterPreset, "custom">): DateRange {
  const now = new Date();
  switch (preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "week":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) };
    case "month":
      return { from: startOfMonth(now), to: endOfDay(now) };
    case "year":
      return { from: startOfYear(now), to: endOfDay(now) };
  }
}

const presets: { label: string; value: DateFilterPreset }[] = [
  { label: "Sot", value: "today" },
  { label: "Javë", value: "week" },
  { label: "Muaj", value: "month" },
  { label: "Vit", value: "year" },
  { label: "Zgjidh", value: "custom" },
];

/** Compact inline date filter for use inside card headers */
export function useCardDateFilter(defaultPreset: DateFilterPreset = "month") {
  const [preset, setPreset] = useState<DateFilterPreset>(defaultPreset);
  const [dateRange, setDateRange] = useState<DateRange>(
    defaultPreset === "custom"
      ? getPresetRange("month")
      : getPresetRange(defaultPreset as Exclude<DateFilterPreset, "custom">)
  );

  const change = (p: DateFilterPreset, range: DateRange) => {
    setPreset(p);
    setDateRange(range);
  };

  return { preset, dateRange, change };
}

interface CardDateFilterProps {
  value: DateFilterPreset;
  dateRange: DateRange;
  onChange: (preset: DateFilterPreset, range: DateRange) => void;
}

export function CardDateFilter({ value, dateRange, onChange }: CardDateFilterProps) {
  const [customFrom, setCustomFrom] = useState<Date | undefined>(dateRange.from);
  const [customTo, setCustomTo] = useState<Date | undefined>(dateRange.to);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handlePreset = (p: DateFilterPreset) => {
    if (p === "custom") {
      setPopoverOpen(true);
      return;
    }
    onChange(p, getPresetRange(p));
  };

  const applyCustom = () => {
    if (customFrom && customTo) {
      onChange("custom", { from: startOfDay(customFrom), to: endOfDay(customTo) });
      setPopoverOpen(false);
    }
  };

  const customLabel =
    value === "custom"
      ? `${format(dateRange.from, "dd MMM", { locale: sq })} – ${format(dateRange.to, "dd MMM", { locale: sq })}`
      : null;

  return (
    <div className="flex items-center gap-0.5">
      {presets.map((p) =>
        p.value === "custom" ? (
          <Popover key={p.value} open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5",
                  value === "custom"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <CalendarIcon className="h-2.5 w-2.5" />
                {customLabel || p.label}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" side="bottom">
              <div className="p-3 space-y-3">
                <p className="text-xs font-medium text-foreground">Zgjidhni periudhën</p>
                <div className="flex gap-2">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Nga</p>
                    <Calendar
                      mode="single"
                      selected={customFrom}
                      onSelect={setCustomFrom}
                      className={cn("p-2 pointer-events-auto")}
                      initialFocus
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">Deri</p>
                    <Calendar
                      mode="single"
                      selected={customTo}
                      onSelect={setCustomTo}
                      disabled={(date) => (customFrom ? date < customFrom : false)}
                      className={cn("p-2 pointer-events-auto")}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setPopoverOpen(false)}>
                    Anulo
                  </Button>
                  <Button size="sm" className="text-xs h-7" onClick={applyCustom} disabled={!customFrom || !customTo}>
                    Apliko
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value)}
            className={cn(
              "text-[10px] px-1.5 py-0.5 rounded transition-colors",
              value === p.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {p.label}
          </button>
        )
      )}
    </div>
  );
}
