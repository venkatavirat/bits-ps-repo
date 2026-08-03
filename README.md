# Vibe News

An AI agent that rewrites news articles into student-friendly language while preserving every source fact.

## What it does

1. **Intake** - accept a URL or pasted article text
2. **Fact extraction** - pull out every key claim before any rewriting happens
3. **Tone rewrite** - translate into a natural, Gen Z-adjacent voice in British English
4. **Guardrail check** - verify the rewrite against the source facts and flag any distortion
5. **Shareable card** - display the result with category, read time, accuracy score, and a "compare original" view

## Setup

### Prerequisites

- Node.js 18 or above
- A [Google AI Studio](https://aistudio.google.com) API key (free tier available)

### Installation

```bash
git clone https://github.com/Anshuman0617/VibeNews
cd vibe-news
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_api_key_here
```

Get a key at [aistudio.google.com](https://aistudio.google.com) - click **Get API key**.

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Paste a news article URL (BBC, Reuters, Guardian, NYT, etc.) or switch to **Paste article text** and paste the full text
2. Choose **Quick hit** (100-150 words) or **Full take** (220-320 words)
3. Click **Rewrite this article**
4. Review the rewrite, check the accuracy score, expand **Source facts used**, or switch to **Compare original**

## Project structure

```
src/
  app/
    api/rewrite/route.js   - POST endpoint, 4-step pipeline
    components/
      VibeApp.js           - main client component, state machine
      InputForm.js         - URL / text input with validation
      LoadingState.js      - animated pipeline progress
      ResultCard.js        - result display with compare view and facts
    globals.css            - full design system (CSS custom properties)
    layout.js              - root layout
    page.js                - server component shell
  lib/
    articleExtractor.js    - server-side HTML fetcher and stripper
    gemini.js              - Gemini API client singleton
    prompts.js             - all three LLM prompt templates
```

## Sample inputs and outputs

**Input URL:** `https://www.bbc.co.uk/news/technology-...`

**Output (full take):**
> So apparently [tech company] just dropped some massive news...
> **For you:** If you use [product], this change kicks in from [date] - worth knowing before you get caught out.

**Accuracy badge:** Factually accurate (score 94/100)

## Deploying to Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add `GEMINI_API_KEY` as an environment variable in the Vercel dashboard
4. Deploy

The app runs entirely on serverless functions - no persistent server required.

## Notes

- URL extraction works on most major news sites. Paywalled or JavaScript-rendered pages may fail - use the text paste option instead.
- Three Gemini API calls are made per rewrite. With the free tier (15 requests/minute), this means ~5 rewrites per minute.
- The guardrail checks the rewrite against the extracted facts, not the full original article - so the quality of the fact extraction directly affects the guardrail score.
