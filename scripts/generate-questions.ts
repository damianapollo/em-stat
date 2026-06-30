/**
 * EM STAT — Question Generator
 * Usage: npm run generate-questions
 *
 * Generates ABEM-weighted MCQs via Claude and inserts them into Supabase as drafts.
 * Review and publish at /admin/questions
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// ─── Config ────────────────────────────────────────────────────────────────
const TOTAL_QUESTIONS = 300
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!

// ABEM blueprint: topic name → exam weight
const ABEM_BLUEPRINT: Record<string, number> = {
  'Abdominal & GI Emergencies': 9,
  'Cardiovascular Emergencies': 9,
  'Respiratory Emergencies': 9,
  'Traumatic Emergencies': 12,
  'Procedures & Skills': 8,
  'Other Core Competencies': 7,
  'Nervous System Emergencies': 7,
  'Head, Eye, Ear, Nose, Throat': 6,
  'Orthopedic Emergencies': 6,
  'Systemic Infectious Disorders': 6,
  'Obstetric & Gynecologic Emergencies': 5,
  'Psychobehavioral Emergencies': 5,
  'Toxicologic Emergencies': 5,
  'Renal & Urologic Emergencies': 4,
  'Environmental Emergencies': 3,
  'Hematologic Emergencies': 3,
  'Immune System Disorders': 3,
  'Skin Disorders': 3,
}

const TOTAL_WEIGHT = Object.values(ABEM_BLUEPRINT).reduce((a, b) => a + b, 0)

// ─── Clients ────────────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ─── Types ──────────────────────────────────────────────────────────────────
interface GeneratedQuestion {
  stem: string
  options: { label: string; text: string }[]
  correct_index: number
  explanation: string
  subtopic: string
  difficulty: number
}

// ─── Prompt ─────────────────────────────────────────────────────────────────
function buildPrompt(topic: string, batchIndex: number): string {
  return `You are an emergency medicine board exam question writer for ABEM (American Board of Emergency Medicine).

Write 5 high-quality ABEM-style multiple choice questions about: **${topic}**

Requirements for each question:
- Clinical vignette stem (2-4 sentences): patient presentation with vitals, history, physical exam findings
- Exactly 5 answer options labeled A through E
- One clearly correct answer; 4 plausible distractors (not obviously wrong)
- Detailed teaching explanation (3-5 sentences) explaining WHY the correct answer is right and key teaching points
- Subtopic: a specific sub-area within ${topic}
- Difficulty: integer 1-5 (1=easy, 3=moderate, 5=expert/fellowship level)
- Mix of difficulties (aim for 1-2 easy, 2 moderate, 1-2 hard per batch)

Vary the presentation — include different age groups, genders, settings (ED, EMS, clinic).
Batch ${batchIndex + 1}: make these questions distinct from typical exam prep content.

Respond with ONLY valid JSON, no markdown, no explanation outside the JSON:

{
  "questions": [
    {
      "stem": "A 45-year-old man presents to the ED...",
      "options": [
        {"label": "A", "text": "..."},
        {"label": "B", "text": "..."},
        {"label": "C", "text": "..."},
        {"label": "D", "text": "..."},
        {"label": "E", "text": "..."}
      ],
      "correct_index": 2,
      "explanation": "The correct answer is C because...",
      "subtopic": "specific subtopic here",
      "difficulty": 3
    }
  ]
}`
}

// ─── Generate ────────────────────────────────────────────────────────────────
async function generateBatch(topic: string, batchIndex: number): Promise<GeneratedQuestion[]> {
  const prompt = buildPrompt(topic, batchIndex)

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Strip any accidental markdown fences
  const jsonStr = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  const parsed = JSON.parse(jsonStr)
  return parsed.questions as GeneratedQuestion[]
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 EM STAT Question Generator')
  console.log(`   Target: ${TOTAL_QUESTIONS} questions across ${Object.keys(ABEM_BLUEPRINT).length} topics\n`)

  // Load topic IDs from Supabase
  const { data: topicRows, error: topicErr } = await supabase
    .from('topics')
    .select('id, name')
  if (topicErr) { console.error('Failed to load topics:', topicErr); process.exit(1) }

  const topicMap = new Map<string, string>()
  for (const row of topicRows ?? []) topicMap.set(row.name, row.id)

  let totalInserted = 0
  let totalErrors = 0

  for (const [topicName, weight] of Object.entries(ABEM_BLUEPRINT)) {
    const topicId = topicMap.get(topicName)
    if (!topicId) { console.warn(`⚠️  Topic not found in DB: ${topicName}`); continue }

    const questionsForTopic = Math.round((weight / TOTAL_WEIGHT) * TOTAL_QUESTIONS)
    const batches = Math.ceil(questionsForTopic / 5)

    console.log(`📚 ${topicName} — ${questionsForTopic} questions (${batches} batches)`)

    for (let b = 0; b < batches; b++) {
      try {
        const questions = await generateBatch(topicName, b)

        // Insert into Supabase
        const rows = questions.map(q => ({
          stem: q.stem,
          options: q.options,
          correct_index: q.correct_index,
          explanation: q.explanation,
          topic_id: topicId,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          status: 'draft',
        }))

        const { error: insertErr } = await supabase.from('questions').insert(rows)
        if (insertErr) {
          console.error(`   ✗ Batch ${b + 1} insert error:`, insertErr.message)
          totalErrors += rows.length
        } else {
          console.log(`   ✓ Batch ${b + 1}/${batches} — inserted ${rows.length} questions`)
          totalInserted += rows.length
        }

        // Small delay to avoid rate limiting
        if (b < batches - 1) await new Promise(r => setTimeout(r, 1000))
      } catch (err) {
        console.error(`   ✗ Batch ${b + 1} failed:`, err)
        totalErrors += 5
      }
    }
    console.log()
  }

  console.log('─'.repeat(50))
  console.log(`✅ Done! Inserted ${totalInserted} questions (${totalErrors} errors)`)
  console.log(`👉 Review and publish at /admin/questions`)
}

main().catch(err => { console.error(err); process.exit(1) })
