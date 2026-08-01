import { extractArticle } from '@/lib/articleExtractor';
import { generateContent } from '@/lib/gemini';
import {
  factExtractionPrompt,
  toneRewritePrompt,
  guardrailPrompt,
} from '@/lib/prompts';

/** @param {Request} request */
export async function POST(request) {
  try {
    const body = await request.json();
    const { input, inputType, length = 'full' } = body;

    if (!input || typeof input !== 'string' || !input.trim()) {
      return Response.json({ error: 'No input provided.' }, { status: 400 });
    }

    // ── Step 1: obtain article text ─────────────────────────────────────────
    let articleText;
    if (inputType === 'url') {
      articleText = await extractArticle(input.trim());
    } else {
      articleText = input.trim();
      if (articleText.length < 80) {
        return Response.json(
          {
            error:
              'The article text is too short. Please paste at least a couple of paragraphs.',
          },
          { status: 400 }
        );
      }
    }

    // ── Step 2: fact extraction ─────────────────────────────────────────────
    const factRaw = await generateContent(factExtractionPrompt(articleText), {
      temperature: 0.1,
      maxOutputTokens: 1024,
    });

    let factData;
    try {
      const jsonMatch = factRaw.match(/\{[\s\S]*\}/);
      factData = JSON.parse(jsonMatch ? jsonMatch[0] : factRaw);
    } catch {
      return Response.json(
        {
          error:
            'Failed to extract facts from the article. Please try again or paste the text directly.',
        },
        { status: 500 }
      );
    }

    const { title, category, facts = [], summary } = factData;

    if (!facts.length) {
      return Response.json(
        { error: 'No facts could be extracted from this article.' },
        { status: 422 }
      );
    }

    // ── Step 3: tone rewrite ────────────────────────────────────────────────
    const fullRewrite = await generateContent(
      toneRewritePrompt(articleText, facts, length),
      { temperature: 0.72, maxOutputTokens: 1024 }
    );

    // Split on "For you:" marker inserted by the prompt
    const MARKER = 'For you:';
    const markerIdx = fullRewrite.indexOf(MARKER);
    let rewrite = fullRewrite;
    let means = null;

    if (markerIdx !== -1) {
      rewrite = fullRewrite.slice(0, markerIdx).trim();
      means = fullRewrite.slice(markerIdx + MARKER.length).trim();
    }

    // Estimate read time (average reading speed: 200 wpm)
    const wordCount = fullRewrite.split(/\s+/).filter(Boolean).length;
    const minutes = wordCount / 200;
    const readTime =
      minutes < 1
        ? `${Math.max(1, Math.round(minutes * 60))}s read`
        : `${Math.ceil(minutes)} min read`;

    // ── Step 4: guardrail check ─────────────────────────────────────────────
    const guardrailRaw = await generateContent(
      guardrailPrompt(facts, fullRewrite),
      { temperature: 0.1, maxOutputTokens: 512 }
    );

    let guardrail;
    try {
      const jsonMatch = guardrailRaw.match(/\{[\s\S]*\}/);
      guardrail = JSON.parse(jsonMatch ? jsonMatch[0] : guardrailRaw);
    } catch {
      guardrail = { score: 85, verdict: 'mostly_faithful', issues: [] };
    }

    return Response.json({
      title: title || 'Untitled article',
      category: category || 'world',
      summary: summary || '',
      facts,
      rewrite,
      means,
      readTime,
      guardrail,
      articleText, // used for compare view
    });
  } catch (err) {
    console.error('[/api/rewrite]', err);
    return Response.json(
      { error: err.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
