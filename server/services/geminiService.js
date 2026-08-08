const { GoogleGenerativeAI } = require('@google/generative-ai')

// ---------------------------------------------------------------------------
// Gemini client
// dotenv.config() is called in server.js before this module is imported,
// so process.env.GEMINI_API_KEY is guaranteed to be populated here.
// ---------------------------------------------------------------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ---------------------------------------------------------------------------
// Model configuration
//
// Primary model comes from the environment so it can be changed without
// touching code.  Falls back to 'gemini-flash-latest' if not set.
//
// FALLBACK_MODELS is tried in order when the primary model exhausts all
// retries with 503 / 429 responses.  All entries are current, non-deprecated
// Flash-class models as of July 2026.
// ---------------------------------------------------------------------------
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest'

const FALLBACK_MODELS = [
  'gemini-flash-latest',
].filter((m) => m !== PRIMARY_MODEL) // don't retry the model that already failed

// Exponential backoff delays in ms: 2s, 4s, 8s, 16s
const BACKOFF_MS = [1000, 2000]

// ---------------------------------------------------------------------------
// cleanTranscript
//
// Normalises whitespace before the transcript is sent to Gemini.
// This reduces token count without altering meaning or punctuation.
//
// Rules applied (in order):
//   1. Trim leading/trailing whitespace.
//   2. Collapse runs of 2+ blank lines into a single newline.
//   3. Collapse runs of 2+ spaces (on the same line) into one space.
//
// The original transcript is NOT modified here — the caller stores the raw
// value in MongoDB and only passes the cleaned version to buildPrompt.
//
// @param {string} text — raw transcript as submitted by the user
// @returns {string}    — whitespace-normalised transcript
// ---------------------------------------------------------------------------
const cleanTranscript = (text) =>
  text
    .trim()
    .replace(/\n{3,}/g, '\n\n')   // 3+ consecutive newlines → 2 (one blank line)
    .replace(/\n\n+/g, '\n')      // 2 consecutive newlines → 1
    .replace(/[ \t]{2,}/g, ' ')   // 2+ spaces/tabs on a line → single space

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------
const buildPrompt = (transcript) => `
Analyse this transcript. Reply with ONLY a raw JSON object — no markdown, no code fences, no extra text.

Required shape:
{"summary":"2-4 sentence paragraph","keyPoints":["4-8 concise points"],"actionItems":["tasks/follow-ups; empty array if none"],"quizQuestions":[{"question":"...","options":["Option A","Option B","Option C","Option D"],"correctAnswer":"One of the four options"}],"flashcards":[{"question":"...","answer":"..."}]}

Rules:
- summary=2-4 sentences
- keyPoints=4-8 items
- actionItems=[] if none
- quizQuestions=5-8 multiple-choice questions; each must have exactly 4 options; correctAnswer must be one of those 4 options verbatim; the other 3 options must be plausible distractors; test conceptual understanding, not word matching; no duplicate questions
- flashcards=5-8 pairs covering the most important concepts; each card must have a short, focused question and a concise answer suitable for spaced-repetition study

Transcript:
${transcript}
`.trim()

// ---------------------------------------------------------------------------
// callModel
//
// Attempts to call a single Gemini model with exponential backoff.
// Returns the raw text on success.
// Throws the last error when all retries are exhausted.
//
// @param {string} modelName  — the Gemini model string to call
// @param {string} prompt     — the fully built prompt
// @returns {Promise<string>} — raw text from Gemini
// ---------------------------------------------------------------------------
const callModel = async (modelName, prompt) => {
  const model = genAI.getGenerativeModel({ model: modelName })
  let lastError

  for (let attempt = 0; attempt <= BACKOFF_MS.length; attempt++) {
    console.log(
      `[geminiService] model="${modelName}" attempt=${attempt + 1}/${BACKOFF_MS.length + 1}`
    )

    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      console.log(`[geminiService] model="${modelName}" succeeded on attempt ${attempt + 1}`)
      return text
    } catch (err) {
      lastError = err
      const status = err?.status ?? err?.httpStatus ?? null

      console.warn(
        `[geminiService] model="${modelName}" attempt=${attempt + 1} failed — ` +
        `HTTP ${status ?? 'unknown'}: ${err.message}`
      )

      // 429 = quota exceeded — retrying is pointless and just wastes time.
      // Fail immediately with a friendly message.
      if (status === 429) {
        console.error(
          `[geminiService] model="${modelName}" quota exceeded (HTTP 429) — not retrying`
        )
        const quotaError = new Error(
          'The AI service has reached its daily request limit. Please try again later.'
        )
        quotaError.status = 429
        throw quotaError
      }

      // Only retry on transient server overload (503)
      const isRetriable = status === 503 || status === 500
      if (isRetriable && attempt < BACKOFF_MS.length) {
        const wait = BACKOFF_MS[attempt]
        console.warn(
          `[geminiService] retrying model="${modelName}" in ${wait}ms ` +
          `(retry ${attempt + 1}/${BACKOFF_MS.length})...`
        )
        await new Promise((resolve) => setTimeout(resolve, wait))
        continue
      }

      // Non-retriable error or retries exhausted — stop for this model
      break
    }
  }

  throw lastError
}

