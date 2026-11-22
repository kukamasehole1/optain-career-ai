export const config = { path: "/api/health" };
export default async () => new Response(
  JSON.stringify({ ok: !!Netlify.env.get("ANTHROPIC_API_KEY"), gated: !!Netlify.env.get("ACCESS_CODE") }),
  { headers: { "content-type": "application/json", "cache-control": "no-store" } }
);
