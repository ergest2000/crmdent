import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "super_admin" | "clinic_admin" | "doctor" | "receptionist" | "accountant" | "economist" | "manager";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  clinic_id?: string;
  clinic_name?: string;
  phone?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  plan_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  max_users: number;
  allowed_roles: string[];
  features: string[];
  price: number;
}

const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ["*"],
  clinic_admin: ["dashboard", "patients", "doctors", "appointments", "treatments", "finance", "invoices", "stock", "reports", "admin", "staff", "settings", "leads"],
  doctor: ["dashboard", "patients", "appointments", "treatments"],
  receptionist: ["dashboard", "patients", "appointments", "leads"],
  accountant: ["dashboard", "finance", "invoices", "reports"],
  economist: ["dashboard", "finance", "reports", "stock"],
  manager: ["dashboard", "patients", "appointments", "treatments", "staff", "reports", "leads"],
};

interface AuthStore {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  clinics: Clinic[];
  plans: Plan[];
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, fullName: string, role?: string, clinicId?: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  fetchProfile: () => Promise<void>;
  fetchClinics: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  hasPermission: (page: string) => boolean;
  isSuperAdmin: () => boolean;
  isClinicAdmin: () => boolean;
  isDemo: () => boolean;
}

// Email-i i llogarisë demo (mbajeni të njëjtë me src/lib/demo.ts).
const DEMO_EMAIL = "demo@dentalcrm.com";

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,
  clinics: [],
  plans: [],

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      set({ user: session.user, session, initialized: true });
      await get().fetchProfile();
      await get().fetchPlans();
      if (get().profile?.role === "super_admin") {
        await get().fetchClinics();
      }
    } else {
      set({ initialized: true });
    }

    // KUJDES: mos bej thirrje async DIREKT brenda onAuthStateChange (bllokohet supabase-js).
    // E shtyjme me setTimeout(…, 0).
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({ user: session.user, session });
        setTimeout(() => { get().fetchProfile(); }, 0);
      } else {
        set({ user: null, session: null, profile: null });
      }
    });
  },

  login: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error?.message || null };
  },

  register: async (email, password, fullName, role = "clinic_admin", clinicId) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role, clinic_id: clinicId } },
    });
    set({ loading: false });
    return { error: error?.message || null };
  },

  logout: async () => {
    try { await supabase.auth.signOut(); } catch (e) { /* injoro */ }
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("sb-")).forEach((k) => localStorage.removeItem(k));
    } catch (e) { /* injoro */ }
    set({ user: null, session: null, profile: null, clinics: [], plans: [] });
    window.location.href = "/login";
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/#/reset-password",
    });
    return { error: error?.message || null };
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (error) console.error("[auth] fetchProfile:", error.message);
    if (data) set({ profile: data as Profile });
  },

  fetchClinics: async () => {
    const { data } = await supabase.from("clinics").select("*").order("created_at", { ascending: false });
    if (data) set({ clinics: data as Clinic[] });
  },

  fetchPlans: async () => {
    const { data } = await supabase.from("plans").select("*").order("price");
    if (data) set({ plans: data as Plan[] });
  },

  hasPermission: (page) => {
    const profile = get().profile;
    if (!profile) return true;
    const perms = rolePermissions[profile.role] || [];
    return perms.includes("*") || perms.includes(page);
  },

  isSuperAdmin: () => get().profile?.role === "super_admin",
  isClinicAdmin: () => get().profile?.role === "clinic_admin",
  isDemo: () => {
    const email = get().profile?.email || get().user?.email || "";
    return email.trim().toLowerCase() === DEMO_EMAIL;
  },
}));
