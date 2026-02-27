import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = 3000;

// ======================
// Middleware
// ======================

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

// Basic Security Header
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// ======================
// API Route
// ======================

app.post("/api/chat", async (req, res) => {
  try {
    const { model, messages } = req.body;

    // Validate input
    if (!model || !messages) {
      return res.status(400).json({
        error: "Model or messages missing"
      });
    }

    if (!process.env.OPENROUTER_KEY) {
      return res.status(500).json({
        error: "API key not configured"
      });
    }

    // Timeout controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: "Upstream API error",
        detail: errText
      });
    }

    const data = await response.json();
    return res.json(data);

  } catch (err) {

    if (err.name === "AbortError") {
      return res.status(408).json({
        error: "Request Timeout"
      });
    }

    console.error("Server Error:", err);

    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

// ======================
// 404
// ======================

app.use((req, res) => {
  res.status(404).json({ error: "Route Not Found" });
});

// ======================
// Start Server
// ======================

app.listen(PORT, () => {
  console.log(`🚀 Nova Mind running on http://localhost:${PORT}`);
});
