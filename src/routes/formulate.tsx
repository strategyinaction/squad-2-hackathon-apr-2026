import { createFileRoute } from '@tanstack/react-router'
import { useLocation } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { VisionCanvas } from '#/components/VisionCanvas'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton, type CommentType } from '#/components/CommentingSystem'
import type { CanvasPersona, CanvasPain, CanvasPoint, CanvasSuccess } from '#/components/VisionCanvas'

export const Route = createFileRoute('/formulate')({ component: FormulateStrategyPage })

// ─── Canvas Data ──────────────────────────────────────────────────────────────

const PERSONAS: CanvasPersona[] = [
  {
    id: 'elt',
    label: 'Executive Leadership',
    quote: '"I need to make high-stakes strategic choices with confidence — grounded in rigorous data and analysis, not gut feel and politics."',
    jtbds: [
      'Understand the current strategic situation — where we play, how we win, how we operate — all in the form of specific, unique insights derived from data',
      'Evaluate strategic options and make explicit choices of what to maintain, what to change (From–To), and what to stop doing',
      'Verbalise the hypotheses and assumptions behind each strategic choice, so they can be effectively tested during execution',
      'Engage the leadership teams across the organisation around a shared strategic narrative',
    ],
  },
  {
    id: 'consultants',
    label: 'Strategy Office / Consultants',
    quote: '"I need to facilitate a rigorous, repeatable strategy process that produces high-quality outputs, without drowning in data gathering and slide production."',
    jtbds: [
      'Generate an engagement plan including key strategic questions to be answered and data to be gathered',
      'Perform strategic analyses and generate insights efficiently, in a very short time',
      'Generate reports and communication artefacts which can be easily shared with clients for validation',
      'Generate options for strategic choices and help clients frame "From–To" shifts',
      'Manage the end-to-end formulation process to meet deadlines and quality requirements',
    ],
  },
]

const PAINS: CanvasPain[] = [
  { id: 1, title: 'The analytical burden is crushing', description: 'Gathering, processing, and synthesising market data, competitive signals, and internal capabilities requires weeks of manual effort. By the time analysis is ready, some of it is already stale. Every cycle the analyses are repeated from the beginning, without ever building a growing knowledge base.' },
  { id: 2, title: 'No shared language for strategic reasoning', description: 'Every organisation, and every consultant, uses different terminology, frameworks, and structures. This makes it nearly impossible to compare, aggregate, or learn across units. Strategic reasoning stays locked in individual heads and laptops instead of becoming an institutional asset.' },
  { id: 3, title: 'Strategic choices are poorly articulated', description: 'Strategies are expressed as vague aspirations rather than explicit, testable hypotheses. The assumptions underlying a strategic choice — why we believe this will work — are rarely surfaced, let alone documented.' },
  { id: 4, title: "Strategy formulation doesn't cascade below corporate level", description: 'In large, distributed organisations, every BU operates in a different competitive context. Yet the full rigour of strategic analysis is almost never replicated at granular levels. The cost is prohibitive.' },
  { id: 5, title: 'The consultant leaves, and the strategy walks out the door', description: 'Consultants develop deep contextual understanding during formulation, but that knowledge is not transferred into any institutional system. When the engagement ends, the reasoning behind choices disappears.' },
  { id: 6, title: 'No structured handoff to execution', description: 'Formulation outputs — choices, assumptions, hypotheses — are expressed in narrative form, not in a structured format that execution teams can operationalise. The strategy-to-execution bridge is a manual, lossy translation.' },
]

const PRODUCT_POINTS: CanvasPoint[] = [
  { headline: 'Data to insight in minutes, not weeks', detail: 'The platform scans financial reports, market data, competitive intelligence, and internal metrics — delivering curated, business-ready insights on demand, visualising and communicating them in a clear, compelling manner.' },
  { headline: 'A standard ontology provides a shared language', detail: 'Standardised across business units, geographies, and engagements, while adapting fluidly to each industry context. Strategic reasoning becomes an institutional asset, not individual expertise.' },
  { headline: 'Strategic choices are explicit and testable', detail: 'Every choice captures the "From–To" shift, the underlying insights, and the assumptions that need to hold true. Options that were considered and discarded are preserved — not lost.' },
  { headline: 'The process is governed and quality-gated', detail: 'Key strategic questions are defined upfront with clear ownership, deadlines, and quality gates, reducing variance across units and ensuring every formulation cycle meets a consistent standard.' },
  { headline: 'AI acts as a sparring partner', detail: 'Stress-testing ideas against established theory, historical precedents, and cross-industry best practices. Revealing blind spots, inconsistencies, and gaps — countering biases while amplifying human judgement.' },
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
  return (
    <>
      <PageHeader
        back={{ to: '..' }}
        title="Formulate Strategy"
        subtitle="Making Better Strategic Choices — which ELT can commit on, in a fast and inexpensive way."
        breadcrumbs={[{ label: 'Product Vision', to: '..' }, { label: 'Formulate Strategy' }]}
        actions={<><ExportButton /><CommentsToggleButton /></>}
      />
      <div className="flex gap-6">
        <CommentableRegion id="formulate-canvas" label="Vision Canvas" className="flex-1 min-w-0">
          <VisionCanvas
            accent="primary"
            canvasId="formulate"
            visionStatement="A world where strategy formulation is a structured, AI-augmented capability — not a once-every-few-years ordeal trapped in consultants' laptops and slide decks."
            visionDetail="The platform enables any organisation to activate full strategic rigour on demand: data-to-insight in hours, choices that are explicit and auditable, and a shared language that turns individual expertise into institutional capital."
            visionCallout={{ label: 'The Strategy Digital Twin', body: 'At the technological heart of the platform is a living, machine-readable mirror of the organisation\'s strategy — capturing data, goals, assumptions, options, and plans in a unified Knowledge Graph. It powers seven agentic services through a Strategy Co-Pilot: Industry Expert, Researcher, Business Analyst, Communicator, Simulator, Programme Manager, and Strategic Advisor.' }}
            personas={PERSONAS}
            pains={PAINS}
            painSubtitle="Strategy formulation is trapped in an artisanal model — depending on consultants' skills, ad-hoc spreadsheets, and PowerPoint decks assembled under time pressure."
            productPoints={PRODUCT_POINTS}
            successItems={SUCCESS_ITEMS}
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
