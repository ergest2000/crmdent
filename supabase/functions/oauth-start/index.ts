// ============================================================================
//  demo-provision  (verify_jwt = false)
// ----------------------------------------------------------------------------
//  Siguron (idempotent) infrastrukturën e demo-s:
//    - klinikën demo (id fikse)
//    - demo user-in te auth.users (email demo@dentalcrm.com / pass demo123)
//    - profilin (role: clinic_admin, i lidhur me klinikën demo)
//
//  NUK mbush të dhëna domain — ato mbushen nga klienti si demo user
//  (src/lib/demo.ts -> resetDemoData), që RLS + `default auth.uid()` të plotësohen
//  saktë. Kthen { ok, userId }.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEMO_EMAIL = "demo@dentalcrm.com";
const DEMO_PASSWORD = "demo123";
const DEMO_CLINIC_ID = "de300000-0000-4000-8000-0000000000c1";
const DEMO_CLINIC_NAME = "Klinika Dentare Demo";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1) Klinika demo (upsert) -------------------------------------------------
    const { error: clinicErr } = await admin
      .from("clinics")
      .upsert(
        { id: DEMO_CLINIC_ID, name: DEMO_CLINIC_NAME, is_active: true },
        { onConflict: "id" },
      );
    if (clinicErr) console.error("[demo-provision] clinic:", clinicErr.message);

    // 2) Demo user te auth.users ----------------------------------------------
    let userId: string | null = null;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: DEMO_CLINIC_NAME,
        role: "clinic_admin",
        clinic_id: DEMO_CLINIC_ID,
      },
    });

    if (created?.user) {
      userId = created.user.id;
    } else {
      // Ekziston tashmë -> gjeje dhe rivendos password-in te demo123
      if (createErr && !/already|exist|registered/i.test(createErr.message)) {
        console.error("[demo-provision] createUser:", createErr.message);
      }
      // Kërko user-in me email (paginim i thjeshtë)
      for (let page = 1; page <= 10 && !userId; page++) {
        const { data: list, error: listErr } = await admin.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        if (listErr) {
          console.error("[demo-provision] listUsers:", listErr.message);
          break;
        }
        const found = list?.users?.find(
          (u) => (u.email || "").toLowerCase() === DEMO_EMAIL,
        );
        if (found) userId = found.id;
        if (!list || list.users.length < 200) break;
      }
      if (userId) {
        await admin.auth.admin.updateUserById(userId, {
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: {
            full_name: DEMO_CLINIC_NAME,
            role: "clinic_admin",
            clinic_id: DEMO_CLINIC_ID,
          },
        });
      }
    }

    if (!userId) return json({ error: "Nuk u krijua/gjet demo user." }, 500);

    // 3) Profili (upsert) ------------------------------------------------------
    const { error: profErr } = await admin.from("profiles").upsert(
      {
        id: userId,
        email: DEMO_EMAIL,
        full_name: DEMO_CLINIC_NAME,
        role: "clinic_admin",
        clinic_id: DEMO_CLINIC_ID,
        clinic_name: DEMO_CLINIC_NAME,
      },
      { onConflict: "id" },
    );
    if (profErr) console.error("[demo-provision] profile:", profErr.message);

    return json({ ok: true, userId });
  } catch (e) {
    console.error("[demo-provision] fatal:", (e as Error).message);
    return json({ error: (e as Error).message }, 500);
  }
});
