const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

async function chat(messages, systemPrompt = null) {
  const allMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: allMessages,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content.trim();
}

// Safely parse JSON — strip markdown fences if model adds them
function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

module.exports = { chat, parseJSON };
