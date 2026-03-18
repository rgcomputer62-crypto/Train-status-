
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { trainNo } = req.query;
  if (!trainNo || !/^\d{4,5}$/.test(trainNo)) {
    return res.status(400).json({ error: "Invalid train number" });
  }

  try {
    // NTES Official Indian Railways API
    const url = `https://www.ntes.in/ntes/trainEnquiry/trainRunningStatus?trainNo=${trainNo}&lang=en`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-IN,en;q=0.9",
        "Referer": "https://www.ntes.in/",
        "Origin": "https://www.ntes.in"
      }
    });

    if (response.ok) {
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data && !data.errorMessage) {
          return res.status(200).json({ source: "ntes", data });
        }
      } catch {}
    }

    // Fallback 1: whereismytrain
    const r2 = await fetch(`https://api.whereismytrain.in/live-status?trainNumber=${trainNo}`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
    });
    if (r2.ok) {
      const d2 = await r2.json();
      if (d2 && !d2.error) return res.status(200).json({ source: "whereismytrain", data: d2 });
    }

    // Fallback 2: etrain.in
    const r3 = await fetch(`https://etrain.info/in?ajax=1&action=liveStatus&trainNo=${trainNo}`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
    });
    if (r3.ok) {
      const d3 = await r3.json();
      if (d3 && !d3.error) return res.status(200).json({ source: "etrain", data: d3 });
    }

    return res.status(404).json({ error: "Train not found or live data unavailable", trainNo });

  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
