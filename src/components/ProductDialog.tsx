import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductStore, type Product } from "@/stores/product-store";
import { toast } from "@/hooks/use-toast";

const categories = [
  { value: "supplies", label: "Furnizime" },
  { value: "restorative", label: "Restorative" },
  { value: "cosmetic", label: "Kozmetikë" },
  { value: "surgery", label: "Kirurgji" },
  { value: "preventive", label: "Preventive" },
  { value: "cleaning", label: "Pastrim" },
  { value: "general", label: "Të përgjithshme" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editProduct?: Product | null;
}

export function ProductDialog({ open, onOpenChange, editProduct }: Props) {
  const { addProduct, updateProduct } = useProductStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: editProduct?.name || "",
    price: editProduct?.price?.toString() || "",
    quantity: editProduct?.quantity?.toString() || "",
    category: editProduct?.category || "supplies",
  });

  const handleOpenChange = (v: boolean) => {
    if (!saving) {
      onOpenChange(v);
      if (v) {
        setForm({
          name: editProduct?.name || "",
          price: editProduct?.price?.toString() || "",
          quantity: editProduct?.quantity?.toString() || "",
          category: editProduct?.category || "supplies",
        });
      }
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: "Emri është i detyrueshëm", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, {
          name: form.name,
          price: Number(form.price) || 0,
          quantity: Number(form.quantity) || 0,
          category: form.category,
        });
        toast({ title: "Produkti u përditësua" });
      } else {
        await addProduct({
          name: form.name,
          price: Number(form.price) || 0,
          quantity: Number(form.quantity) || 0,
          category: form.category,
          added_by: null,
        });
        toast({ title: "Produkti u shtua me sukses" });
      }
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Gabim", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editProduct ? "Edito Produktin" : "Shto Produkt të Ri"}</DialogTitle>
          <DialogDescription>{editProduct ? "Ndryshoni të dhënat e produktit" : "Plotësoni të dhënat për produktin e ri"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Emri <span className="text-destructive">*</span></Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Emri i produktit" className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Çmimi (€)</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="mt-1" />
            </div>
            <div>
              <Label>Sasia</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Kategoria</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Anulo</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Duke ruajtur..." : editProduct ? "Përditëso" : "Shto Produkt"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
