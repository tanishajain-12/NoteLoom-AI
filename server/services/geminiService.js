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
const BACKOFF_MS = [2000, 4000, 8000, 16000]

// ---------------------------------------------------------------------------
// JSON schema Gemini must follow
// ---------------------------------------------------------------------------
const RESPONSE_SCHEMA = `{
  "summary": "<2-4 sentence paragraph>",
  "keyPoints": ["<point>", "..."],
  "actionItems": ["<task>", "..."],
  "quizQuestions": [
    { "question": "<question text>", "answer": "<answer text>" }
  ]
}`

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------
const buildPrompt = (transcript) => `
You are an expert note-taking assistant.
Analyse the following lecture or meeting transcript and respond with ONLY valid JSON.
Do NOT include markdown code fences, backticks, or any text outside the JSON object.

Required JSON shape:
${RESPONSE_SCHEMA}

Rules:
- "summary"       : 2–4 sentence paragraph covering the main topic.
- "keyPoints"     : 4–8 bullet points, each a single concise sentence.
- "actionItems"   : concrete tasks or follow-ups mentioned; empty array if none.
- "quizQuestions" : 3–5 question/answer pairs that test understanding.

Transcript:
"""
${transcript}
"""
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

      // Only retry on transient overload errors
      const isRetriable = status === 503 || status === 429
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

  const required = ['summary', 'keyPoints', 'actionItems', 'quizQuestions']
  for (const key of required) {
    if (!(key in parsed)) {
      throw new Error(`Gemini response is missing required field: "${key}"`)
    }
  }

  return {
    summary:       parsed.summary       ?? '',
    keyPoints:     parsed.keyPoints     ?? [],
    actionItems:   parsed.actionItems   ?? [],
    quizQuestions: parsed.quizQuestions ?? [],
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

  const prompt = buildPrompt(transcript)
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

      // Only fall through to the next model for overload errors
      const isOverload = status === 503 || status === 429
      if (!isOverload) {
        console.error('[geminiService] Non-retriable error — stopping fallback chain')
        throw new Error(`Gemini API error (${modelName}): ${err.message}`)
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
