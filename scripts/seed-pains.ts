/**
 * Seed script: pushes the current mock PAINS, SOLUTIONS and pain section
 * subtitle into Directus via REST API.
 *
 * Run with:  npx tsx scripts/seed-pains.ts
 */

const BASE = 'http://34.140.171.1:8055'
const TOKEN = '8efKcIkdTA2cc5UGr4g2Ll5z_DdZj9GU'

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

async function create(item: Record<string, unknown>) {
  const res = await fetch(`${BASE}/items/contents`, {
    method: 'POST',
    headers,
    body: JSON.stringify(item),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to create item: ${res.status} ${text}`)
  }
  const json = (await res.json()) as { data: { id: number } }
  return json.data
}

// ── Existing persona IDs (already in DB) ──────────────────────────────────────
// "Executive Leadership" = 17, "Strategy Office / Consultants" = 18
const PERSONA_MAP: Record<string, number> = {
  elt: 17,
  consultants: 18,
}

// ── Mock data (same as formulate.tsx) ─────────────────────────────────────────

const PAIN_SUBTITLE =
  'Strategy formulation is trapped in an artisanal model — depending on consultants\' skills, ad-hoc spreadsheets, and PowerPoint decks assembled under time pressure.'

interface MockPain {
  title: string
  description: string
  personaIds?: string[]
}

const PAINS: MockPain[] = [
  { title: 'The analytical burden is crushing', description: 'Gathering, processing, and synthesising market data, competitive signals, and internal capabilities requires weeks of manual effort. By the time analysis is ready, some of it is already stale. Every cycle the analyses are repeated from the beginning, without ever building a growing knowledge base.', personaIds: ['elt'] },
  { title: 'No shared language for strategic reasoning', description: 'Every organisation, and every consultant, uses different terminology, frameworks, and structures. This makes it nearly impossible to compare, aggregate, or learn across units. Strategic reasoning stays locked in individual heads and laptops instead of becoming an institutional asset.' },
  { title: 'Strategic choices are poorly articulated', description: 'Strategies are expressed as vague aspirations rather than explicit, testable hypotheses. The assumptions underlying a strategic choice — why we believe this will work — are rarely surfaced, let alone documented.', personaIds: ['elt'] },
  { title: "Strategy formulation doesn't cascade below corporate level", description: 'In large, distributed organisations, every BU operates in a different competitive context. Yet the full rigour of strategic analysis is almost never replicated at granular levels. The cost is prohibitive.', personaIds: ['elt'] },
  { title: 'The consultant leaves, and the strategy walks out the door', description: 'Consultants develop deep contextual understanding during formulation, but that knowledge is not transferred into any institutional system. When the engagement ends, the reasoning behind choices disappears.', personaIds: ['consultants'] },
  { title: 'No structured handoff to execution', description: 'Formulation outputs — choices, assumptions, hypotheses — are expressed in narrative form, not in a structured format that execution teams can operationalise. The strategy-to-execution bridge is a manual, lossy translation.' },
  { title: 'The analytical grind consumes most of the engagement budget', description: 'Consultants spend the overwhelming majority of their time on low-value manual work: gathering data, cleaning spreadsheets, building market-sizing models. A typical strategy engagement runs to 400–500 person-days, yet only 10–15% of that effort is spent on high-touch strategic discussions that actually move the needle.', personaIds: ['consultants'] },
  { title: 'Quality is hostage to individual capability', description: "Without a standardised methodology enforced by tooling, the quality of strategic outputs varies enormously depending on who runs the engagement. The firm's capacity is bottlenecked by its best people, and reputational risk scales with every engagement staffed by a less experienced team.", personaIds: ['consultants'] },
  { title: 'Slide production crowds out strategic thinking', description: "Enormous effort goes into producing the deliverable — the deck, the report, the board pack — rather than producing the thinking. Formatting, aligning charts, writing narratives, managing document versions: this is communication work, not strategy work. Yet it consumes a disproportionate share of the consultant's time.", personaIds: ['consultants'] },
]

interface MockSolution {
  title: string
  description: string
  /** References mock pain indices (1-based, matching the mock `id` field) */
  painMockIds: number[]
}

const SOLUTIONS: MockSolution[] = [
  { title: 'AI Researcher & Business Analyst agents', description: 'Scan financial reports, market data, competitive intelligence, and internal metrics to deliver curated, business-ready insights on demand. Data-to-insight in hours, not weeks — compressing what once took 400–500 person-days.', painMockIds: [1, 7] },
  { title: 'Strategy in Action Canvas — shared ontology', description: 'A standard, universal framework for business strategy enforced across all units and engagements. Enables meaningful comparison, aggregation, and cross-pollination of strategic thinking — and makes cascade possible below corporate level.', painMockIds: [2, 4, 8] },
  { title: 'Explicit hypothesis and assumption registry', description: 'Every strategic choice captures the From→To shift, the underlying insights, and the assumptions that need to hold. Options considered and discarded are preserved — not lost. Auditable trail linking each choice to its evidence.', painMockIds: [3, 6] },
  { title: 'Strategy Digital Twin', description: "A living, machine-readable mirror of the organisation's strategy captured in a unified Knowledge Graph. Strategic reasoning becomes institutional capital rather than walking out the door with the consultant at the end of each engagement.", painMockIds: [5, 6] },
  { title: 'Communicator agent — automated narratives', description: 'Drafts reports, executive summaries, and communication artefacts from the structured insight library — adapting tone, detail level, and emphasis for different audiences. Communication work no longer crowds out strategic thinking.', painMockIds: [9] },
  { title: 'AI quality floor and variance reduction', description: 'Structured templates, methodology libraries, and AI quality control reduce variance across BUs and consultants. Every formulation follows a rigorous structure regardless of local capability or engagement staffing.', painMockIds: [2, 8] },
  { title: 'Structured handoff to execution', description: 'Formulation outputs — choices, assumptions, hypotheses — are structured in machine-readable format, directly connected to strategic plans, priorities, and OKRs. No manual, lossy translation across the strategy-execution boundary.', painMockIds: [3, 6] },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding pains & pain relievers …')

  // 1. Create pain section description
  const section = await create({
    type: 'pain_section',
    title: PAIN_SUBTITLE,
    subtitle: null,
    description: null,
    order_value: 1,
    parent_id: null,
  })
  console.log(`  ✔ pain_section  id=${section.id}`)

  // 2. Create pain items — collect real IDs keyed by mock 1-based index
  const painIdByMockIndex: Record<number, number> = {}

  for (let i = 0; i < PAINS.length; i++) {
    const p = PAINS[i]
    const personaDbIds = (p.personaIds ?? []).map(k => PERSONA_MAP[k]).filter(Boolean)
    const pain = await create({
      type: 'pain',
      title: p.title,
      subtitle: personaDbIds.length > 0 ? personaDbIds.join(',') : null,
      description: p.description,
      order_value: i + 1,
      parent_id: null,
    })
    painIdByMockIndex[i + 1] = pain.id
    console.log(`  ✔ pain #${i + 1}  id=${pain.id}  "${p.title.slice(0, 40)}…"`)
  }

  // 3. Create pain relievers (solutions)
  for (let i = 0; i < SOLUTIONS.length; i++) {
    const s = SOLUTIONS[i]
    const linkedPainIds = s.painMockIds.map(mi => painIdByMockIndex[mi]).filter(Boolean)
    const sol = await create({
      type: 'pain_reliever',
      title: s.title,
      subtitle: linkedPainIds.length > 0 ? linkedPainIds.join(',') : null,
      description: s.description,
      order_value: i + 1,
      parent_id: null,
    })
    console.log(`  ✔ pain_reliever #${i + 1}  id=${sol.id}  painIds=[${linkedPainIds}]  "${s.title.slice(0, 40)}…"`)
  }

  console.log('\n✅ Done! Seeded', PAINS.length, 'pains +', SOLUTIONS.length, 'pain relievers.')
}

main().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

