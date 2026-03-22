import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (data: Omit<Product, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
      loading: false,

      fetchProducts: async () => {
        set({ loading: false });
      },

      addProduct: async (productData) => {
        const now = new Date().toISOString();
        const product: Product = {
          ...productData,
          id: `PRD-${Date.now()}`,
          created_at: now,
          updated_at: now,
        };
        set((s) => ({ products: [product, ...s.products] }));
      },

      updateProduct: async (id, updates) => {
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProduct: async (id) => {
        set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
      },
    }),
    { name: "products-storage" }
  )
);
