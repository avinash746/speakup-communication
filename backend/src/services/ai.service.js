const fetch = require('node-fetch');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const TONE_DESCRIPTIONS = {
  professional: 'formal, clear, and business-appropriate',
  casual: 'friendly, conversational, and approachable',
  academic: 'scholarly, precise, and well-structured',
  persuasive: 'compelling, confident, and action-oriented',
  empathetic: 'warm, understanding, and emotionally intelligent',
  neutral: 'balanced, objective, and informative'
};

const LANGUAGE_NAMES = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  hi: 'Hindi', zh: 'Chinese', ar: 'Arabic', pt: 'Portuguese',
  ja: 'Japanese', ko: 'Korean'
};

/**
 * Core AI analysis service — powered by Groq (free tier)
 * Model: llama-3.3-70b-versatile — fast + high quality
 */
const analyzeText = async ({ text, tone = 'professional', language = 'en' }) => {
  const toneDescript = TONE_DESCRIPTIONS[tone] || 'professional';
  const langName = LANGUAGE_NAMES[language] || 'English';

  const systemPrompt = `You are SpeakUp, an expert communication coach specializing in ${langName}.
Your role is to deeply analyze text and provide actionable improvements with clear explanations.
You understand nuance, context, and the psychology of effective communication.
Always respond with valid JSON only — no markdown, no backticks, no preamble, no explanation outside the JSON.`;

  const userPrompt = `Analyze this ${langName} text and improve it to sound ${toneDescript}.

TEXT TO ANALYZE:
"${text}"

Return a JSON object with EXACTLY this structure:
{
  "improvedText": "the fully rewritten improved version",
  "summary": "2-sentence summary of the main issues found and improvements made",
  "scores": {
    "clarity": <number 0-100>,
    "tone": <number 0-100>,
    "vocabulary": <number 0-100>,
    "overall": <number 0-100>
  },
  "suggestions": [
    {
      "type": "<one of: clarity|tone|vocabulary|grammar|conciseness|structure>",
      "original": "exact phrase from the original text",
      "improved": "the improved version of that phrase",
      "explanation": "WHY this is better — explain the linguistic/psychological reason in 1-2 sentences",
      "impact": "<high|medium|low>"
    }
  ]
}

Rules:
- Provide 3-6 specific, actionable suggestions
- Each explanation must teach the user WHY, not just WHAT changed
- Scores reflect the ORIGINAL text quality (before improvement)
- overall score = weighted average (clarity 40%, tone 30%, vocabulary 30%)
- suggestions array must have at least 3 items
- Return ONLY the JSON object, nothing else`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';

  // Safe JSON parse — strip any accidental markdown fences
  const cleaned = rawText.replace(/```json\n?|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  // Validate required fields
  if (!parsed.improvedText || !parsed.scores || !Array.isArray(parsed.suggestions)) {
    throw new Error('AI returned invalid response structure');
  }

  // Ensure overall score is computed correctly if missing
  if (!parsed.scores.overall) {
    parsed.scores.overall = Math.round(
      parsed.scores.clarity * 0.4 +
      parsed.scores.tone * 0.3 +
      parsed.scores.vocabulary * 0.3
    );
  }

  return parsed;
};

module.exports = { analyzeText };