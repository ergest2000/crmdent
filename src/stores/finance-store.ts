import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Payment, Expense } from "@/lib/mock-data";

interface FinanceStore {
  payments: Payment[];
  expenses: Expense[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  addPayment: (data: Omit<Payment, "id">) => void;
  addExpense: (data: Omit<Expense, "id">) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

// Rreshti i DB -> Expense
function rowToExpense(r: any): Expense {
  return {
    id: r.id,
    category: (r.category ?? "other") as Expense["category"],
    description: r.description ?? "",
    amount: parseFloat(r.amount) || 0,
    date: r.date ?? "",
    recurring: false, // s'ekziston ne DB; parazgjedhje
  };
}

// Faturat e paguara -> Payment (te ardhurat)
function invoiceToPayment(inv: any): Payment {
  return {
    id: `PAY-${inv.id}`,
    invoiceId: inv.id,
    patientName: inv.patient_name ?? "",
    amount: parseFloat(inv.paid) || 0,
    method: "cash",
    date: inv.date ?? "",
  };
}

export const useFinanceStore = create<FinanceStore>((set, get) => {
  // Realtime: rifresko kur ndryshojne shpenzimet ose faturat
  supabase
    .channel("finance-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, () => get().fetchAll())
    .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, () => get().fetchAll())
    .subscribe();

  // Fetch fillestar kur ka sesion (pa deadlock: jashte callback-ut)
  supabase.auth.onAuthStateChange((_e, session) => {
    if (session?.user) setTimeout(() => get().fetchAll(), 0);
  });

  return {
    payments: [],
    expenses: [],
    loading: false,

    fetchAll: async () => {
      set({ loading: true });

      const { data: exp, error: expErr } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (expErr) console.error("fetch expenses error:", expErr.message);

      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .select("id, patient_name, paid, date")
        .gt("paid", 0)
        .order("date", { ascending: false });
      if (invErr) console.error("fetch invoices(payments) error:", invErr.message);

      set({
        expenses: (exp || []).map(rowToExpense),
        payments: (inv || []).map(invoiceToPayment),
        loading: false,
      });
    },

    addPayment: () => {
      // Te ardhurat vijne nga faturat (invoices.paid); s'ka tabele 'payments'.
      // Per te shtuar nje pagese, perditeso 'paid' te fatura perkatese.
    },

    addExpense: (data) => {
      supabase.from("expenses").insert({
        category: data.category,
        description: data.description,
        amount: data.amount,
        date: data.date,
      }).then(({ error }) => {
        if (error) console.error("addExpense error:", error.message);
        else get().fetchAll();
      });
    },

    updateExpense: (id, data) => {
      const payload: Record<string, any> = {};
      if (data.category !== undefined) payload.category = data.category;
      if (data.description !== undefined) payload.description = data.description;
      if (data.amount !== undefined) payload.amount = data.amount;
      if (data.date !== undefined) payload.date = data.date;

      set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)) }));

      if (Object.keys(payload).length > 0) {
        supabase.from("expenses").update(payload).eq("id", id).then(({ error }) => {
          if (error) console.error("updateExpense error:", error.message);
        });
      }
    },

    deleteExpense: (id) => {
      set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
      supabase.from("expenses").delete().eq("id", id).then(({ error }) => {
        if (error) console.error("deleteExpense error:", error.message);
      });
    },
  };
});
