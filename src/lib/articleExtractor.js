/**
 * Server-side article extractor.
 * Fetches a URL and strips HTML to return clean article text.
 */

const STRIP_TAGS = [
  'script', 'style', 'nav', 'footer', 'header', 'aside',
  'noscript', 'iframe', 'svg', 'figure', 'figcaption', 'form',
  'button', 'select', 'option', 'input', 'textarea',
];

/**
 * Validate and extract plain text from a URL.
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function extractArticle(url) {
  // Validate URL format
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      'Invalid URL format. Please include https:// at the start.'
    );
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  // Fetch with timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  let html;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; VibeNews/1.0; news reader)',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(
        `Could not fetch the article (HTTP ${response.status}). The site may block automated requests or require a subscription.`
      );
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      throw new Error(
        'The URL does not point to an HTML page. Please paste the article text directly instead.'
      );
    }

    html = await response.text();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(
        'The request timed out. The page took too long to respond.'
      );
    }
    throw err;
  }

  return stripHtml(html);
}

/**
 * Strip HTML and extract readable article text.
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  let text = html;

  // Remove unwanted tag blocks and their contents
  for (const tag of STRIP_TAGS) {
    text = text.replace(
      new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'),
      ' '
    );
  }

  // Try to isolate the main article body
  const contentPatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
    /<div[^>]*class="[^"]*(?:article|story|post|content|body)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    /<section[^>]*class="[^"]*(?:article|story|content)[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
  ];

  for (const pattern of contentPatterns) {
    const match = pattern.exec(text);
    if (match && match[1] && match[1].length > 300) {
      text = match[1];
      break;
    }
  }

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, ' - ')
    .replace(/&ndash;/g, '-')
    .replace(/&hellip;/g, '...')
    .replace(/&#\d+;/g, ' ');

  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Truncate to stay within token limits (approx 8 000 chars = ~2 000 tokens)
  if (text.length > 8000) {
    text = text.slice(0, 8000) + '...';
  }

  if (text.length < 120) {
    throw new Error(
      'Could not extract article content. The page may be behind a paywall, require JavaScript, or block automated access. Try pasting the article text directly.'
    );
  }

  return text;
}
