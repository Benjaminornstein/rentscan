// Upstash Redis helper
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

async function storeMarketData(data) {
  if (!data || !data.company) return;
  const entry = { ...data, source: "contract_photo", timestamp: new Date().toISOString(), id: Date.now().toString(36) };
  const key = `market:${data.company.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  await redis(["LPUSH", key, JSON.stringify(entry)]);
  await redis(["LTRIM", key, "0", "99"]);
  await redis(["SADD", "market:companies", data.company]);
  await redis(["INCR", "market:total_contracts"]);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { image } = req.body;
  if (!image) return res.status(400).json({ error: "No image provided" });

  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const mediaType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64Data },
              },
              {
                type: "text",
                text: `Extract rental car contract data from this image. Return ONLY a JSON object with these fields, nothing else:

{
  "company": "rental company name",
  "car": "car model",
  "plate": "license plate number",
  "start": "start date",
  "end": "end date",
  "dailyPrice": "daily rate as number",
  "insurance": "insurance type",
  "excess": "excess/deductible as number",
  "mileage": "mileage limit",
  "fuel": "fuel policy",
  "deposit": "deposit amount as number",
  "notes": "Only fees, penalties, or important rules. Format: short items separated by |. Example: Excess mileage AED 2/km | Late return AED 300/day | No towing | GPS tracked. Max 5 items."
}

Use null for any field you cannot find. For number fields, use 0 if not found. Extract the actual values from the document.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    let text = data.content[0].text;
    text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let extracted;
    try {
      extracted = JSON.parse(text);
    } catch {
      return res.status(200).json({ success: false, error: "Could not parse contract data", raw: text });
    }

    // Store in Redis
    await storeMarketData({
      company: extracted.company,
      car: extracted.car,
      dailyRate: parseFloat(extracted.dailyPrice) || 0,
      insurance: extracted.insurance,
      mileage: extracted.mileage,
      fuel: extracted.fuel,
      deposit: parseFloat(extracted.deposit) || 0,
      excess: parseFloat(extracted.excess) || 0,
      hiddenCosts: [],
    });

    return res.status(200).json({ success: true, data: extracted });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
