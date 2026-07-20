// src/pages/api/generate-recap.ts
import type { APIRoute } from 'astro';
import Groq from 'groq-sdk';

export const prerender = false;

const groq = new Groq({ apiKey: import.meta.env.GROQ_API_KEY });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { userData } = body; // e.g. text/summary of user's work, hours, skills

    const prompt = `
You are a witty, enthusiastic AI assistant creating a "Spotify Wrapped" style recap for a user.
Based on the following user background data, create EXACTLY 3 or 4 compelling, fun recap pages summarizing their achievements, stats, hours spent, and key milestones.

USER BACKGROUND:
${JSON.stringify(userData || "Worked 140+ hours on full-stack web dev, mastered React/Astro, solved dynamic programming problems, integrated Gemini/Groq APIs, and built cool UI animations.")}

CRITICAL RULES:
1. Output ONLY valid JSON in the specified structure.
2. Each card must have an "id" and a "content" array of strings.
3. Keep each line under 35 characters so it fits neatly on a notebook sheet.
4. Each card content should have 4 to 6 lines of engaging text, stats, and fun ascii/humor lines.

JSON OUTPUT STRUCTURE EXAMPLE:
{
  "cards": [
    {
      "id": "intro",
      "content": [
        "2026 TERM RECAP // INITIALIZED",
        "------------------------------",
        "Total Focus Time: 180+ Hrs",
        "Main Stacks: React, Astro & AI",
        "Status: Absolute Tech Demon"
      ]
    }
  ]
}
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a JSON-only response generator.' },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }, // Forces strict JSON output
      temperature: 0.7,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(responseContent);

    return new Response(JSON.stringify(parsedData.cards || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Groq API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate recap' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};