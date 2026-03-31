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
  await redis(["SET", key, JSON.stringify({ company, url, terms: termsText.substring(0, 80000), timestamp: new Date().toISOString() })]);
  await redis(["SADD", "terms:companies", company]);
}

async function getTermsForCompany(companyName) {
  if (!companyName) return "";
  const key = `terms:${companyName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
  const result = await redis(["GET", key]);
  if (!result?.result) return "";
  try {
    const data = JSON.parse(result.result);
    return data.terms || "";
  } catch { return ""; }
}

async function findRelevantTerms(userText) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return { text: "", meta: null };
  try {
    const termsCompanies = await redis(["SMEMBERS", "terms:companies"]);
    if (!termsCompanies?.result?.length) return { text: "", meta: null };
    const textLower = userText.toLowerCase();
    for (const company of termsCompanies.result) {
      if (textLower.includes(company.toLowerCase())) {
        const key = `terms:${company.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const result = await redis(["GET", key]);
        if (!result?.result) continue;
        try {
          const data = JSON.parse(result.result);
          if (!data.terms) continue;
          const storedDate = data.timestamp ? new Date(data.timestamp) : null;
          const ageDays = storedDate ? Math.floor((Date.now() - storedDate.getTime()) / 86400000) : null;
          const dateStr = storedDate ? storedDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "unknown date";

          let ageNote = "";
          if (ageDays !== null && ageDays > 60) {
            ageNote = " (WARNING: " + ageDays + " days old, may be outdated)";
          } else if (ageDays !== null && ageDays > 14) {
            ageNote = " (" + ageDays + " days ago, user should verify)";
          }

          const ctx = `\n\nSTORED TERMS & CONDITIONS FOR ${company.toUpperCase()}\nReviewed on ${dateStr}${ageNote}.${data.url ? " Source: " + data.url : ""}\nTHIS DATA HAS PRIORITY over your general knowledge. Use exact AED amounts from these terms. Always tell the user the review date and that they should verify with the company.\n\n${data.terms.substring(0, 40000)}`;

          return { text: ctx, meta: { company, date: dateStr, url: data.url || null, ageDays: ageDays || 0 } };
        } catch { continue; }
      }
    }
    return { text: "", meta: null };
  } catch { return { text: "", meta: null }; }
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
      let summary = `${company}: ${entries.length} reports`;
      if (avgRate) summary += `, avg AED ${avgRate}/day`;
      if (hiddenCosts.length) summary += `, known costs: ${hiddenCosts.join("; ")}`;
      insights.push(summary);
    }
    return insights.length ? `\n\nMARKET INTELLIGENCE FROM PREVIOUS SCANS:\n${insights.join("\n")}` : "";
  } catch { return ""; }
}

function extractUrl(text) {
  const m = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/i);
  return m ? m[0] : null;
}

async function fetchUrlContent(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    let html = await res.text();
    html = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
      .replace(/<form[^>]*>[\s\S]*?<\/form>/gi, "")
      .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, "")
      .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
      .replace(/<button[^>]*>[\s\S]*?<\/button>/gi, "")
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<img[^>]*>/gi, "")
      .replace(/<link[^>]*>/gi, "")
      .replace(/<meta[^>]*>/gi, "")
      .replace(/<input[^>]*>/gi, "");
    let text = html
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, " ").trim();
    const parts = text.split(/(?<=[.!?])\s+/);
    const seen = new Set();
    const filtered = [];
    for (const part of parts) {
      const t = part.trim();
      if (t.length < 3 || seen.has(t)) continue;
      seen.add(t);
      const arabicCount = (t.match(/[\u0600-\u06FF]/g) || []).length;
      if (arabicCount > t.length * 0.3) continue;
      filtered.push(t);
    }
    text = filtered.join(" ");
    return text.length > 100 ? text.substring(0, 60000) : null;
  } catch { return null; }
}