// ---------------------------------------------------------------------------
// parseAndValidate
//
// Strips any stray markdown fences, parses JSON, and validates required keys.
//
// @param {string} rawText
// @returns {{ summary, keyPoints, actionItems, quizQuestions }}
// ---------------------------------------------------------------------------
const parseAndValidate = (rawText) => {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    console.error('[geminiService] Unparseable Gemini response:\n', rawText)
    throw new Error(
      'Gemini returned a response that could not be parsed as JSON. ' +
      'Check server logs for the raw response.'
    )
  }

  const required = ['summary', 'keyPoints', 'actionItems', 'quizQuestions', 'flashcards']
  for (const key of required) {
    if (!(key in parsed)) {
      throw new Error(`Gemini response is missing required field: "${key}"`)
    }
  }

  // ---------------------------------------------------------------------------
  // Validate and normalise quizQuestions
  //
  // Each item must be:  { question: string, options: string[4], correctAnswer: string }
  // where correctAnswer is one of the four options verbatim.
  //
  // Items that fail validation are dropped rather than throwing so that a
  // partially valid response still saves the remaining fields.
  // ---------------------------------------------------------------------------
  const rawQuiz = Array.isArray(parsed.quizQuestions) ? parsed.quizQuestions : []
  const validatedQuiz = rawQuiz.filter((q, idx) => {
    if (typeof q?.question !== 'string' || !q.question.trim()) {
      console.warn(`[geminiService] quizQuestions[${idx}]: missing "question" — dropping`)
      return false
    }
    if (!Array.isArray(q.options) || q.options.length !== 4 ||
        !q.options.every((o) => typeof o === 'string' && o.trim())) {
      console.warn(`[geminiService] quizQuestions[${idx}]: "options" must be array of 4 strings — dropping`)
      return false
    }
    if (typeof q?.correctAnswer !== 'string' || !q.options.includes(q.correctAnswer)) {
      console.warn(`[geminiService] quizQuestions[${idx}]: "correctAnswer" not found in "options" — dropping`)
      return false
    }
    return true
  })

  // Validate flashcards array length (5–8 items expected)
  if (!Array.isArray(parsed.flashcards) || parsed.flashcards.length < 1) {
    // Treat a missing or empty array as a soft failure — fall back to empty
    // rather than throwing, so a partial response still saves the other fields.
    parsed.flashcards = []
  }

  return {
    summary:       parsed.summary    ?? '',
    keyPoints:     Array.isArray(parsed.keyPoints)    ? parsed.keyPoints    : [],
    actionItems:   Array.isArray(parsed.actionItems)  ? parsed.actionItems  : [],
    quizQuestions: validatedQuiz,
    flashcards:    parsed.flashcards ?? [],
  }
}

// ---------------------------------------------------------------------------
// summariseTranscript  (public API)
//
// Tries the primary model with full exponential backoff (2s → 4s → 8s → 16s).
// If the primary model fails entirely on 503/429, walks through FALLBACK_MODELS
// in order, each with the same backoff sequence.
// Throws only when every model in the chain has been exhausted.
//
// @param {string} transcript — raw lecture / meeting text
// @returns {Promise<{summary, keyPoints, actionItems, quizQuestions}>}
// ---------------------------------------------------------------------------
const summariseTranscript = async (transcript) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }

  const prompt = buildPrompt(cleanTranscript(transcript))
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS]

  console.log(`[geminiService] Starting summarisation — primary model: "${PRIMARY_MODEL}"`)
  if (FALLBACK_MODELS.length) {
    console.log(`[geminiService] Fallback chain: ${FALLBACK_MODELS.join(' → ')}`)
  }

  let lastError
  for (const modelName of modelsToTry) {
    try {
      console.log(`[geminiService] Trying model: "${modelName}"`)
      const rawText = await callModel(modelName, prompt)
      const result = parseAndValidate(rawText)
      console.log(`[geminiService] ✓ Final model selected: "${modelName}"`)
      return result
    } catch (err) {
      lastError = err
      const status = err?.status ?? err?.httpStatus ?? null
      console.error(
        `[geminiService] Model "${modelName}" exhausted — ` +
        `HTTP ${status ?? 'unknown'}: ${err.message}`
      )

      // Only fall through to the next model for transient server overload (503).
      // 429 means the API key quota is exhausted — trying another model string
      // won't help because they all share the same key.
      const isOverload = status === 503 || status === 500
      if (!isOverload) {
        console.error('[geminiService] Non-retriable error — stopping fallback chain')
        throw err   // preserve the original error (including the friendly 429 message)
      }

      console.warn(`[geminiService] Falling back to next model in chain...`)
    }
  }

  // Every model in the chain failed
  throw new Error(
    `All Gemini models exhausted after retries. Last error: ${lastError?.message}`
  )
}

module.exports = { summariseTranscript }
