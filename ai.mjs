// OptAIn Career AI - Claude proxy. Keeps the API key on the server and streams text back.
export const config = { path: "/api/ai" };

const SYSTEM = "You are part of OptAIn Career AI, a South African career platform. Reply with ONLY valid JSON matching the requested shape. No prose, no code fences. Never invent facts about the candidate.";
const hits = new Map(); // light per-instance rate limit

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export default async (req, context) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const key = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "missing_key" }, 500);

  const code = Netlify.env.get("ACCESS_CODE");
  if (code && req.headers.get("x-access-code") !== code) return json({ error: "access" }, 401);

  const ip = context.ip || "unknown", now = Date.now(), limit = Number(Netlify.env.get("RATE_PER_MIN") || 30);
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000); recent.push(now); hits.set(ip, recent);
  if (recent.length > limit) return json({ error: "rate_limited" }, 429);

  let body;
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }
  const prompt = String(body.prompt || "");
  if (!prompt || prompt.length > 60000) return json({ error: "bad_request" }, 400);

  const model = body.tier === "quick"
    ? (Netlify.env.get("CLAUDE_MODEL_QUICK") || "claude-haiku-5-5")
    : (Netlify.env.get("CLAUDE_MODEL") || "claude-sonnet-5-5");

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 6000, stream: true, system: SYSTEM, messages: [{ role: "user", content: prompt }] })
  });
  if (!upstream.ok) {
    const detail = (await upstream.text()).slice(0, 300);
    console.error("Anthropic error", upstream.status, detail);
    return json({ error: "upstream", status: upstream.status }, upstream.status === 429 ? 429 : 502);
  }

  // Convert Anthropic's event stream into plain text chunks.
  const reader = upstream.body.getReader(), dec = new TextDecoder(), enc = new TextEncoder();
  let buf = "";
  const stream = new ReadableStream({
    async pull(ctrl) {
      // Keep reading until at least one text chunk is emitted, or the stream ends.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) { ctrl.close(); return; }
        buf += dec.decode(value, { stream: true });
        let i, sent = false;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const ev = buf.slice(0, i); buf = buf.slice(i + 2);
          const line = ev.split("\n").find(l => l.startsWith("data:"));
          if (!line) continue;
          try {
            const d = JSON.parse(line.slice(5));
            if (d.type === "content_block_delta" && d.delta && d.delta.type === "text_delta") { ctrl.enqueue(enc.encode(d.delta.text)); sent = true; }
            if (d.type === "error") { ctrl.enqueue(enc.encode("\n__ERROR__" + JSON.stringify(d.error))); sent = true; }
          } catch { /* ignore keep-alives */ }
        }
        if (sent) return;
      }
    },
    cancel() { reader.cancel(); }
  });
  return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
};
