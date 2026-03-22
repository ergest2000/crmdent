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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const channel = url.searchParams.get("channel") as
      | "whatsapp"
      | "facebook"
      | "instagram"
      | "email";

    if (!channel) {
      return new Response(
        JSON.stringify({ error: "Missing channel parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // WhatsApp webhook verification (GET)
    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      const VERIFY_TOKEN = Deno.env.get("WEBHOOK_VERIFY_TOKEN") || "denteos_verify_2026";

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new Response(challenge, { status: 200, headers: corsHeaders });
      }
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    // POST — process incoming message
    const body = await req.json();
    let senderName = "I panjohur";
    let senderPhone: string | null = null;
    let senderEmail: string | null = null;
    let messageContent = "";
    let externalId: string | null = null;

    // Parse based on channel
    if (channel === "whatsapp") {
      // Meta Cloud API format
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const msg = change?.messages?.[0];
      if (msg) {
        senderPhone = msg.from;
        senderName = change?.contacts?.[0]?.profile?.name || senderPhone;
        messageContent = msg.text?.body || msg.type || "[media]";
        externalId = msg.id;
      }
    } else if (channel === "facebook" || channel === "instagram") {
      // Meta Messenger / Instagram webhook
      const entry = body?.entry?.[0];
      const messaging = entry?.messaging?.[0] || entry?.changes?.[0]?.value;
      if (messaging) {
        senderName = messaging.sender?.name || `${channel}-${messaging.sender?.id}`;
        messageContent = messaging.message?.text || "[media]";
        externalId = messaging.message?.mid;
      }
    } else if (channel === "email") {
      // Generic email webhook (SendGrid Inbound Parse, etc.)
      senderName = body.from_name || body.from || "Email";
      senderEmail = body.from_email || body.from;
      messageContent = body.text || body.subject || "[no content]";
      externalId = body.message_id;
    }

    if (!messageContent) {
      return new Response(
        JSON.stringify({ status: "ignored", reason: "no message content" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find or create lead
    let leadId: string;
    const lookupField = senderPhone ? "phone" : senderEmail ? "email" : null;
    const lookupValue = senderPhone || senderEmail;

    if (lookupField && lookupValue) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq(lookupField, lookupValue)
        .maybeSingle();

      if (existingLead) {
        leadId = existingLead.id;
        // Update last message
        await supabase
          .from("leads")
          .update({ last_message: messageContent })
          .eq("id", leadId);
      } else {
        const { data: newLead, error } = await supabase
          .from("leads")
          .insert({
            name: senderName,
            phone: senderPhone,
            email: senderEmail,
            channel,
            status: "new",
            last_message: messageContent,
          })
          .select("id")
          .single();

        if (error) throw error;
        leadId = newLead.id;
      }
    } else {
      // No identifier — create new lead by name
      const { data: newLead, error } = await supabase
        .from("leads")
        .insert({
          name: senderName,
          channel,
          status: "new",
          last_message: messageContent,
        })
        .select("id")
        .single();

      if (error) throw error;
      leadId = newLead.id;
    }

    // Store message
    const { error: msgError } = await supabase.from("messages").insert({
      lead_id: leadId,
      direction: "inbound",
      content: messageContent,
      channel,
      external_id: externalId,
      read: false,
    });

    if (msgError) throw msgError;

    return new Response(
      JSON.stringify({ status: "ok", lead_id: leadId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
