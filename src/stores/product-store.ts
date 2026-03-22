import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

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

export const useProductStore = create<ProductStore>((set, get) => {
  // Set up realtime subscription
  supabase
    .channel("products-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
      get().fetchProducts();
    })
    .subscribe();

  return {
  products: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      set({ products: data as Product[], loading: false });
    } else {
      set({ loading: false });
    }
  },

  addProduct: async (productData) => {
    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (!error && data) {
      set((s) => ({ products: [data as Product, ...s.products] }));
    }
  },

  updateProduct: async (id, updates) => {
    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id);

    if (!error) {
      set((s) => ({
        products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
    }
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    }
  },
}});
