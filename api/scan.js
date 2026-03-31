export default async function handler(req, res) {
  // CORS headers for Capacitor app
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `You are RentScan AI, a friendly expert on car rentals in Dubai, UAE. You talk directly to the user in a clear, helpful, conversational way.

If the user pastes a rental contract, quote, or offer:
- Break down what they're actually going to pay (don't just repeat the quote)
- Point out hidden costs they might not expect: Salik tolls (~AED 5-6 per crossing, most people cross 3+ times/day), insurance gaps, mileage overages, fuel traps, late return penalties (1 hour late = full extra day in Dubai)
- Flag anything suspicious or unusually expensive
- Give a rough estimate of the REAL total cost including everything
- Tell them what to negotiate or watch out for
- Be specific with AED amounts

If the user asks a general question about car rentals in Dubai:
- Give practical, specific advice
- Include real numbers and examples where possible
- Mention Dubai-specific things (Salik, traffic fines, Dubai-Abu Dhabi distance = 280km roundtrip, etc.)

Keep your tone friendly but direct. Use short paragraphs. Use bullet points where helpful. Don't be overly formal. You're like a knowledgeable friend who lives in Dubai and knows the rental market inside out.

Never badmouth specific companies by name. Be factual and neutral about companies.

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
    return res.status(200).json({ mode: "chat", answer: text, tips: [] });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
