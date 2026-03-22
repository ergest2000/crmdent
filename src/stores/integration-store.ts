import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export interface Integration {
  id: string;
  platform: string;
  display_name: string;
  is_connected: boolean;
  config: Record<string, any>;
  connected_account: string | null;
  connected_at: string | null;
}

interface IntegrationStore {
  integrations: Integration[];
  loading: boolean;
  fetchIntegrations: () => Promise<void>;
  connectPlatform: (platform: string, config: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  disconnectPlatform: (platform: string) => Promise<void>;
  getIntegration: (platform: string) => Integration | undefined;
}

export const useIntegrationStore = create<IntegrationStore>((set, get) => ({
  integrations: [],
  loading: false,

  fetchIntegrations: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .order("created_at");

    if (!error && data) {
      set({ integrations: data as unknown as Integration[], loading: false });
    } else {
      set({ loading: false });
    }
  },

  connectPlatform: async (platform, config) => {
    try {
      // Call edge function to verify credentials
      const { data, error } = await supabase.functions.invoke("verify-integration", {
        body: { platform, config },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      // Update integration in DB
      const { error: dbError } = await supabase
        .from("integrations")
        .update({
          is_connected: true,
          config: { configured: true }, // Don't store secrets in DB
          connected_account: data?.account || config.account_name || platform,
          connected_at: new Date().toISOString(),
        } as any)
        .eq("platform", platform);

      if (dbError) throw new Error(dbError.message);

      // Refresh
      await get().fetchIntegrations();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  disconnectPlatform: async (platform) => {
    await supabase
      .from("integrations")
      .update({
        is_connected: false,
        config: {},
        connected_account: null,
        connected_at: null,
      } as any)
      .eq("platform", platform);

    await get().fetchIntegrations();
  },

  getIntegration: (platform) => get().integrations.find((i) => i.platform === platform),
}));
