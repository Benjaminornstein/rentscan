"""
RentScan Scraper v4 — 40+ bedrijven
====================================
pip install requests beautifulsoup4
python scraper.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os

API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
if not API_KEY:
    API_KEY = input("\n🔑 Plak je Anthropic API key: ").strip()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

SITES = [
    # BUDGET
    {"name": "Quick Drive", "url": "https://www.quickdrive.ae"},
    {"name": "Absolute Rent a Car", "url": "https://abrc.ae"},
    {"name": "Al Emad Cars", "url": "https://al-emadcars.com"},
    {"name": "Moosa Rent a Car", "url": "https://moosarentacar.com"},
    {"name": "Golden Key Rent Car", "url": "https://gkcarrental.ae"},
    {"name": "Royal Star Car Rental", "url": "https://royalstaruae.com"},
    {"name": "Rental Cars UAE (Amex)", "url": "https://rentalcarsuae.com"},
    {"name": "Babil Rent a Car", "url": "https://babilcar.com"},
    {"name": "Fast Rent a Car", "url": "https://fastrentacar.com"},
    {"name": "Friends Car Rental", "url": "https://friendscarrental.com"},
    {"name": "Autostrad Rent a Car", "url": "https://autostrad.com"},
    {"name": "RCD Rent a Car", "url": "https://rentacheapcardubai.com"},
    {"name": "Speedy Drive", "url": "https://www.speedydrive.ae"},

    # MID-RANGE / APP-BASED
    {"name": "Udrive", "url": "https://www.udrive.ae"},
    {"name": "eZhire", "url": "https://www.ezhire.ae"},
    {"name": "Octane Rent", "url": "https://octane.rent"},
    {"name": "Quick Lease", "url": "https://quicklease.ae"},
    {"name": "Motorkart", "url": "https://motorkart.ae"},
    {"name": "Shift Car Rental", "url": "https://shiftcarrental.com"},
    {"name": "Paramount Car Rental", "url": "https://paramountcarrental.com"},
    {"name": "Rent Any Car", "url": "https://rentanycar.ae"},
    {"name": "Saadat Rent", "url": "https://www.saadatrent.com/dubai"},
    {"name": "Renty", "url": "https://renty.ae"},

    # INTERNATIONAL BRANDS
    {"name": "Hertz UAE", "url": "https://www.hertz.ae"},
    {"name": "Europcar Dubai", "url": "https://www.europcar.com/en-ae"},
    {"name": "Sixt Dubai", "url": "https://www.sixt.ae"},
    {"name": "Budget UAE", "url": "https://www.budget-uae.com/en"},
    {"name": "Thrifty UAE", "url": "https://www.thriftyuae.com"},
    {"name": "Dollar Rent a Car", "url": "https://www.dollaruae.com"},
    {"name": "National Car Rental", "url": "https://www.nationalcar.ae"},
    {"name": "Enterprise Dubai", "url": "https://www.enterprise.com/en/car-rental/locations/united-arab-emirates.html"},
    {"name": "Diamondlease", "url": "https://www.diamondlease.com"},

    # LUXURY / PREMIUM
    {"name": "Taite Luxury", "url": "https://taiteluxurycarrental.com"},
    {"name": "Trinity Rental", "url": "https://trinityrental.com"},
    {"name": "Be VIP Rent a Car", "url": "https://beviprentacar.com"},
    {"name": "Rotana Star", "url": "https://rotanastar.ae"},
    {"name": "Prestige Car Rental", "url": "https://prestigecarrentals.ae"},
    {"name": "MK Rent a Car", "url": "https://mkrentacar.com"},
    {"name": "YoFleet", "url": "https://yofleet.com/rent-a-car-dubai"},
    {"name": "Lux Car Rental", "url": "https://luxcarrental.ae"},
    {"name": "VIP Car Rental", "url": "https://www.vipcarrental.ae"},
    {"name": "Phantom Rent a Car", "url": "https://phantomrentacar.com"},
    {"name": "Great Dubai", "url": "https://greatdubai.com"},
    {"name": "Al Muftah Rent a Car", "url": "https://almuftahrentacar.com"},
]

results = []

print(f"\n🚗 RentScan Scraper v4 — {len(SITES)} bedrijven")
print("=" * 55)

# Stap 1: Check sites
print("\n📡 Checking sites...\n")

scrapable = []
blocked = []
for site in SITES:
    try:
        resp = requests.get(site["url"], headers=HEADERS, timeout=10, allow_redirects=True)
        if resp.status_code == 200 and len(resp.text) > 1000:
            print(f"  ✅ {site['name']:30s} — OK ({len(resp.text):,} chars)")
            scrapable.append({**site, "html": resp.text})
        else:
            print(f"  ❌ {site['name']:30s} — Status {resp.status_code}")
            blocked.append(site["name"])
    except Exception as e:
        print(f"  ❌ {site['name']:30s} — {str(e)[:35]}")
        blocked.append(site["name"])

print(f"\n📊 {len(scrapable)} scrapbaar / {len(blocked)} geblokkeerd")

if not scrapable:
    print("\n⚠ Geen sites bereikbaar.")
    exit()

# Stap 2: AI analyse
input(f"\n🤖 {len(scrapable)} sites analyseren met AI (~$0.50-1.00). Druk Enter...")
print()

for i, site in enumerate(scrapable, 1):
    print(f"  [{i}/{len(scrapable)}] 🔍 {site['name']}...", end=" ", flush=True)

    soup = BeautifulSoup(site["html"], "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "iframe", "noscript", "svg"]):
        tag.decompose()
    text = soup.get_text(separator="\n", strip=True)[:6000]

    if len(text) < 100:
        print("⚠ Te weinig tekst")
        continue

    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Content-Type": "application/json",
                "x-api-key": API_KEY,
                "anthropic-version": "2023-06-01",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1000,
                "messages": [{
                    "role": "user",
                    "content": f"""Extract ALL car rental prices from this Dubai UAE company website.
