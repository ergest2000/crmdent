import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface Clinic {
  id: string;
  name: string;
  logo_url: string | null;
}

interface ClinicStore {
  clinic: Clinic | null;
  loading: boolean;
  fetchClinic: () => Promise<void>;
  updateClinic: (data: { name?: string; logo_url?: string | null }) => Promise<boolean>;
  uploadLogo: (file: File) => Promise<string | null>;
}

export const useClinicStore = create<ClinicStore>((set, get) => {
  supabase.auth.onAuthStateChange((_e, session) => {
    if (session?.user) setTimeout(() => get().fetchClinic(), 0);
  });

  return {
    clinic: null,
    loading: false,

    fetchClinic: async () => {
      set({ loading: true });
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) { set({ clinic: null, loading: false }); return; }

      const { data: prof } = await supabase
        .from("profiles" as any)
        .select("clinic_id")
        .eq("id", uid)
        .maybeSingle();

      const clinicId = (prof as any)?.clinic_id;
      if (!clinicId) { set({ clinic: null, loading: false }); return; }

      const { data, error } = await supabase
        .from("clinics")
        .select("id, name, logo_url")
        .eq("id", clinicId)
        .maybeSingle();
      if (error) console.error("fetchClinic error:", error.message);

      set({ clinic: (data as Clinic) || null, loading: false });
    },

    updateClinic: async (data) => {
      const c = get().clinic;
      if (!c) return false;
      const { error } = await supabase.from("clinics").update(data).eq("id", c.id);
      if (error) { console.error("updateClinic error:", error.message); return false; }
      set({ clinic: { ...c, ...data } as Clinic });
      return true;
    },

    uploadLogo: async (file) => {
      const c = get().clinic;
      if (!c) return null;
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${c.id}/logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("clinic-logos")
        .upload(path, file, { upsert: true });
      if (error) { console.error("uploadLogo error:", error.message); return null; }
      const { data } = supabase.storage.from("clinic-logos").getPublicUrl(path);
      return data.publicUrl;
    },
  };
});
