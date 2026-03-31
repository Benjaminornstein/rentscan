// Upstash Redis helper (no SDK needed)
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
  const entry = { ...data, timestamp: new Date().toISOString(), id: Date.now().toString(36) };
  const key = `market:${data.company.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  await redis(["LPUSH", key, JSON.stringify(entry)]);
  await redis(["LTRIM", key, "0", "99"]);
  await redis(["SADD", "market:companies", data.company]);
  await redis(["INCR", "market:total_scans"]);
}

async function storeTerms(company, url, termsText) {
  if (!company || !termsText) return;
  const key = `terms:${company.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  const entry = {
    company,
    url,
    terms: termsText.substring(0, 50000),
    timestamp: new Date().toISOString(),
  };
  await redis(["SET", key, JSON.stringify(entry)]);
  await redis(["SADD", "terms:companies", company]);
}

async function getMarketContext() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return "";
  try {
    const companiesRes = await redis(["SMEMBERS", "market:companies"]);
    if (!companiesRes?.result?.length) return "";
    const insights = [];
    for (const company of companiesRes.result.slice(0, 20)) {
      const key = `market:${company.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const entriesRes = await redis(["LRANGE", key, "0", "9"]);
      if (!entriesRes?.result?.length) continue;
      const entries = entriesRes.result.map(e => { try { return JSON.parse(e); } catch { return null; } }).filter(Boolean);
      if (!entries.length) continue;
      const rates = entries.filter(e => e.dailyRate > 0).map(e => e.dailyRate);
      const avgRate = rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : null;
      const hiddenCosts = [...new Set(entries.flatMap(e => e.hiddenCosts || []))];
      const insuranceTypes = [...new Set(entries.map(e => e.insurance).filter(Boolean))];
      let summary = `${company}: ${entries.length} reports`;
      if (avgRate) summary += `, avg AED ${avgRate}/day`;
      if (hiddenCosts.length) summary += `, known costs: ${hiddenCosts.join(", ")}`;
      if (insuranceTypes.length) summary += `, insurance: ${insuranceTypes.join(", ")}`;
      insights.push(summary);
    }
    if (!insights.length) return "";
    return `\n\nMARKET INTELLIGENCE FROM PREVIOUS SCANS (use this to give better advice):\n${insights.join("\n")}`;
  } catch { return ""; }
}

function extractUrl(text) {
  const urlMatch = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/i);
  return urlMatch ? urlMatch[0] : null;
}

async function fetchUrlContent(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RentScan/1.0)",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, " ")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
    return text.substring(0, 30000);
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let { contractText } = req.body;
  if (!contractText) return res.status(400).json({ error: "No text provided" });

  const url = extractUrl(contractText);
  let fetchedContent = null;
  let isUrlScan = false;

  if (url) {
    isUrlScan = true;
    fetchedContent = await fetchUrlContent(url);
    if (fetchedContent) {
      contractText = `The user shared this URL: ${url}\n\nHere is the content from that page:\n\n${fetchedContent}\n\nUser's message: ${contractText}`;
    } else {
      contractText = `The user shared this URL: ${url} but the content could not be loaded. Please let them know and answer based on the URL/company name if recognizable.\n\nUser's message: ${contractText}`;
    }
  }

  try {
    const marketContext = await getMarketContext();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content: `You are RentScan AI, a forensic expert on car rental contracts in Dubai, UAE. Your job is to find EVERY concrete cost, fee, penalty and rule that could cost a renter money. You talk directly to the user in a clear, helpful, conversational way.

CRITICAL RULES FOR ANALYSIS:
1. Find EVERY specific AED amount mentioned — late fees, admin fees, penalties, deposits, Salik charges, fine processing fees, black point fees, cancellation fees, etc.
2. Find EVERY policy that could cost money — mileage limits, fuel policy, grace periods, insurance exclusions, age surcharges, geographic restrictions
3. Be SPECIFIC — always quote the exact AED amount and the exact clause/condition
4. NEVER say "amounts not specified" if the document DOES contain specific amounts — read carefully
5. For terms & conditions pages: these contain the REAL rules, not marketing — dig deep into every clause

If the user pastes a rental contract, quote, or offer:
- List EVERY specific fee with its exact AED amount
- Calculate the real total cost including all extras
- Point out what's NOT covered by insurance
- Flag unusual or harsh terms
- Compare with Dubai market norms if possible

If the user shared a URL with terms and conditions:
- Extract EVERY specific fee, charge, and penalty with exact AED amounts
- List insurance exclusions (what's NOT covered)
- Explain the late return policy with exact fees
- Explain the damage/accident policy with exact excess amounts
- Note age restrictions and surcharges
- Highlight cancellation and refund policies
- Flag any unusually harsh or one-sided terms
- Summarize the most expensive surprises a renter could face

If the user asks a general question about car rentals in Dubai:
- Give practical, specific advice with real numbers
- Mention Dubai-specific things (Salik, traffic fines, distances, etc.)

Keep your tone friendly but thorough. Be the most detailed rental contract analyst possible. Use bullet points for fees and penalties. Group them by category.

Never badmouth specific companies by name. Be factual and neutral.
${marketContext}

IMPORTANT: After your response, add market data extraction on a new line. For the company name, use the company name exactly as it appears on their website or branding (e.g. "Octane Club Premium Rental" not just "Octane", "Hertz UAE" not "Hertz International LLC"). Extract ALL fees and penalties found as hiddenCosts entries.

---MARKET_DATA---
{"company":"short company name or null","car":"car model or null","dailyRate":number or 0,"insurance":"insurance type or null","mileage":"mileage limit or null","fuel":"fuel policy or null","deposit":number or 0,"excess":number or 0,"hiddenCosts":["list every specific fee/penalty with AED amounts AND every unusual/noteworthy rule or clause e.g. GPS tracking, remote immobilization, car reported stolen if late, age restrictions, geographic limits, insurance exclusions, cancellation rules, deposit forfeiture"],"rentalDays":number or 0}
---END_MARKET_DATA---

User input:
${contractText}`
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    let text = data.content[0].text;

    const marketMatch = text.match(/---MARKET_DATA---\s*([\s\S]*?)\s*---END_MARKET_DATA---/);
    if (marketMatch) {
      text = text.replace(/\s*---MARKET_DATA---[\s\S]*?---END_MARKET_DATA---\s*/, "").trim();
      try {
        const marketData = JSON.parse(marketMatch[1].trim());
        if (marketData && marketData.company) {
          await storeMarketData(marketData);
          if (isUrlScan && fetchedContent && marketData.company) {
            await storeTerms(marketData.company, url, fetchedContent);
          }
        }
      } catch {}
    }

    return res.status(200).json({ mode: "chat", answer: text, tips: [] });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
