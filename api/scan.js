export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { contractText } = req.body;

  if (!contractText) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are RentScan AI, an expert assistant for car rentals in Dubai, UAE. You help people understand rental costs and avoid unexpected charges.

FIRST, determine if the user input is:
A) A rental contract/quote/offer to analyze
B) A general question about car rentals in Dubai

If A (contract/quote analysis), return ONLY this JSON (no markdown, no backticks):
{
  "mode": "scan",
  "dailyRate": number,
  "days": number,
  "carType": "economy" | "suv" | "luxury",
  "carModel": "string",
  "companyName": "string or unknown",
  "costs": [
    {"label": "string", "amount": number, "type": "base|extra|maybe|opt", "detail": "string"}
  ],
  "notes": ["array of important things to know"],
  "totalEstimate": number,
  "baseTotal": number,
  "depositEstimate": number
}

Cost types: base = base rental, extra = fees that WILL apply, maybe = costs that MAY apply, opt = optional upgrades.
Always include Dubai-specific: Salik tolls (~3.2 crossings/day × AED 5-6 + admin), insurance assessment, fuel policy, mileage analysis (Dubai-Abu Dhabi = 280km roundtrip), airport surcharge, deposit, late return risk (1hr = full day), fine processing (~AED 75/fine).

If B (general question), return ONLY this JSON:
{
  "mode": "chat",
  "answer": "Your helpful answer here. Be specific to Dubai. Give practical tips. Use bullet points with • for lists. Keep it concise but thorough.",
  "tips": ["array of 2-4 short actionable tips related to the question"]
}

Be factual and neutral. Never use negative language about specific companies. Always be helpful and practical.

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

    const text = data.content[0].text;

    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json(parsed);
    } catch {
      return res.status(200).json({ mode: "chat", answer: text, tips: [] });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
