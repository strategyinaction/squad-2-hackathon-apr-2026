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
import { usePersonas, usePersonaJTBDs, useUpdatePersona, useAddPersona, useUpdatePersonaJTBD, useAddPersonaJTBD, useDeletePersonaJTBD } from '#/lib/api/personas'
import type { CanvasJTBD } from '#/components/VisionCanvas'

export const Route = createFileRoute('/formulate')({ component: FormulateStrategyPage })

// ─── Static Canvas Data (personas + vision fetched from API) ─────────────────

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

function jtbdTitle(j: string | CanvasJTBD): string {
  return typeof j === 'string' ? j : j.title
}

function FormulateStrategyContent() {
  const [detailedView, setDetailedView] = useState(false)

  // Vision hooks
  const { data: visionCard, isLoading: visionCardLoading } = useVisionCard()
  const { data: visionCallouts, isLoading: calloutsLoading } = useVisionCardCallouts()
  const updateVisionCard = useUpdateVisionCard()
  const updateVisionCardCallout = useUpdateVisionCardCallout()
  const addVisionCardCallout = useAddVisionCardCallout()

  // Persona hooks
  const { data: personaItems, isLoading: personasItemsLoading } = usePersonas()
  const { data: jtbdItems, isLoading: jtbdsLoading } = usePersonaJTBDs()
  const updatePersona = useUpdatePersona()
  const addPersona = useAddPersona()
  const updatePersonaJTBD = useUpdatePersonaJTBD()
  const addPersonaJTBD = useAddPersonaJTBD()
  const deletePersonaJTBD = useDeletePersonaJTBD()

  const visionLoading = visionCardLoading || calloutsLoading
  const personasLoading = personasItemsLoading || jtbdsLoading

  // Map VisionCard
  const visionStatement = visionCard?.title ?? ''
  const visionDetail = visionCard?.description ?? ''
  const visionCallout = visionCallouts?.[0]
    ? { label: visionCallouts[0].title ?? '', body: visionCallouts[0].description ?? '' }
    : undefined

  // Map Personas + JTBDs from API → CanvasPersona[]
  const personas: CanvasPersona[] = personaItems && jtbdItems
    ? personaItems.map(p => ({
        id: String(p.id),
        label: p.title ?? '',
        quote: p.description ?? '',
        jtbds: jtbdItems
          .filter(j => j.parent_id === p.id)
          .map(j => (j.subtitle || j.description)
            ? { title: j.title ?? '', institutionalTemplate: j.subtitle ?? undefined, cognitiveAutomation: j.description ?? undefined } as CanvasJTBD
            : j.title ?? ''
          ),
      }))
    : []

  function handleSaveVision(vision: { statement: string; detail: string; callout?: { label: string; body: string } }) {
    if (visionCard) {
      updateVisionCard.mutate({ id: visionCard.id, data: { title: vision.statement, description: vision.detail } })
    }
    if (vision.callout) {
      if (visionCallouts?.[0]) {
        updateVisionCardCallout.mutate({ id: visionCallouts[0].id, data: { title: vision.callout.label, description: vision.callout.body } })
      } else {
        addVisionCardCallout.mutate({ type: 'vision_card_callout', title: vision.callout.label, subtitle: null, description: vision.callout.body, order_value: 1, parent_id: null })
      }
    }
  }

  function handleSavePersonas(updatedPersonas: CanvasPersona[]) {
    updatedPersonas.forEach((persona, pIndex) => {
      const numId = Number(persona.id)
      const personaData = { title: persona.label, description: persona.quote, order_value: pIndex + 1 }
      if (!isNaN(numId)) {
        updatePersona.mutate({ id: numId, data: personaData })
        // Update/add JTBDs for existing persona
        const existingJtbds = jtbdItems?.filter(j => j.parent_id === numId) ?? []
        persona.jtbds.forEach((jtbd, jIndex) => {
          const title = jtbdTitle(jtbd)
          const inst = typeof jtbd !== 'string' ? jtbd.institutionalTemplate ?? null : null
          const cog = typeof jtbd !== 'string' ? jtbd.cognitiveAutomation ?? null : null
          const existingJtbd = existingJtbds[jIndex]
          if (existingJtbd) {
            updatePersonaJTBD.mutate({ id: existingJtbd.id, data: { title, subtitle: inst, description: cog, order_value: jIndex + 1 } })
          } else {
            addPersonaJTBD.mutate({ type: 'persona_jtbd', title, subtitle: inst, description: cog, order_value: jIndex + 1, parent_id: numId })
          }
        })
        // Delete JTBDs that were removed
        existingJtbds.slice(persona.jtbds.length).forEach(j => {
          deletePersonaJTBD.mutate(j.id)
        })
      } else {
        addPersona.mutate({ type: 'persona', ...personaData, subtitle: null, parent_id: null })
      }
    })
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
            personas={personas}
            pains={PAINS}
            painSubtitle="Strategy formulation is trapped in an artisanal model — depending on consultants' skills, ad-hoc spreadsheets, and PowerPoint decks assembled under time pressure."
            solutions={SOLUTIONS}
            successItems={SUCCESS_ITEMS}
            detailedView={detailedView}
            onSaveVision={handleSaveVision}
            visionLoading={visionLoading}
            onSavePersonas={handleSavePersonas}
            personasLoading={personasLoading}
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
