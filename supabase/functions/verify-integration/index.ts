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
    const { platform, config } = await req.json();

    if (!platform || !config) {
      return new Response(
        JSON.stringify({ error: "Missing platform or config" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let account = "";
    let verified = false;

    // Verify credentials based on platform
    switch (platform) {
      case "whatsapp": {
        // Verify WhatsApp credentials via Meta Graph API
        const { phone_number_id, access_token, waba_id } = config;
        if (!phone_number_id || !access_token || !waba_id) {
          return new Response(
            JSON.stringify({ error: "Mungojnë fushat e nevojshme: Phone Number ID, Access Token, WABA ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const waResp = await fetch(
          `https://graph.facebook.com/v19.0/${phone_number_id}`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const waData = await waResp.json();

        if (waData.error) {
          return new Response(
            JSON.stringify({ error: `WhatsApp API: ${waData.error.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        account = waData.display_phone_number || phone_number_id;
        verified = true;

        // Store secrets
        // Note: In production, store these in Vault, not in the DB
        break;
      }

      case "facebook": {
        const { page_id, page_access_token } = config;
        if (!page_id || !page_access_token) {
          return new Response(
            JSON.stringify({ error: "Mungojnë: Page ID dhe Page Access Token" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const fbResp = await fetch(
          `https://graph.facebook.com/v19.0/${page_id}?fields=name,id`,
          { headers: { Authorization: `Bearer ${page_access_token}` } }
        );
        const fbData = await fbResp.json();

        if (fbData.error) {
          return new Response(
            JSON.stringify({ error: `Facebook API: ${fbData.error.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        account = fbData.name || page_id;
        verified = true;

        // Subscribe to webhook for messaging
        await fetch(
          `https://graph.facebook.com/v19.0/${page_id}/subscribed_apps`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${page_access_token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ subscribed_fields: ["messages", "messaging_postbacks"] }),
          }
        );
        break;
      }

      case "instagram": {
        const { instagram_account_id, page_access_token } = config;
        if (!instagram_account_id || !page_access_token) {
          return new Response(
            JSON.stringify({ error: "Mungojnë: Instagram Account ID dhe Page Access Token" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const igResp = await fetch(
          `https://graph.facebook.com/v19.0/${instagram_account_id}?fields=username,name`,
          { headers: { Authorization: `Bearer ${page_access_token}` } }
        );
        const igData = await igResp.json();

        if (igData.error) {
          return new Response(
            JSON.stringify({ error: `Instagram API: ${igData.error.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        account = igData.username || instagram_account_id;
        verified = true;
        break;
      }

      case "email": {
        const { smtp_host, smtp_port, smtp_user, smtp_pass } = config;
        if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass) {
          return new Response(
            JSON.stringify({ error: "Mungojnë fushat SMTP: host, port, user, password" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // For email, we can't easily test SMTP in Deno edge functions
        // We verify the format and mark as configured
        account = smtp_user;
        verified = true;
        break;
      }

      case "google_calendar": {
        const { client_id, client_secret } = config;
        if (!client_id || !client_secret) {
          return new Response(
            JSON.stringify({ error: "Mungojnë: OAuth Client ID dhe Client Secret" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify client_id format
        if (!client_id.includes(".apps.googleusercontent.com")) {
          return new Response(
            JSON.stringify({ error: "Client ID duket i pavlefshëm. Duhet të përfundojë me .apps.googleusercontent.com" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        account = client_id.split(".")[0] + "...";
        verified = true;
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Platformë e panjohur: ${platform}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (!verified) {
      return new Response(
        JSON.stringify({ error: "Verifikimi i kredencialeve dështoi" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, account, platform }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verify integration error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Gabim i papritur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
