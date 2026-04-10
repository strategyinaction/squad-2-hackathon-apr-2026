import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLocation } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { LogoutButton } from '#/components/LogoutButton'
import { VisionCanvas } from '#/components/VisionCanvas'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton, type CommentType } from '#/components/CommentingSystem'
import type { CanvasPersona, CanvasPain, CanvasSuccess, CanvasSolution } from '#/components/VisionCanvas'
import { useVisionCard, useUpdateVisionCard } from '#/lib/api/visionCard'
import { useVisionCardCallouts, useUpdateVisionCardCallout, useAddVisionCardCallout } from '#/lib/api/visionCardCallouts'

export const Route = createFileRoute('/formulate')({ component: FormulateStrategyPage })

// ─── Canvas Data ──────────────────────────────────────────────────────────────

const PERSONAS: CanvasPersona[] = [
  {
    id: 'elt',
    label: 'Executive Leadership',
    quote: '"I need to make high-stakes strategic choices with confidence — grounded in rigorous data and analysis, not gut feel and politics."',
    jtbds: [
      {
        title: 'Understand the current strategic situation — where we play, how we win, how we operate — all in the form of specific, unique insights derived from data',
        institutionalTemplate: `Structured Canvas views for each area of choice (Winning Ambition, Playing Field, Value Proposition, Operating Model) with insights and data visualisation.

Deep dives into data (single source of truth) for each curated insight through standard, engaging visuals.

Curated reports available for collaborative validation, comments, and threads.`,
        cognitiveAutomation: `Query and discuss the results of the analysis: users and AI can discuss in depth the reports, insights, and data — using both the originally prioritised Strategic Questions and new, custom ones.

Users can build and adapt interactive data visualisations to explore different angles of the same insights.`,
      },
      {
        title: 'Evaluate strategic options and make explicit choices of what to maintain, what to change (From–To), and what to stop doing',
        institutionalTemplate: `Structured workflows and templates to assess options and make choices (organised around the structure of the Canvas): choices we confirm, changes to current choices (From–To), and what to stop doing.

Auditable trail linking each choice to the insights and evidence that informed it — why we chose this path, what options we excluded and why, what data and insights we leveraged for each choice.`,
        cognitiveAutomation: `Strategic Advisor agent guides and suggests choices, and challenges users' own choices against established theory, historical precedents, and cross-industry benchmarks to surface blind spots and biases. Effective in workshops, meetings, or single-user sessions.

Simulator agent models "what if" scenarios across different strategic paths, projecting financial, competitive, and operational outcomes.

Conflict and tension detection across different areas of choice — highlights overall coherence and identifies points of friction.`,
      },
      {
        title: 'Verbalise the hypotheses and assumptions behind each strategic choice, so they can be effectively tested during execution',
        institutionalTemplate: `Hypothesis and assumption fields linked to each strategic choice.

Assumption register with validation status tracking (untested, confirmed, challenged, invalidated).`,
        cognitiveAutomation: `AI prompts leadership to articulate implicit assumptions behind each choice.

Suggests hypotheses based on the strategic logic and available evidence.

Flags critical untested assumptions and recommends validation approaches.`,
      },
      {
        title: 'Engage the leadership teams across the organisation around a shared strategic narrative',
        institutionalTemplate: `Shared artefacts (documents, visuals, etc.) version-controlled and easily cascaded and aggregated across organisational units.

Collaborative annotation and commenting.

Tracking: who has reviewed, endorsed, or challenged each element of the strategy.`,
        cognitiveAutomation: `AI detects inconsistencies and gaps across organisational units' strategies.

AI generates alignment and coherence summaries/scorecards highlighting areas of convergence and divergence. Flags where BU choices may conflict or where the corporate strategy is not adequately reflected at unit level.`,
      },
      {
        title: 'Communicate the strategy to stakeholders in a way that builds commitment — compelling narratives, with deep-dives into insights, assumptions, and data where necessary',
        institutionalTemplate: `Multi-level, in-app, interactive narratives and visualisation to communicate the strategy at any organisational unit level.

Comments, threads, and social engagement features on such narratives.

Exportable documents to engage target audiences in a more traditional way.`,
        cognitiveAutomation: `Communicator agent generates tailored narratives for different audiences, adapting tone, detail level, and emphasis.

Produces board-ready summaries, manager briefings, and team-level explanations from the same underlying strategic data.

Enables natural-language Q&A: stakeholders can ask "why did we choose X?" and get a traced, evidence-backed answer.`,
      },
    ],
  },
  {
    id: 'consultants',
    label: 'Strategy Office / Consultants',
    quote: '"I need to facilitate a rigorous, repeatable strategy process that produces high-quality outputs, without drowning in data gathering and slide production. I need full control on the generation of contents, and to enable clients to validate or challenge preliminary outputs along the way."',
    jtbds: [
      {
        title: 'Generate an engagement plan including key strategic questions to be answered and data to be gathered',
        institutionalTemplate: `Engagement templates, timelines, roles and responsibilities. Notifications, collaborative features, statuses.

Strategic question library structured by Canvas dimension (Where We Play, How We Win, How We Play) — with workflow to prioritise, discard, or park them for the future.

Configurable governance templates: define cadence, roles, approval gates, and deadlines per BU/country unit. Define degrees of freedom and design authority for strategic choices across organisational units.`,
        cognitiveAutomation: `AI suggests and prioritises strategic questions based on industry context, data availability, and prior-cycle learning.

Industry Expert adapts the standard ontology and question set to the client's specific sector and competitive environment.

AI generates comprehensive lists of data to be gathered (internal and external sources) and interview questionnaires for key internal informants.`,
      },
      {
        title: "Gather and import data to populate the client's knowledge base according to the engagement plan",
        institutionalTemplate: `Facilitated workflow to connect existing enterprise software to the SiA Platform.

Integration with premium databases (for premium customers).

Import workflows for any non-connected source (documents, interviews, etc.).

Workflows to manage the knowledge base in the Knowledge Graph.`,
        cognitiveAutomation: `AI searches across connected databases and suggests data sets and reports relevant to the specific engagement (including previews of contents).

AI searches the internet for relevant available data sets.

AI provides insights about data in the KG (conflicts, gaps, duplications, etc.) and helps users cleanse and manage the knowledge base.`,
      },
      {
        title: 'Perform strategic analyses and generate insights efficiently and in a very short time',
        institutionalTemplate: `Structured libraries of standard analyses. Reusable analytical frameworks (e.g. market matrix, Value Curves) embedded in the platform.

Insights stored and retrieved in the platform (insights libraries), linked to the questions they address and the data used to generate them.

Build custom analyses (beyond the pre-loaded SiA library) and save and re-use them across units or cycles.`,
        cognitiveAutomation: `AI produces insights in minutes based on the knowledge base in the KG.

Human-in-the-loop workflows ensure quality control, rigour, and relevance.`,
      },
      {
        title: 'Generate reports, documents, or other communication artefacts which can be easily shared with clients for validation',
        institutionalTemplate: `Report/document templates aligned to the Canvas structure, ensuring consistent format across engagements.

Version-controlled reports with commenting and annotation by clients.

Shareable, permission-controlled views so clients can review and validate without needing platform access.`,
        cognitiveAutomation: `Communicator agent drafts multiple reports from the structured insight library, assembling insights into coherent and compelling narratives.

Human-in-the-loop workflows ensure quality control prior to sharing with clients.

AI highlights areas where client validation is most needed (data gaps, conflicting signals, high-impact assumptions).`,
      },
      {
        title: 'Generate options for strategic choices, facilitate choices, and help clients frame "From–To" shifts',
        institutionalTemplate: `Option register per strategic question: options generated, evaluated, chosen, discarded, or parked — with rationale captured.`,
        cognitiveAutomation: `Strategic Advisor agent generates option sets grounded in theory, precedent, and data — expanding the range of possibilities beyond what the team would consider unaided.

Simulator agent models the financial and competitive implications of each option.`,
      },
      {
        title: 'Manage the end-to-end formulation process to meet deadlines and quality requirements',
        institutionalTemplate: `Configurable workflow with milestones, ownership, and deadlines per engagement phase.

Progress tracking, quality gates, and validation "stamps".

Dashboard showing process status across all active engagements.`,
        cognitiveAutomation: `AI quality control: validates completeness of analysis per Canvas dimension, flags strategic questions with insufficient evidence, and alerts when outputs fall below quality thresholds.`,
      },
      {
        title: 'Ensure consistency across business units and engagements',
        institutionalTemplate: `Standard ontology and methodology templates enforced across all engagements.

Cross-BU comparison views: same Canvas dimensions, same fields, same structure — enabling side-by-side analysis.

Strategy library: past outputs searchable and referenceable for benchmarking.`,
        cognitiveAutomation: `AI detects variance across BU outputs, flagging where units have diverged from standards or where quality is below average.

AI suggests cross-pollination: "BU X addressed this question in this way — consider reusing the approach for BU Y."`,
      },
    ],
  },
]

