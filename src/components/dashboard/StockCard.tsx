import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { CardDateFilter, useCardDateFilter } from "@/components/dashboard/DashboardDateFilter";
import { useProductStore } from "@/stores/product-store";
import { ProductDialog } from "@/components/ProductDialog";

export function StockCard() {
  const { preset, dateRange, change } = useCardDateFilter("month");
  const { products, loading, fetchProducts } = useProductStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalAsset = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.quantity > 0 && p.quantity <= 5);
  const outOfStock = products.filter((p) => p.quantity === 0);
  const available = totalProducts > 0 ? Math.round(((totalProducts - lowStockItems.length - outOfStock.length) / totalProducts) * 100) : 0;
  const lowPct = totalProducts > 0 ? Math.round((lowStockItems.length / totalProducts) * 100) : 0;
  const outPct = totalProducts > 0 ? Math.round((outOfStock.length / totalProducts) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="rounded-card bg-card shadow-subtle p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Disponueshmëria e stokut</h3>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3 w-3" /> Shto
          </Button>
          <CardDateFilter value={preset} dateRange={dateRange} onChange={change} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Asete totale</p>
          <p className="text-lg font-semibold tabular-nums font-mono text-foreground">€{totalAsset.toLocaleString("de-DE", { minimumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Produkte</p>
          <p className="text-lg font-semibold tabular-nums font-mono text-foreground">{totalProducts}</p>
        </div>
      </div>

      <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden mb-2">
        <div className="bg-primary transition-all" style={{ width: `${available}%` }} />
        <div className="bg-status-pending transition-all" style={{ width: `${lowPct}%` }} />
        <div className="bg-destructive transition-all" style={{ width: `${outPct}%` }} />
      </div>
      <div className="flex gap-3 text-[10px] text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />Disponueshëm</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-pending" />I ulët ({lowStockItems.length})</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" />Mbaruar ({outOfStock.length})</span>
      </div>

      {lowStockItems.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-status-pending" /> Stok i ulët
            </p>
          </div>
          <div className="space-y-2">
            {lowStockItems.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums font-mono">Sasi: {item.quantity}</span>
                  <span className="text-xs text-muted-foreground">€{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {loading && <p className="text-xs text-muted-foreground text-center py-4">Duke ngarkuar...</p>}

      <ProductDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </motion.div>
  );
}