Only AED prices. Return ONLY valid JSON (no markdown, no backticks):
{{
  "company": "{site['name']}",
  "website": "{site['url']}",
  "found_prices": true/false,
  "cars": [
    {{
      "model": "car model name",
      "type": "economy/sedan/suv/luxury/van/electric",
      "perDay": number in AED or null,
      "perWeek": number in AED or null,
      "perMonth": number in AED or null
    }}
  ],
  "insurance": "what is included or unknown",
  "mileage_limit": "daily km limit or unlimited or unknown",
  "deposit": "amount in AED or unknown",
  "fuel_policy": "full-to-full or other or unknown",
  "airport_fee": "amount or none or unknown",
  "min_age": number or null,
  "delivery": "free/paid/unknown",
  "google_rating": number or null,
  "notes": "promotions or other useful info"
}}

Extract as many cars as possible. If no AED prices found, set found_prices to false.

Website text:
{text}"""
                }]
            },
            timeout=30
        )

        data = resp.json()
        if "content" in data:
            raw = data["content"][0]["text"]
            cleaned = raw.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(cleaned)
            results.append(parsed)

            if parsed.get("found_prices") and parsed.get("cars"):
                n = len(parsed["cars"])
                print(f"✅ {n} auto's")
                for car in parsed["cars"][:3]:
                    print(f"     • {car.get('model','?'):25s} AED {car.get('perDay','?')}/dag")
                if n > 3:
                    print(f"     ... +{n-3} meer")
            else:
                print("⚠ Geen prijzen")
        else:
            err = data.get("error", {}).get("message", "?")
            print(f"❌ API: {err[:40]}")

    except json.JSONDecodeError:
        print("⚠ Parse error")
    except Exception as e:
        print(f"❌ {str(e)[:40]}")

    time.sleep(1.5)

# Stap 3: Opslaan
with open("rentscan_prices.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

# Samenvatting
ok = [r for r in results if r.get("found_prices") and r.get("cars")]
total = sum(len(r.get("cars", [])) for r in ok)

print(f"\n{'=' * 55}")
print(f"\n🏆 RESULTAAT:")
print(f"   ✅ {len(ok)} bedrijven met prijzen")
print(f"   🚗 {total} auto's totaal")
print(f"   ❌ {len(blocked)} geblokkeerd")

if ok:
    print(f"\n   💰 Per bedrijf:")
    for r in sorted(ok, key=lambda x: min((c.get("perDay") or 9999) for c in x["cars"])):
        n = len(r["cars"])
        low = min((c.get("perDay") or 9999) for c in r["cars"])
        print(f"     • {r['company']:25s} — {n} auto's, vanaf AED {low}/dag")

if blocked:
    print(f"\n   🔒 Geblokkeerd:")
    for b in blocked:
        print(f"     • {b}")

print(f"\n📁 Opgeslagen: rentscan_prices.json")
print(f"💡 Stuur dit bestand naar Claude → 'Update de app'")
print(f"\n✅ Klaar!")
