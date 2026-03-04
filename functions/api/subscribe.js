export async function onRequestPost(context) {
  const { request, env } = context;

  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();

  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Please enter a valid email." }, 400);
  }

  // OPTIONAL (recommended): Turnstile verification
  // Turnstile tokens must be verified server-side. :contentReference[oaicite:2]{index=2}
  // const token = String(form.get("cf-turnstile-response") || "");
  // if (!token) return json({ error: "Captcha required." }, 400);
  // const ok = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY);
  // if (!ok) return json({ error: "Captcha failed. Try again." }, 400);

  // Store in D1
  // You will create a D1 binding named DB in Cloudflare Pages settings.
  await env.DB.prepare(
    "INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, datetime('now'))"
  ).bind(email).run();

  return json({ ok: true }, 200);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

// async function verifyTurnstile(token, secret) {
//   const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
//     method: "POST",
//     headers: { "content-type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({ secret, response: token }),
//   });
//   const data = await res.json();
//   return Boolean(data.success);
// }