const PAINS: CanvasPain[] = [
  { id: 1, title: 'The analytical burden is crushing', description: 'Gathering, processing, and synthesising market data, competitive signals, and internal capabilities requires weeks of manual effort. By the time analysis is ready, some of it is already stale. Every cycle the analyses are repeated from the beginning, without ever building a growing knowledge base.', personaIds: ['elt'] },
  { id: 2, title: 'No shared language for strategic reasoning', description: 'Every organisation, and every consultant, uses different terminology, frameworks, and structures. This makes it nearly impossible to compare, aggregate, or learn across units. Strategic reasoning stays locked in individual heads and laptops instead of becoming an institutional asset.' },
  { id: 3, title: 'Strategic choices are poorly articulated', description: 'Strategies are expressed as vague aspirations rather than explicit, testable hypotheses. The assumptions underlying a strategic choice — why we believe this will work — are rarely surfaced, let alone documented.', personaIds: ['elt'] },
  { id: 4, title: "Strategy formulation doesn't cascade below corporate level", description: 'In large, distributed organisations, every BU operates in a different competitive context. Yet the full rigour of strategic analysis is almost never replicated at granular levels. The cost is prohibitive.', personaIds: ['elt'] },
  { id: 5, title: 'The consultant leaves, and the strategy walks out the door', description: 'Consultants develop deep contextual understanding during formulation, but that knowledge is not transferred into any institutional system. When the engagement ends, the reasoning behind choices disappears.', personaIds: ['consultants'] },
  { id: 6, title: 'No structured handoff to execution', description: 'Formulation outputs — choices, assumptions, hypotheses — are expressed in narrative form, not in a structured format that execution teams can operationalise. The strategy-to-execution bridge is a manual, lossy translation.' },
  { id: 7, title: 'The analytical grind consumes most of the engagement budget', description: 'Consultants spend the overwhelming majority of their time on low-value manual work: gathering data, cleaning spreadsheets, building market-sizing models. A typical strategy engagement runs to 400–500 person-days, yet only 10–15% of that effort is spent on high-touch strategic discussions that actually move the needle.', personaIds: ['consultants'] },
  { id: 8, title: 'Quality is hostage to individual capability', description: "Without a standardised methodology enforced by tooling, the quality of strategic outputs varies enormously depending on who runs the engagement. The firm's capacity is bottlenecked by its best people, and reputational risk scales with every engagement staffed by a less experienced team.", personaIds: ['consultants'] },
  { id: 9, title: 'Slide production crowds out strategic thinking', description: "Enormous effort goes into producing the deliverable — the deck, the report, the board pack — rather than producing the thinking. Formatting, aligning charts, writing narratives, managing document versions: this is communication work, not strategy work. Yet it consumes a disproportionate share of the consultant's time.", personaIds: ['consultants'] },
]