const SYSTEM_PROMPT = `You are RentScan AI, a forensic expert on car rental contracts in Dubai, UAE. Your job is to find EVERY concrete cost, fee, penalty and rule that could cost a renter money. You talk directly to the user in a clear, helpful way.

LANGUAGE RULE: Always respond in English only. Never mix languages.

ANALYSIS RULES:
1. Find EVERY specific AED amount — late fees, admin fees, penalties, deposits, Salik charges, fine processing fees, black point fees, cancellation fees, damage excess, early termination, etc.
2. Find EVERY policy that could cost money — mileage limits, fuel policy, grace periods, insurance exclusions, age surcharges, geographic restrictions, vehicle tracking/immobilization
3. Be SPECIFIC — always quote the exact AED amount and the condition that triggers it
4. NEVER say "amounts not specified" if the document DOES contain specific amounts — read the ENTIRE document carefully
5. Group findings by category: Fees & Penalties, Insurance & Liability, Restrictions & Rules, Cancellation & Refunds

IMPORTANT: If you have STORED TERMS & CONDITIONS for a company below, USE THEM to answer the user's question with specific fees, penalties, and AED amounts from those terms. This is your database — treat it as authoritative data you already know.

For contracts/quotes: calculate real total cost with all extras.
For terms & conditions: extract EVERY fee, penalty, rule and noteworthy clause.
For general questions: give practical advice with real Dubai numbers. If you have stored terms for a mentioned company, cite specific fees from those terms.
For follow-up questions: answer based on the conversation context and any stored data you have.

Be factual and neutral about companies. Never badmouth by name.

TERMS DATA RULES:
- Stored terms have PRIORITY over your general knowledge. Use exact AED amounts from the terms.
- Always state: "Based on [Company]'s terms as published on their website, reviewed on [date]."
- Always end terms-based answers with: "Terms can change at any time. Verify directly with the company before signing."
- NEVER present stored terms as "current" — frame as "as of [date]".
- Never invent AED amounts. If unsure, say so.`;

const MARKET_DATA_INSTRUCTION = `

IMPORTANT: After your response, extract market data as JSON on a new line. Use the company name exactly as it appears on their website branding. Extract ALL fees and penalties as hiddenCosts. If this is a follow-up question with no new data to extract, output null.

---MARKET_DATA---
{"company":"company name or null","car":"car model or null","dailyRate":number or 0,"insurance":"insurance type or null","mileage":"mileage limit or null","fuel":"fuel policy or null","deposit":number or 0,"excess":number or 0,"hiddenCosts":["every fee/penalty with AED amounts AND every unusual rule or clause"],"rentalDays":number or 0}
---END_MARKET_DATA---`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let { contractText, messages } = req.body;

  // Need either contractText (first message) or messages (conversation)
  if (!contractText && (!messages || !messages.length)) {
    return res.status(400).json({ error: "No text provided" });
  }

  // Build the full text to search for URLs and company names
  // Use contractText for first message, or the last user message for follow-ups
  let searchText = contractText || "";
  if (messages && messages.length) {
    // Combine all user messages for context search (terms lookup, URL detection)
    searchText = messages.filter(m => m.role === "user").map(m => m.content).join(" ");
  }

  // URL detection and fetching (only on first message)
  const url = contractText ? extractUrl(contractText) : null;
  let fetchedContent = null;
  let isUrlScan = false;
  let firstUserContent = contractText || "";

  if (url) {
    isUrlScan = true;
    fetchedContent = await fetchUrlContent(url);
    if (fetchedContent) {
      firstUserContent = `The user shared this URL: ${url}\n\nContent from the page:\n\n${fetchedContent}\n\nOriginal message: ${contractText}`;
    } else {
      firstUserContent = `The user shared this URL: ${url} but the page could not be loaded. Answer based on the URL/company name if recognizable.\n\nOriginal message: ${contractText}`;
    }
  }

  try {
    const [marketContext, termsResult] = await Promise.all([
      getMarketContext(),
      findRelevantTerms(searchText),
    ]);
    const termsContext = termsResult.text;
    const termsMeta = termsResult.meta;


    // Build the system context (injected into first user message)
    const systemContext = `${SYSTEM_PROMPT}
${marketContext}${termsContext}
${MARKET_DATA_INSTRUCTION}

`;

    // Build messages array for Claude
    let claudeMessages;

    if (messages && messages.length) {
      // Conversation mode: prepend system context to the first user message
      claudeMessages = messages.map((msg, i) => {
        if (i === 0 && msg.role === "user") {
          return { role: "user", content: systemContext + msg.content };
        }
        return { role: msg.role, content: msg.content };
      });
    } else {
      // First message mode (backwards compatible)
      claudeMessages = [
        { role: "user", content: systemContext + "User input:\n" + firstUserContent }
      ];
    }

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
        messages: claudeMessages,
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    let text = data.content[0].text;

    // Extract and store market data
    text = text.replace(/```json\s*null\s*```/g, "").replace(/\bnull\b\s*$/g, "").trim();
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

    return res.status(200).json({ mode: "chat", answer: text, tips: [], termsUsed: termsMeta || null });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
