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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // POST: Store rental data from My Rental page
  if (req.method === "POST") {
    const { company, car, dailyPrice, insurance, excess, mileage, fuel, deposit } = req.body;

    if (!company) return res.status(400).json({ error: "Company name required" });

    const entry = {
      company,
      car: car || null,
      dailyRate: parseFloat(dailyPrice) || 0,
      insurance: insurance || null,
      mileage: mileage || null,
      fuel: fuel || null,
      deposit: parseFloat(deposit) || 0,
      excess: parseFloat(excess) || 0,
      hiddenCosts: [],
      source: "rental_form",
      timestamp: new Date().toISOString(),
      id: Date.now().toString(36),
    };

    const key = `market:${company.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    await redis(["LPUSH", key, JSON.stringify(entry)]);
    await redis(["LTRIM", key, "0", "99"]);
    await redis(["SADD", "market:companies", company]);
    await redis(["INCR", "market:total_rentals"]);

    return res.status(200).json({ success: true });
  }

  // GET: Return aggregated market insights
  if (req.method === "GET") {
    try {
      const companiesRes = await redis(["SMEMBERS", "market:companies"]);
      const totalScans = await redis(["GET", "market:total_scans"]);
      const totalRentals = await redis(["GET", "market:total_rentals"]);

      if (!companiesRes?.result?.length) {
        return res.status(200).json({
          totalScans: parseInt(totalScans?.result) || 0,
          totalRentals: parseInt(totalRentals?.result) || 0,
          companies: [],
        });
      }

      const companies = [];
      for (const company of companiesRes.result) {
        const key = `market:${company.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        const entriesRes = await redis(["LRANGE", key, "0", "99"]);
        if (!entriesRes?.result?.length) continue;

        const entries = entriesRes.result
          .map(e => { try { return JSON.parse(e); } catch { return null; } })
          .filter(Boolean);

        const rates = entries.filter(e => e.dailyRate > 0).map(e => e.dailyRate);
        const deposits = entries.filter(e => e.deposit > 0).map(e => e.deposit);
        const excesses = entries.filter(e => e.excess > 0).map(e => e.excess);

        companies.push({
          name: company,
          totalReports: entries.length,
          avgDailyRate: rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : null,
          minDailyRate: rates.length ? Math.min(...rates) : null,
          maxDailyRate: rates.length ? Math.max(...rates) : null,
          avgDeposit: deposits.length ? Math.round(deposits.reduce((a, b) => a + b, 0) / deposits.length) : null,
          avgExcess: excesses.length ? Math.round(excesses.reduce((a, b) => a + b, 0) / excesses.length) : null,
          insuranceTypes: [...new Set(entries.map(e => e.insurance).filter(Boolean))],
          hiddenCosts: [...new Set(entries.flatMap(e => e.hiddenCosts || []))],
          cars: [...new Set(entries.map(e => e.car).filter(Boolean))],
          lastReport: entries[0]?.timestamp,
        });
      }

      companies.sort((a, b) => b.totalReports - a.totalReports);

      return res.status(200).json({
        totalScans: parseInt(totalScans?.result) || 0,
        totalRentals: parseInt(totalRentals?.result) || 0,
        companies,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