const SOLUTIONS: CanvasSolution[] = [
  {
    id: 1,
    title: 'AI Researcher & Business Analyst agents',
    description: 'Scan financial reports, market data, competitive intelligence, and internal metrics to deliver curated, business-ready insights on demand. Data-to-insight in hours, not weeks — compressing what once took 400–500 person-days.',
    painIds: [1, 7],
  },
  {
    id: 2,
    title: 'Strategy in Action Canvas — shared ontology',
    description: 'A standard, universal framework for business strategy enforced across all units and engagements. Enables meaningful comparison, aggregation, and cross-pollination of strategic thinking — and makes cascade possible below corporate level.',
    painIds: [2, 4, 8],
  },
  {
    id: 3,
    title: 'Explicit hypothesis and assumption registry',
    description: 'Every strategic choice captures the From→To shift, the underlying insights, and the assumptions that need to hold. Options considered and discarded are preserved — not lost. Auditable trail linking each choice to its evidence.',
    painIds: [3, 6],
  },
  {
    id: 4,
    title: 'Strategy Digital Twin',
    description: "A living, machine-readable mirror of the organisation's strategy captured in a unified Knowledge Graph. Strategic reasoning becomes institutional capital rather than walking out the door with the consultant at the end of each engagement.",
    painIds: [5, 6],
  },
  {
    id: 5,
    title: 'Communicator agent — automated narratives',
    description: 'Drafts reports, executive summaries, and communication artefacts from the structured insight library — adapting tone, detail level, and emphasis for different audiences. Communication work no longer crowds out strategic thinking.',
    painIds: [9],
  },
  {
    id: 6,
    title: 'AI quality floor and variance reduction',
    description: 'Structured templates, methodology libraries, and AI quality control reduce variance across BUs and consultants. Every formulation follows a rigorous structure regardless of local capability or engagement staffing.',
    painIds: [2, 8],
  },
  {
    id: 7,
    title: 'Structured handoff to execution',
    description: 'Formulation outputs — choices, assumptions, hypotheses — are structured in machine-readable format, directly connected to strategic plans, priorities, and OKRs. No manual, lossy translation across the strategy-execution boundary.',
    painIds: [3, 6],
  },
]

