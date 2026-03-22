import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinanceStore } from "@/stores/finance-store";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenseDialog({ open, onOpenChange }: Props) {
  const addExpense = useFinanceStore((s) => s.addExpense);

  const [form, setForm] = useState({
    category: "supplies" as string,
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    recurring: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({ ...form, amount: Number(form.amount), category: form.category as any });
    toast({ title: "Shpenzimi u regjistrua" });
    onOpenChange(false);
    setForm({ category: "supplies", description: "", amount: 0, date: new Date().toISOString().split("T")[0], recurring: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Regjistro Shpenzim</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Përshkrimi *</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Kategoria</label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplies">Furnizime</SelectItem>
                  <SelectItem value="salary">Paga</SelectItem>
                  <SelectItem value="rent">Qira</SelectItem>
                  <SelectItem value="utilities">Shërbime</SelectItem>
                  <SelectItem value="equipment">Pajisje</SelectItem>
                  <SelectItem value="other">Të tjera</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Shuma (€) *</label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Data</label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-9 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
            <label className="text-sm text-foreground">Shpenzim periodik</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" size="sm">Regjistro</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
