const express = require("express");
const router = express.Router();
const axios = require("axios");

const SYSTEM_PROMPT = `You are the official AI assistant of Safoua Academy.
Your role is strictly limited to:
- Answering educational questions.
- Recommending courses.
Rules:
1. If the user asks about anything OUTSIDE these topics, politely refuse.
2. ALWAYS structure EVERY response in this exact bilingual format:
- First write the answer in English.
- Then add a divider line: ───────────────
- Then write the exact same answer translated into Arabic (right-to-left).
3. Keep responses concise — 3 to 5 sentences per language.`;

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    // Setup Server-Sent Events (SSE) headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const ollamaRes = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        system: SYSTEM_PROMPT,
        prompt: message,
        stream: true,
      },
      { responseType: "stream" }
    );

    ollamaRes.data.on("data", (chunk) => {
      const lines = chunk.toString().split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
          }
          if (json.done) {
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
          }
        } catch (e) { /* Handle partial chunks */ }
      }
    });
  } catch (err) {
    console.error("🔥 Chat error:", err.message);
    res.end();
  }
});

module.exports = router;