const SUCCESS_ITEMS: CanvasSuccess[] = [
  { id: 1, title: 'Strategy formulation takes weeks, not months', detail: 'AI-powered research and analysis compress the data-gathering phase from weeks of manual effort to hours of curated insights, enabling strategy to be performed frequently rather than once every few years.' },
  { id: 2, title: 'Every strategic choice is explicit and "auditable"', detail: 'The organisation can trace any priority back to the analysis that informed it, the options that were considered, the hypotheses that underpin it, and the assumptions that need to hold.' },
  { id: 3, title: 'A shared strategic language exists across the enterprise', detail: 'Business units, geographies, and functional teams use the same ontology, enabling meaningful comparison, aggregation, and cross-pollination of strategic thinking.' },
  { id: 4, title: 'The quality of strategic reasoning is consistently high', detail: 'AI co-pilots reduce variance by ensuring every formulation process follows a rigorous structure. Choices have structure: a current state, a target state, underlying hypotheses, and supporting evidence.' },
  { id: 5, title: 'AI augments judgement, it does not replace it', detail: 'The cognitive heavy-lifting (research, analysis, synthesis, scenario simulation) is delegated to the AI. But strategic judgement — evaluating options, making choices, building commitment — remains a fundamentally human act.' },
  { id: 6, title: 'Governance is customised per engagement', detail: 'Different organisations have different governance and organisational requirements. The platform supports configurable organisational and governance structures, without requiring a one-size-fits-all methodology.' },
  { id: 7, title: 'Strategy is de-mystified', detail: "When someone reads a strategy inside this module, it's clear, meaningful, specific, and makes a lot of sense. It is not a declaration of intent, it is not a slogan, it is not a deck of 150 slides of analysis." },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function FormulateStrategyContent() {
  const [detailedView, setDetailedView] = useState(false)
  const { data: visionCard, isLoading: visionCardLoading } = useVisionCard()
  const { data: visionCallouts, isLoading: calloutsLoading } = useVisionCardCallouts()
  const updateVisionCard = useUpdateVisionCard()
  const updateVisionCardCallout = useUpdateVisionCardCallout()
  const addVisionCardCallout = useAddVisionCardCallout()

  const visionLoading = visionCardLoading || calloutsLoading

  // Map VisionCard BE fields → FE props (title → visionStatement, description → visionDetail)
  const visionStatement = visionCard?.title ?? ''
  const visionDetail = visionCard?.description ?? ''

  // Map VisionCardCallouts → callout props (title → label, description → body)
  const visionCallout = visionCallouts?.[0]
    ? { label: visionCallouts[0].title ?? '', body: visionCallouts[0].description ?? '' }
    : undefined

  function handleSaveVision(vision: { statement: string; detail: string; callout?: { label: string; body: string } }) {
    // Persist vision card
    if (visionCard) {
      updateVisionCard.mutate({ id: visionCard.id, data: { title: vision.statement, description: vision.detail } })
    }
    // Persist callout
    if (vision.callout) {
      if (visionCallouts?.[0]) {
        updateVisionCardCallout.mutate({ id: visionCallouts[0].id, data: { title: vision.callout.label, description: vision.callout.body } })
      } else {
        addVisionCardCallout.mutate({ type: 'vision_card_callout', title: vision.callout.label, subtitle: null, description: vision.callout.body, order_value: 1 })
      }
    }
  }

  return (
    <>
      <PageHeader
        sticky
        back={{ to: '..' }}
        title="Formulate Strategy"
        subtitle="Making Better Strategic Choices — which ELT can commit on, in a fast and inexpensive way."
        breadcrumbs={[{ label: 'Product Vision', to: '..' }, { label: 'Formulate Strategy' }]}
        actions={<>
          <div
            onClick={() => setDetailedView(v => !v)}
            className="flex items-center gap-2 text-xs cursor-pointer"
          >
            <span className={`relative inline-flex h-[18px] w-[32px] items-center rounded-full transition-colors ${detailedView ? 'bg-primary' : 'bg-border/60'}`}>
              <span className={`absolute h-[14px] w-[14px] rounded-full bg-white shadow-small transition-transform ${detailedView ? 'translate-x-[16px]' : 'translate-x-[2px]'}`} />
            </span>
            <span className={detailedView ? 'text-foreground font-medium' : 'text-muted-foreground'}>Detailed view</span>
          </div>
          <ExportButton /><CommentsToggleButton /><LogoutButton />
        </>}
      />
      <div className="flex gap-6">
        <CommentableRegion id="formulate-canvas" label="Vision Canvas" className="flex-1 min-w-0">
          <VisionCanvas
            accent="primary"
            canvasId="formulate"
            visionStatement={visionStatement}
            visionDetail={visionDetail}
            visionCallout={visionCallout}
            personas={PERSONAS}
            pains={PAINS}
            painSubtitle="Strategy formulation is trapped in an artisanal model — depending on consultants' skills, ad-hoc spreadsheets, and PowerPoint decks assembled under time pressure."
            solutions={SOLUTIONS}
            successItems={SUCCESS_ITEMS}
            detailedView={detailedView}
            onSaveVision={handleSaveVision}
            visionLoading={visionLoading}
          />
        </CommentableRegion>
        <CommentsPanel />
      </div>
    </>
  )
}

function FormulateStrategyPage() {
  const location = useLocation()
  const nav = location.state as { panelOpen?: boolean; typeFilter?: CommentType } | null
  return (
    <CommentProvider initialPanelOpen={nav?.panelOpen} initialTypeFilter={nav?.typeFilter}>
      <FormulateStrategyContent />
    </CommentProvider>
  )
}
