export default async function handler(req, res) {
  // CORS headers — allow browser to call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { trainNo } = req.query;

  if (!trainNo || !/^\d{4,5}$/.test(trainNo)) {
    return res.status(400).json({ error: "Invalid train number" });
  }

  try {
    const today = new Date();
    const dep = today.getFullYear()
      + String(today.getMonth() + 1).padStart(2, "0")
      + String(today.getDate()).padStart(2, "0");

    const url = `https://indian-railway-irctc.p.rapidapi.com/api/trains/v1/train/status?departure_date=${dep}&isH5=true&client=web&deviceIdentifier=Mozilla%2520Firefox-138.0.0.0&train_number=${trainNo}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type":    "application/json",
        "x-rapid-api":     "rapid-api-database",
        "X-RapidAPI-Host": "indian-railway-irctc.p.rapidapi.com",
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
