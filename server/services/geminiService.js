const { GoogleGenerativeAI } = require('@google/generative-ai')

// Initialise the Gemini client once at module load.
// The API key is read from the environment — never hard-coded.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Use a supported Gemini model
const MODEL_NAME = 'gemini-flash-latest'

/**
 * The exact JSON shape we demand from Gemini.
 * Keeping it here makes it easy to adjust the schema in one place.
 */
const RESPONSE_SCHEMA = `{
  "summary": "<2-4 sentence paragraph>",
  "keyPoints": ["<point>", "..."],
  "actionItems": ["<task>", "..."],
  "quizQuestions": [
    { "question": "<question text>", "answer": "<answer text>" }
  ]
}`

/**
 * Build the prompt.
 * We instruct Gemini explicitly to return ONLY raw JSON — no markdown fences,
 * no explanatory text — so the response can be passed directly to JSON.parse().
 */
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

/**
 * summariseTranscript
 *
 * Sends the transcript to Gemini and returns a structured object.
 *
 * @param {string} transcript — raw lecture / meeting text
 * @returns {Promise<{summary, keyPoints, actionItems, quizQuestions}>}
 * @throws  Error with a descriptive message if the API call or JSON parse fails
 */
const summariseTranscript = async (transcript) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }

  const model = genAI.getGenerativeModel({ model: MODEL_NAME })
  console.log("Using model:", MODEL_NAME);
console.log("Using key:", process.env.GEMINI_API_KEY.substring(0, 10));

  const prompt = buildPrompt(transcript)

  // Retry logic for transient server errors (503) and rate limits (429).
  // Attempts: initial try + up to 3 retries with exponential backoff
  const maxRetries = 3
  const backoffs = [1000, 2000, 4000] // ms

  let rawText
  let lastError
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt)
      rawText = result.response.text()
      lastError = null
      break
    } catch (apiError) {
      lastError = apiError
      const status = apiError && apiError.status

      // Only retry for temporary server errors (503) or rate limit backoff (429)
      if ((status === 503 || status === 429) && attempt < maxRetries) {
        const wait = backoffs[attempt] ?? 1000
        console.warn(
          `Gemini temporary error (status ${status}). retry ${attempt + 1}/${maxRetries} after ${wait}ms.`
        )
        await new Promise((res) => setTimeout(res, wait))
        continue
      }

      // Non-retriable or out of retries — log and surface the error
      console.log('FULL GEMINI ERROR:')
      console.dir(apiError, { depth: null })
      throw new Error(`Gemini API error: ${apiError.message}`)
    }
  }

  if (!rawText && lastError) {
    console.log('FULL GEMINI ERROR:')
    console.dir(lastError, { depth: null })
    throw new Error(`Gemini API error: ${lastError.message}`)
  }
  // Strip any accidental markdown fences Gemini might still add
  // e.g. ```json ... ``` or ``` ... ```
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // Log the raw response to help debug prompt/model issues
    console.error('Gemini raw response (unparseable):\n', rawText)
    throw new Error(
      'Gemini returned a response that could not be parsed as JSON. ' +
      'Check server logs for the raw response.'
    )
  }

  // Validate that all expected keys are present
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

module.exports = { summariseTranscript }
