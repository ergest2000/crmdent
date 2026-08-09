import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTreatmentStore, type FullTreatment } from "@/stores/treatment-store";
import { useClinicStore } from "@/stores/clinic-store";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTreatment?: FullTreatment;
}

export function TreatmentDialog({ open, onOpenChange, editTreatment }: Props) {
  const addTreatment = useTreatmentStore((s) => s.addTreatment);
  const updateTreatment = useTreatmentStore((s) => s.updateTreatment);
  const clinic = useClinicStore((s) => s.clinic);
  const rate = clinic?.eur_to_all || 100; // 1 € = rate Lekë

  const [form, setForm] = useState({
    name: editTreatment?.name || "",
    category: editTreatment?.category || "General",
    price: editTreatment?.price || 0,
    priceAll: editTreatment?.priceAll || 0,
    duration: editTreatment?.duration || 30,
    description: editTreatment?.description || "",
  });

  // Kur ndryshon € -> llogarit Lekë
  const setEur = (v: number) =>
    setForm((f) => ({ ...f, price: v, priceAll: Math.round(v * rate) }));
  // Kur ndryshon Lekë -> llogarit €
  const setAll = (v: number) =>
    setForm((f) => ({ ...f, priceAll: v, price: rate ? Math.round((v / rate) * 100) / 100 : 0 }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      priceAll: Number(form.priceAll),
      duration: Number(form.duration),
    };
    if (editTreatment) {
      updateTreatment(editTreatment.id, payload);
      toast({ title: "Trajtimi u përditësua" });
    } else {
      addTreatment(payload);
      toast({ title: "Trajtimi u shtua me sukses" });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editTreatment ? "Edito Trajtimin" : "Shto Trajtim të Ri"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Emri i trajtimit *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Kategoria</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Preventive", "Restorative", "Endodontics", "Prosthetics", "Surgery", "General", "Cosmetic"].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Çmimi (€) *</label>
              <Input type="number" value={form.price} onChange={(e) => setEur(Number(e.target.value))} required className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Çmimi (Lekë)</label>
              <Input type="number" value={form.priceAll} onChange={(e) => setAll(Number(e.target.value))} className="h-9 text-sm" />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground -mt-2">Kursi: 1 € = {rate} Lekë (ndryshohet te Cilësimet). Ndrysho njërin, tjetri llogaritet vetë.</p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Kohëzgjatja (min)</label>
            <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="h-9 text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Përshkrimi</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" size="sm">{editTreatment ? "Ruaj" : "Shto"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
