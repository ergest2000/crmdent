import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTreatmentStore, type FullTreatment } from "@/stores/treatment-store";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTreatment?: FullTreatment;
}

export function TreatmentDialog({ open, onOpenChange, editTreatment }: Props) {
  const addTreatment = useTreatmentStore((s) => s.addTreatment);
  const updateTreatment = useTreatmentStore((s) => s.updateTreatment);

  const [form, setForm] = useState({
    name: editTreatment?.name || "",
    category: editTreatment?.category || "General",
    price: editTreatment?.price || 0,
    duration: editTreatment?.duration || 30,
    description: editTreatment?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTreatment) {
      updateTreatment(editTreatment.id, { ...form, price: Number(form.price), duration: Number(form.duration) });
      toast({ title: "Trajtimi u përditësua" });
    } else {
      addTreatment({ ...form, price: Number(form.price), duration: Number(form.duration) });
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
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Kohëzgjatja (min)</label>
              <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="h-9 text-sm" />
            </div>
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
