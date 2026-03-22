import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "client";
  clinic_name?: string;
  phone?: string;
}

interface AuthStore {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ user: session.user, session });
        await get().fetchProfile();
      }
      set({ loading: false, initialized: true });

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ user: session?.user || null, session });
        if (session?.user) {
          await get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });
    } catch {
      set({ loading: false, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    if (error) return { error: error.message };
    return {};
  },

  register: async (email, password, fullName, role = "client") => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    set({ loading: false });
    if (error) return { error: error.message };
    return {};
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return { error: error.message };
    return {};
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      set({ profile: data as Profile });
    }
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) return;
    await supabase.from("profiles").update(data).eq("id", user.id);
    set((s) => ({ profile: s.profile ? { ...s.profile, ...data } : null }));
  },
}));
