import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface Props {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  details?: string;
  onDetailsChange?: (v: string) => void;
  detailsPlaceholder?: string;
}

export function YesNoField({ label, checked, onCheckedChange, details, onDetailsChange, detailsPlaceholder }: Props) {
  return (
    <div className="space-y-2 rounded-lg border p-3 bg-card">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm font-normal leading-snug">{label}</Label>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{checked ? "Po" : "Jo"}</span>
          <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
      </div>
      {checked && onDetailsChange && (
        <Input
          value={details || ""}
          onChange={(e) => onDetailsChange(e.target.value)}
          placeholder={detailsPlaceholder || "Specifikoni..."}
          className="h-8 text-sm mt-1"
        />
      )}
    </div>
  );
}
