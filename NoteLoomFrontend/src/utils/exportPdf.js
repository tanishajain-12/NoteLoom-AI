import { jsPDF } from 'jspdf'
import { addNotification } from './notifications'

// ---------------------------------------------------------------------------
// Colour palette — mirrors the app's brand colours
// ---------------------------------------------------------------------------
const BRAND   = [138, 77, 78]    // #8a4d4e  — headings / accents
const DARK    = [27,  28, 28]    // #1b1c1c  — body text
const MUTED   = [82,  67, 67]    // #524343  — secondary text
const RULE    = [228, 226, 225]  // #e4e2e1  — divider lines
const PAGE_BG = [251, 249, 248]  // #fbf9f8  — page background

// Layout constants (all in mm, A4 = 210 × 297)
const MARGIN   = 18
const COL_W    = 210 - MARGIN * 2   // 174 mm usable width
const LINE_H   = 6                  // standard body line height
const SMALL_H  = 5                  // compact line height

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Set RGB fill and draw colour at once */
function setColor(doc, rgb) {
  doc.setFillColor(...rgb)
  doc.setDrawColor(...rgb)
}

/** Draw a thin horizontal rule across the usable column */
function rule(doc, y) {
  doc.setDrawColor(...RULE)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, MARGIN + COL_W, y)
}

/**
 * Write wrapped text and return the new Y position.
 * Automatically adds a new page when the cursor reaches the bottom margin.
 *
 * @param {jsPDF}  doc
 * @param {string} text
 * @param {number} x        left edge
 * @param {number} y        current Y
 * @param {number} maxW     max line width in mm
 * @param {number} lineH    line height in mm
 * @param {number} bottomY  Y position that triggers a page break
 * @returns {number} updated Y position
 */
function writeWrapped(doc, text, x, y, maxW, lineH, bottomY = 272) {
  const lines = doc.splitTextToSize(String(text), maxW)
  for (const line of lines) {
    if (y > bottomY) {
      doc.addPage()
      y = MARGIN + 6
    }
    doc.text(line, x, y)
    y += lineH
  }
  return y
}

/**
 * Write a section heading with a coloured left bar and a rule underneath.
 * Returns new Y after the heading block.
 */
function sectionHeading(doc, label, y, pageBottom = 272) {
  if (y > pageBottom - 14) {
    doc.addPage()
    y = MARGIN + 6
  }

  // Accent bar
  setColor(doc, BRAND)
  doc.rect(MARGIN, y - 4, 3, 7, 'F')

  // Heading text
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...BRAND)
  doc.text(label, MARGIN + 6, y)
  y += 3

  rule(doc, y)
  y += 5

  // Reset to body style
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...DARK)

  return y
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * exportInsightsPDF
 *
 * Generates and immediately downloads a PDF containing all four AI output
 * sections (Summary, Key Points, Action Items, Quiz Questions).
 * The original transcript is intentionally excluded.
 *
 * @param {{
 *   summary:       string,
 *   keyPoints:     string[],
 *   actionItems:   string[],
 *   quizQuestions: { question: string, answer: string }[],
 *   createdAt?:    string,
 * }} data
 */
