import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const action = body.action || "invite";

    if (action === "accept") {
      return await handleAccept(supabaseAdmin, userId, userEmail, body.invitation_id);
    }

    if (action === "disconnect") {
      return await handleDisconnect(supabaseAdmin, userId, body.connection_id);
    }

    if (action === "connect") {
      return await handleDirectConnect(supabaseAdmin, userId, body.practitioner_id);
    }

    // === INVITE ACTION ===
    // Verify practitioner role
    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "practitioner")
      .maybeSingle();

    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Not a practitioner" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { client_email } = body;
    if (!client_email || typeof client_email !== "string" || !client_email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = client_email.trim().toLowerCase();

    // Check for existing pending invitation
    const { data: existing } = await supabaseAdmin
      .from("client_invitations")
      .select("id")
      .eq("practitioner_id", userId)
      .eq("client_email", normalizedEmail)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: "Invitation already pending" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert invitation with expiry
    const { data: invitation, error: insertError } = await supabaseAdmin
      .from("client_invitations")
      .insert({
        practitioner_id: userId,
        client_email: normalizedEmail,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        success: true,
        invitation_id: invitation.id,
        message: `Invitation sent to ${normalizedEmail}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleAccept(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  userEmail: string,
  invitationId: string
) {
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  if (!invitationId) {
    return new Response(JSON.stringify({ error: "invitation_id required" }), { status: 400, headers });
  }

  // Fetch invitation
  const { data: invitation, error: fetchErr } = await supabaseAdmin
    .from("client_invitations")
    .select("*")
    .eq("id", invitationId)
    .single();

  if (fetchErr || !invitation) {
    return new Response(JSON.stringify({ error: "Invitation not found" }), { status: 404, headers });
  }

  if (invitation.status !== "pending") {
    return new Response(JSON.stringify({ error: "Invitation already processed" }), { status: 400, headers });
  }

  // Check expiry
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: "Invitation has expired. Ask your practitioner to send a new one." }), { status: 410, headers });
  }

  // Verify the logged-in user's email matches the invitation
  if (userEmail.toLowerCase() !== invitation.client_email.toLowerCase()) {
    return new Response(JSON.stringify({ error: "This invitation was sent to a different email address" }), { status: 403, headers });
  }

  // Check if client already has an active practitioner
  const { data: existingConn } = await supabaseAdmin
    .from("practitioner_clients")
    .select("id, practitioner_id")
    .eq("client_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (existingConn) {
    return new Response(JSON.stringify({ error: "You are already connected to a practitioner. Please disconnect first before accepting a new invitation." }), { status: 409, headers });
  }

  // Create practitioner-client connection
  const { error: connError } = await supabaseAdmin
    .from("practitioner_clients")
    .insert({
      practitioner_id: invitation.practitioner_id,
      client_id: userId,
      invitation_id: invitationId,
      status: "active",
    });

  if (connError) {
    if (connError.code === "23505") {
      return new Response(JSON.stringify({ error: "Already connected" }), { status: 409, headers });
    }
    throw connError;
  }

  // Update invitation status
  await supabaseAdmin
    .from("client_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitationId);

  return new Response(JSON.stringify({ success: true, message: "Connected!" }), { status: 200, headers });
}

async function handleDisconnect(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  connectionId: string
) {
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  if (!connectionId) {
    return new Response(JSON.stringify({ error: "connection_id required" }), { status: 400, headers });
  }

  // Fetch the connection — user must be either client or practitioner
  const { data: conn, error: fetchErr } = await supabaseAdmin
    .from("practitioner_clients")
    .select("*")
    .eq("id", connectionId)
    .eq("status", "active")
    .single();

  if (fetchErr || !conn) {
    return new Response(JSON.stringify({ error: "Connection not found" }), { status: 404, headers });
  }

  if (conn.client_id !== userId && conn.practitioner_id !== userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("practitioner_clients")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", connectionId);

  if (updateErr) throw updateErr;

  return new Response(JSON.stringify({ success: true, message: "Disconnected" }), { status: 200, headers });
}

async function handleDirectConnect(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  practitionerId: string
) {
  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  if (!practitionerId) {
    return new Response(JSON.stringify({ error: "practitioner_id required" }), { status: 400, headers });
  }

  // Verify target is actually a practitioner
  const { data: roleCheck } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("user_id", practitionerId)
    .eq("role", "practitioner")
    .maybeSingle();

  if (!roleCheck) {
    return new Response(JSON.stringify({ error: "Selected user is not a practitioner" }), { status: 400, headers });
  }

  // Check if client already has an active practitioner
  const { data: existingConn } = await supabaseAdmin
    .from("practitioner_clients")
    .select("id")
    .eq("client_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (existingConn) {
    return new Response(JSON.stringify({ error: "You are already connected to a practitioner. Please disconnect first." }), { status: 409, headers });
  }

  const { error: insertErr } = await supabaseAdmin
    .from("practitioner_clients")
    .insert({
      practitioner_id: practitionerId,
      client_id: userId,
      status: "active",
    });

  if (insertErr) {
    if (insertErr.code === "23505") {
      return new Response(JSON.stringify({ error: "Already connected" }), { status: 409, headers });
    }
    throw insertErr;
  }

  return new Response(JSON.stringify({ success: true, message: "Connected!" }), { status: 200, headers });
}
