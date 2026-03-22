import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;
type Message = Tables<"messages">;
type LeadStatus = Lead["status"];
type Channel = Lead["channel"];

export type { Lead, Message, LeadStatus, Channel };

interface LeadStore {
  leads: Lead[];
  messages: Message[];
  selectedLeadId: string | null;
  loading: boolean;

  fetchLeads: () => Promise<void>;
  fetchMessages: (leadId: string) => Promise<void>;
  selectLead: (id: string | null) => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => Promise<void>;
  assignLead: (leadId: string, staffId: string) => Promise<void>;
  addMessage: (leadId: string, content: string, direction: "inbound" | "outbound") => Promise<void>;
  markMessagesRead: (leadId: string) => Promise<void>;
  getUnreadCount: (leadId: string) => number;
  convertToPatient: (leadId: string) => Promise<void>;
}

export const useLeadStore = create<LeadStore>((set, get) => {
  // Set up realtime subscription
  supabase
    .channel("leads-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
      // Re-fetch leads on any change
      get().fetchLeads();
    })
    .subscribe();

  return {
  leads: [],
  messages: [],
  selectedLeadId: null,
  loading: false,

  fetchLeads: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error && data) {
      set({ leads: data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  fetchMessages: async (leadId) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("timestamp", { ascending: true });

    if (data) {
      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.lead_id !== leadId),
          ...data,
        ],
      }));
    }
  },

  selectLead: (id) => {
    set({ selectedLeadId: id });
    if (id) {
      get().fetchMessages(id);
      get().markMessagesRead(id);
    }
  },

  updateLeadStatus: async (leadId, status) => {
    await supabase.from("leads").update({ status }).eq("id", leadId);
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, status } : l
      ),
    }));
  },

  assignLead: async (leadId, staffId) => {
    await supabase.from("leads").update({ assigned_to: staffId }).eq("id", leadId);
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, assigned_to: staffId } : l
      ),
    }));
  },

  addMessage: async (leadId, content, direction) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead) return;

    const { data: msg } = await supabase
      .from("messages")
      .insert({
        lead_id: leadId,
        direction,
        content,
        channel: lead.channel,
        read: true,
      })
      .select()
      .single();

    if (msg) {
      // Update lead last message + status
      const newStatus = lead.status === "new" && direction === "outbound" ? "contacted" : lead.status;
      await supabase
        .from("leads")
        .update({ last_message: content, status: newStatus })
        .eq("id", leadId);

      set((state) => ({
        messages: [...state.messages, msg],
        leads: state.leads.map((l) =>
          l.id === leadId ? { ...l, last_message: content, status: newStatus as LeadStatus } : l
        ),
      }));
    }
  },

  markMessagesRead: async (leadId) => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("lead_id", leadId)
      .eq("read", false);

    set((state) => ({
      messages: state.messages.map((m) =>
        m.lead_id === leadId ? { ...m, read: true } : m
      ),
    }));
  },

  getUnreadCount: (leadId) => {
    return get().messages.filter(
      (m) => m.lead_id === leadId && !m.read && m.direction === "inbound"
    ).length;
  },

  convertToPatient: async (leadId) => {
    await supabase
      .from("leads")
      .update({ status: "converted" as LeadStatus })
      .eq("id", leadId);

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, status: "converted" as LeadStatus } : l
      ),
    }));
  },
}});
