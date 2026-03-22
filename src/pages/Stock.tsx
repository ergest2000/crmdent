import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react";
import { ExportMenu } from "@/components/ExportMenu";
import { exportPDF, exportCSV } from "@/lib/export-utils";
import { useProductStore, type Product } from "@/stores/product-store";
import { ProductDialog } from "@/components/ProductDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { clinicalTransition } from "@/lib/motion";
import { toast } from "@/hooks/use-toast";

const categories = [
  { value: "all", label: "Të gjitha" },
  { value: "supplies", label: "Furnizime" },
  { value: "restorative", label: "Restorative" },
  { value: "cosmetic", label: "Kozmetikë" },
  { value: "surgery", label: "Kirurgji" },
  { value: "preventive", label: "Preventive" },
  { value: "cleaning", label: "Pastrim" },
  { value: "general", label: "Të përgjithshme" },
];

const categoryLabels: Record<string, string> = Object.fromEntries(categories.map(c => [c.value, c.label]));

export default function StockPage() {
  const { products, loading, fetchProducts, deleteProduct } = useProductStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  const totalValue = useMemo(() => products.reduce((sum, p) => sum + p.price * p.quantity, 0), [products]);
  const lowStock = useMemo(() => products.filter((p) => p.quantity <= 5).length, [products]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteProduct(deleteId);
    toast({ title: "Produkti u fshi" });
    setDeleteId(null);
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Stoku i Produkteve</h1>
          <p className="text-sm text-muted-foreground">{products.length} produkte · Vlera totale: €{totalValue.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <ExportMenu
            onExportPDF={() => {
              const config = { title: "Stoku i Produkteve", filename: "stoku", columns: [
                { header: "Produkti", key: "name" }, { header: "Kategoria", key: "category" }, { header: "Çmimi", key: "price", align: "right" as const }, { header: "Sasia", key: "quantity", align: "right" as const }, { header: "Vlera", key: "value", align: "right" as const },
              ], data: filtered.map((p) => ({ name: p.name, category: categoryLabels[p.category] || p.category, price: `€${p.price.toFixed(2)}`, quantity: p.quantity, value: `€${(p.price * p.quantity).toFixed(2)}` })) };
              exportPDF(config);
            }}
            onExportCSV={() => {
              const config = { title: "Stoku i Produkteve", filename: "stoku", columns: [
                { header: "Produkti", key: "name" }, { header: "Kategoria", key: "category" }, { header: "Çmimi", key: "price" }, { header: "Sasia", key: "quantity" }, { header: "Vlera", key: "value" },
              ], data: filtered.map((p) => ({ name: p.name, category: categoryLabels[p.category] || p.category, price: `€${p.price.toFixed(2)}`, quantity: p.quantity, value: `€${(p.price * p.quantity).toFixed(2)}` })) };
              exportCSV(config);
            }}
          />
          <Button size="sm" className="gap-1.5" onClick={() => { setEditProduct(null); setDialogOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Shto Produkt
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-card bg-card shadow-subtle p-3 text-center">
          <p className="text-lg font-semibold font-mono text-foreground">{products.length}</p>
          <p className="text-[11px] text-muted-foreground">Produkte totale</p>
        </div>
        <div className="rounded-card bg-card shadow-subtle p-3 text-center">
          <p className="text-lg font-semibold font-mono text-primary">€{totalValue.toFixed(2)}</p>
          <p className="text-[11px] text-muted-foreground">Vlera totale</p>
        </div>
        <div className="rounded-card bg-card shadow-subtle p-3 text-center">
          <p className="text-lg font-semibold font-mono text-amber-600">{lowStock}</p>
          <p className="text-[11px] text-muted-foreground">Stok i ulët</p>
        </div>
        <div className="rounded-card bg-card shadow-subtle p-3 text-center">
          <p className="text-lg font-semibold font-mono text-emerald-600">{products.filter(p => p.quantity > 5).length}</p>
          <p className="text-[11px] text-muted-foreground">Në gjendje</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Kërko produkt..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue placeholder="Kategoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-card bg-card shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Duke ngarkuar...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Produkti</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Kategoria</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Çmimi</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Sasia</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Vlera</th>
                <th className="text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Data</th>
                <th className="text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-4 py-2.5">Veprime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...clinicalTransition, delay: i * 0.02 }}
                  className="hover:bg-muted/30 transition-colors duration-150 group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {product.quantity <= 5 && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground">
                      {categoryLabels[product.category] || product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-foreground">€{product.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-mono ${product.quantity <= 5 ? "text-amber-600 font-semibold" : "text-foreground"}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-mono text-foreground">€{(product.price * product.quantity).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{new Date(product.created_at).toLocaleDateString("sq-AL")}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditProduct(product); setDialogOpen(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edito">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(product.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="Fshi">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Nuk u gjet asnjë produkt.</div>
        )}
      </div>

      {/* Product Dialog */}
      <ProductDialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditProduct(null); }} editProduct={editProduct} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmo fshirjen</AlertDialogTitle>
            <AlertDialogDescription>Jeni i sigurt që doni të fshini këtë produkt?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulo</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Fshi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
