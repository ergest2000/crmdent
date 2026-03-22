import { create } from "zustand";
import { payments as mockPayments, expenses as mockExpenses, type Payment, type Expense } from "@/lib/mock-data";

interface FinanceStore {
  payments: Payment[];
  expenses: Expense[];
  addPayment: (data: Omit<Payment, "id">) => void;
  addExpense: (data: Omit<Expense, "id">) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  payments: mockPayments,
  expenses: mockExpenses,

  addPayment: (data) => {
    const id = `PAY-${Date.now()}`;
    set((s) => ({ payments: [{ ...data, id }, ...s.payments] }));
  },

  addExpense: (data) => {
    const id = `EXP-${Date.now()}`;
    set((s) => ({ expenses: [{ ...data, id }, ...s.expenses] }));
  },

  updateExpense: (id, data) => {
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
  },

  deleteExpense: (id) => {
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
  },
}));
