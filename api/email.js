export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { to, subject, html, attachment } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: "Missing: to or subject" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    const emailBody = {
      from: { email: "noreply@rentscan.ae", name: "RentScan" },
      to: [{ email: to }],
      subject: subject,
      html: html || "<p>Your RentScan dossier is attached.</p>",
    };

    // Add dossier as attachment if provided
    if (attachment) {
      emailBody.attachments = [{
        content: attachment.content, // base64 encoded
        filename: attachment.filename || "RentScan-Dossier.html",
        disposition: "attachment",
      }];
    }

    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (response.status === 202 || response.status === 200) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json();
    return res.status(500).json({ error: data.message || "Failed to send email" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
