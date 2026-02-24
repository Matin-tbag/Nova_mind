// ==== server.js ====
const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
require("dotenv").config(); // بارگذاری .env

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENROUTER_KEY; // کلید API از .env

app.post("/api/chat", async (req, res) => {
  const { model, messages } = req.body;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, messages })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