export function exportInsightsPDF(data) {
  const {
    summary       = '',
    keyPoints     = [],
    actionItems   = [],
    quizQuestions = [],
    createdAt,
  } = data

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const PAGE_BOTTOM = 277   // trigger page break before footer zone

  // ── Page background ───────────────────────────────────────────────────────
  doc.setFillColor(...PAGE_BG)
  doc.rect(0, 0, 210, 297, 'F')

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND)
  doc.rect(0, 0, 210, 22, 'F')

  // App title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('NoteLoom AI', MARGIN, 14)

  // "AI Insights" label on the right
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(255, 220, 218) // #ffdcda — light pink
  doc.text('AI Insights Export', 210 - MARGIN, 14, { align: 'right' })

  // ── Sub-header ────────────────────────────────────────────────────────────
  let y = 32

  const dateLabel = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(`Generated on ${dateLabel}`, MARGIN, y)
  y += 3

  rule(doc, y)
  y += 8

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  y = sectionHeading(doc, 'Summary', y, PAGE_BOTTOM)
  doc.setFontSize(10)
  doc.setTextColor(...MUTED)
  y = writeWrapped(doc, summary, MARGIN, y, COL_W, LINE_H, PAGE_BOTTOM)
  y += 8

  // ── KEY POINTS ────────────────────────────────────────────────────────────
  y = sectionHeading(doc, 'Key Points', y, PAGE_BOTTOM)

  if (keyPoints.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No key points available.', MARGIN, y)
    y += LINE_H
  } else {
    for (const point of keyPoints) {
      if (y > PAGE_BOTTOM - 8) { doc.addPage(); y = MARGIN + 6 }

      // Bullet circle
      setColor(doc, BRAND)
      doc.circle(MARGIN + 1.5, y - 1.2, 1, 'F')

      doc.setFontSize(10)
      doc.setTextColor(...MUTED)
      y = writeWrapped(doc, point, MARGIN + 6, y, COL_W - 6, LINE_H, PAGE_BOTTOM)
      y += 1.5
    }
  }
  y += 6

  // ── ACTION ITEMS ──────────────────────────────────────────────────────────
  y = sectionHeading(doc, 'Action Items', y, PAGE_BOTTOM)

  if (actionItems.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No action items found.', MARGIN, y)
    y += LINE_H
  } else {
    for (let i = 0; i < actionItems.length; i++) {
      if (y > PAGE_BOTTOM - 8) { doc.addPage(); y = MARGIN + 6 }

      // Checkbox outline
      doc.setDrawColor(...BRAND)
      doc.setLineWidth(0.5)
      doc.roundedRect(MARGIN, y - 3.2, 3.8, 3.8, 0.5, 0.5, 'S')

      doc.setFontSize(10)
      doc.setTextColor(...MUTED)
      y = writeWrapped(doc, actionItems[i], MARGIN + 6, y, COL_W - 6, LINE_H, PAGE_BOTTOM)
      y += 1.5
    }
  }
  y += 6

  // ── QUIZ QUESTIONS ────────────────────────────────────────────────────────
  y = sectionHeading(doc, 'Knowledge Check', y, PAGE_BOTTOM)

  if (quizQuestions.length === 0) {
    doc.setFontSize(10)
    doc.setTextColor(...MUTED)
    doc.text('No quiz questions available.', MARGIN, y)
  } else {
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i]
      if (y > PAGE_BOTTOM - 20) { doc.addPage(); y = MARGIN + 6 }

      // Question number badge background
      setColor(doc, BRAND)
      doc.roundedRect(MARGIN, y - 4, 6, 5.5, 1, 1, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text(`Q${i + 1}`, MARGIN + 1.4, y)

      // Question text
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...DARK)
      y = writeWrapped(doc, q.question, MARGIN + 9, y, COL_W - 9, LINE_H, PAGE_BOTTOM)
      y += 1

      // Answer label
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...BRAND)
      doc.text('Answer:', MARGIN + 4, y)

      // Answer text — use correctAnswer (current schema); q.answer is undefined
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(...MUTED)
      y = writeWrapped(doc, q.correctAnswer, MARGIN + 20, y, COL_W - 20, LINE_H, PAGE_BOTTOM)
      y += 5

      // Thin separator between Q&A blocks (skip after last)
      if (i < quizQuestions.length - 1) {
        if (y > PAGE_BOTTOM - 4) { doc.addPage(); y = MARGIN + 6 }
        doc.setDrawColor(...RULE)
        doc.setLineWidth(0.2)
        doc.line(MARGIN, y - 2, MARGIN + COL_W, y - 2)
      }
    }
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)

    // Footer background
    doc.setFillColor(...PAGE_BG)
    doc.rect(0, 285, 210, 12, 'F')

    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, 285, MARGIN + COL_W, 285)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...MUTED)
    doc.text('NoteLoom AI — AI Insights Export', MARGIN, 291)
    doc.text(`Page ${p} of ${totalPages}`, 210 - MARGIN, 291, { align: 'right' })
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const safeDate = dateLabel.replace(/,?\s+/g, '-')
  doc.save(`NoteLoom-AI-Insights-${safeDate}.pdf`)
}
