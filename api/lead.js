const UPSTASH_URL = process.env.KV_REST_API_URL || process.env.kv_KV_REST_API_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.kv_KV_REST_API_TOKEN;

async function redis(command) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  try {
    const res = await fetch(UPSTASH_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    return await res.json();
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    const { email, company } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    await redis(["SADD", "leads:emails", email]);
    await redis(["LPUSH", "leads:log", JSON.stringify({
      email,
      company: company || "",
      timestamp: new Date().toISOString(),
    })]);
    await redis(["INCR", "leads:total"]);

    return res.status(200).json({ success: true });
  }

  // GET: Return lead count
  if (req.method === "GET") {
    const total = await redis(["SCARD", "leads:emails"]);
    return res.status(200).json({ uniqueEmails: total?.result || 0 });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
