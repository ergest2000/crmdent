// ============================================================================
//  DEMO USER / DEMO CLINIC  —  provisioning & reset
// ----------------------------------------------------------------------------
//  Qëllimi: një vizitor klikon "Fill demo credentials" -> Hyr dhe sheh menjëherë
//  një klinikë dentare të plotë e aktive (jo dashboard bosh). Pa lidhje me Hotel PMS.
//
//  Arkitektura (e rëndësishme):
//  1. Krijimi i demo user-it te auth.users bëhet nga:
//       - edge-function `demo-provision` (provisionDemo), OSE
//       - skedari SQL `supabase/demo_user_seed.sql` (një herë).
//  2. Mbushja/rikthimi i TË GJITHA të dhënave bëhet nga funksioni SQL
//     `reset_demo_data()` (SECURITY DEFINER) — thirret këtu me RPC. Ai anashkalon
//     RLS-në dhe vendos user_id/clinic_id të saktë, ndaj çdo modul mbushet
//     gjithmonë (Dashboard, Leads, Pacientë, Dentistë, Takime, Trajtime, Financa,
//     Fatura, Stok, Raporte, Staf). Datat përllogariten relativ ndaj current_date.
//  3. Reset i sigurt: funksioni fshin VETËM rreshtat demo (id 'DEMO-…' ose prefiks
//     '[DEMO]'), kurrë të dhëna reale.
//
//  Shih: supabase/migrations/20260813130000_demo_reset_function.sql
// ============================================================================

import { supabase } from "@/integrations/supabase/client";
import { useInvoiceStore } from "@/stores/invoice-store";
import { useFinanceStore } from "@/stores/finance-store";

export const DEMO_EMAIL = "demo@dentalcrm.com";
export const DEMO_PASSWORD = "demo123";
export const DEMO_CLINIC_ID = "de300000-0000-4000-8000-0000000000c1";
export const DEMO_CLINIC_NAME = "Klinika Dentare Demo";

export const isDemoEmail = (email?: string | null): boolean =>
  (email || "").trim().toLowerCase() === DEMO_EMAIL;

// ---------------------------------------------------------------------------
//  PROVISION — siguron demo user + klinikë + profil (edge function opsionale)
// ---------------------------------------------------------------------------
export async function provisionDemo(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("demo-provision", {
      body: {},
    });
    if (error) return { ok: false, error: error.message };
    if (data && (data as any).error) return { ok: false, error: (data as any).error };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ---------------------------------------------------------------------------
//  RESET + SEED — thërret funksionin SQL reset_demo_data() (RLS-proof)
// ---------------------------------------------------------------------------
export async function resetDemoData(): Promise<{ ok: boolean; error?: string }> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user || !isDemoEmail(user.email)) {
    return { ok: false, error: "Reset lejohet vetëm për demo user-in e loguar." };
  }

  const { error } = await supabase.rpc("reset_demo_data");
  if (error) return { ok: false, error: error.message };

  // Rifresko store-t që s'rifreskohen te AppLayout (invoices & finance ngarkohen
  // te onAuthStateChange, që ndodh para reset-it).
  try {
    await useInvoiceStore.getState().fetchInvoices();
    await useFinanceStore.getState().fetchAll();
  } catch {
    /* injoro */
  }

  return { ok: true };
}

// Thirret pas login-it të demo user-it (rikthen gjendjen fillestare të plotë).
export async function ensureDemoReady(): Promise<void> {
  await resetDemoData();
}
