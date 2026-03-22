import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, redirect_uri } = await req.json();

    if (!platform) {
      return new Response(
        JSON.stringify({ error: "Missing platform" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a random state for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state in a temporary way (we'll verify it on callback)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build the callback URL
    const callbackUrl = `${supabaseUrl}/functions/v1/oauth-callback`;

    let authUrl = "";

    switch (platform) {
      case "google_calendar": {
        const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
        if (!clientId) {
          return new Response(
            JSON.stringify({ error: "Google OAuth nuk është konfiguruar. Kontaktoni administratorin." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const scopes = [
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/calendar.events",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile",
        ].join(" ");

        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(clientId)}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scopes)}` +
          `&state=${state}:google_calendar` +
          `&access_type=offline` +
          `&prompt=consent`;
        break;
      }

      case "email": {
        // Gmail OAuth
        const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
        if (!clientId) {
          return new Response(
            JSON.stringify({ error: "Google OAuth nuk është konfiguruar. Kontaktoni administratorin." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const scopes = [
          "https://www.googleapis.com/auth/gmail.send",
          "https://www.googleapis.com/auth/gmail.readonly",
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile",
        ].join(" ");

        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(clientId)}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scopes)}` +
          `&state=${state}:email` +
          `&access_type=offline` +
          `&prompt=consent`;
        break;
      }

      case "facebook":
      case "instagram":
      case "whatsapp": {
        const appId = Deno.env.get("META_APP_ID");
        if (!appId) {
          return new Response(
            JSON.stringify({ error: "Meta OAuth nuk është konfiguruar. Kontaktoni administratorin." }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let scopes: string[];
        if (platform === "whatsapp") {
          scopes = ["whatsapp_business_management", "whatsapp_business_messaging", "business_management"];
        } else if (platform === "instagram") {
          scopes = ["instagram_basic", "instagram_manage_messages", "pages_manage_metadata", "pages_messaging"];
        } else {
          scopes = ["pages_messaging", "pages_manage_metadata", "pages_read_engagement"];
        }

        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
          `client_id=${encodeURIComponent(appId)}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent(scopes.join(","))}` +
          `&state=${state}:${platform}`;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Platformë e panjohur: ${platform}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Store state temporarily in integrations config for verification
    await supabase.from("integrations").update({
      config: { oauth_state: state, oauth_started: new Date().toISOString() }
    }).eq("platform", platform);

    return new Response(
      JSON.stringify({ auth_url: authUrl, state }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OAuth start error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Gabim i papritur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
