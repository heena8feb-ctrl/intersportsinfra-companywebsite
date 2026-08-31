export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }

    // Everything else: serve the static site exactly as before.
    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid request body" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  // Basic required-field check (mirrors what the form already requires client-side).
  const required = ["name", "phone", "email", "sport", "city", "plot"];
  for (const field of required) {
    if (!data[field] || String(data[field]).trim() === "") {
      return new Response(JSON.stringify({ ok: false, error: `Missing field: ${field}` }), {
        status: 400,
        headers: corsHeaders,
      });
    }
  }

  const html = `
    <h2>New enquiry from the website</h2>
    <p><strong>Sport / surface:</strong> ${escapeHtml(data.sport)}</p>
    <p><strong>New build or renovation:</strong> ${escapeHtml(data.type || "—")}</p>
    <p><strong>City:</strong> ${escapeHtml(data.city)}</p>
    <p><strong>State:</strong> ${escapeHtml(data.state || "—")}</p>
    <p><strong>Plot size:</strong> ${escapeHtml(data.plot)}</p>
    <p><strong>Number of courts:</strong> ${escapeHtml(data.courts || "—")}</p>
    <p><strong>Ground condition:</strong> ${escapeHtml(data.ground || "—")}</p>
    <p><strong>Timeline:</strong> ${escapeHtml(data.timeline || "—")}</p>
    <p><strong>Also needed:</strong> ${escapeHtml(
      Array.isArray(data.extras) ? data.extras.join(", ") : (data.extras || "—")
    )}</p>
    <p><strong>Notes:</strong> ${escapeHtml(data.notes || "—")}</p>
    <hr>
    <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Organisation:</strong> ${escapeHtml(data.org || "—")}</p>
    <p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Inter Sports Infra <noreply@intersportsinfra.com>",
      to: "intersportsinfra@gmail.com",
      reply_to: data.email,
      subject: `New enquiry: ${data.sport} — ${data.city}`,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errText = await resendResponse.text();
    console.error("Resend error:", errText);
    return new Response(JSON.stringify({ ok: false, error: "Failed to send" }), {
      status: 502,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: corsHeaders,
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
