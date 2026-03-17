export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { pnr } = req.query;

  if (!pnr || !/^\d{10}$/.test(pnr)) {
    return res.status(400).json({ error: "Invalid PNR number" });
  }

  try {
    const url = `https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/${pnr}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type":    "application/json",
        "X-RapidAPI-Host": "irctc-indian-railway-pnr-status.p.rapidapi.com",
        // ✏️ APNI RAPIDAPI KEY YAHAN DAALO
        "X-RapidAPI-Key":  "fffc94f970msh79ac676b3ae557dp11f294jsn1d2eebd3a87f"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "API error", status: response.status });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Server error", message: err.message });
  }
}
