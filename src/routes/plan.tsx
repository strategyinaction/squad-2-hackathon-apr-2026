import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLocation } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { LogoutButton } from '#/components/LogoutButton'
import { VisionCanvas } from '#/components/VisionCanvas'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton, type CommentType } from '#/components/CommentingSystem'
import type { CanvasPersona, CanvasPain, CanvasSuccess, CanvasSolution, CanvasJTBD } from '#/components/VisionCanvas'
import { useVisionCard, useUpdateVisionCard } from '#/lib/api/visionCard'
import { useVisionCardCallouts, useUpdateVisionCardCallout, useAddVisionCardCallout } from '#/lib/api/visionCardCallouts'
import { usePersonas, usePersonaJTBDs, useUpdatePersona, useAddPersona, useUpdatePersonaJTBD, useAddPersonaJTBD, useDeletePersonaJTBD } from '#/lib/api/personas'

export const Route = createFileRoute('/plan')({ component: StrategicPlanPage })

// ─── Static Canvas Data ───────────────────────────────────────────────────────

const PAINS: CanvasPain[] = [
  { id: 1, title: 'The "why" has been lost', description: 'Teams receive objectives but not the reasoning behind them. They don\'t know what the organisation is betting on, what assumptions have been made, or what success is really supposed to look like. They execute in the dark.', personaIds: ['elt', 'teamlead', 'strategyoffice'] },
  { id: 2, title: 'Outcomes have been replaced by activities', description: 'Measurement systems reward task completion, not value creation. "We delivered the training programme" becomes the goal, not "we increased capability in X." Busyness is mistaken for progress.', personaIds: ['elt', 'teamlead', 'strategyoffice'] },
  { id: 3, title: 'Plans are written and forgotten', description: 'Planning is treated as an event — a document produced to satisfy governance — rather than a living tool for alignment and learning. Plans are outdated the moment they\'re filed.', personaIds: ['elt', 'teamlead', 'strategyoffice'] },
  { id: 4, title: 'Strategy and financials are disconnected', description: 'Long-range plans and annual operating plans exist in separate worlds. There is no live link between strategic priorities, the financial plan, and the resources allocated to execute them.', personaIds: ['elt', 'cfo', 'strategyoffice'] },
  { id: 5, title: 'Missing links and alignment across entities', description: 'Different entities, business units, and functions often receive top-down guidelines and develop their plans in silos, using different formats and missing out on possible cross-entity synergies.' },
]

const SOLUTIONS: CanvasSolution[] = [
  {
    id: 1,
    title: 'Hypothesis-driven plan charters',
    description: 'Every plan explicitly states what we will do, why we believe it will work (If/Then/Because hypotheses), and how we will know (key results with baselines and targets). The "why" is never lost — it is a required field.',
    painIds: [1, 2],
  },
  {
    id: 2,
    title: 'AI-guided planning wizard',
    description: 'A structured Q&A conversation walks plan owners through each charter element step by step, proposing draft answers grounded in strategic context. A rigorous, hypothesis-driven plan takes minutes to draft, not weeks.',
    painIds: [1, 2, 3],
  },
  {
    id: 3,
    title: 'Top-down cascade with strategic context inheritance',
    description: "Each child plan inherits its parent's strategic context, hypotheses, and outcome expectations at every layer. Drift detection flags where a child plan's content has diverged from parent intent.",
    painIds: [1, 5],
  },
  {
    id: 4,
    title: 'Portfolio coherence analysis',
    description: 'AI identifies orphan plans, uncovered strategic choices, conflicting objectives between sibling units, and MECE violations across the full cascade. A coherence scorecard drives resolution before execution begins.',
    painIds: [3, 5],
  },
  {
    id: 5,
    title: 'Structural strategy-finance link',
    description: 'Every strategic priority is backed by a financial envelope; every financial line has a strategic rationale. Resource allocation patterns reveal whether the organisation is actually funding the change it declared.',
    painIds: [4],
  },
  {
    id: 6,
    title: 'Configurable planning governance per unit',
    description: 'Different units use different planning models (OKR, PMO stage-gate, Programme, hybrid) — configured per unit, not forced into a single template. Quality gates prevent publication of incomplete plans.',
    painIds: [3, 5],
  },
]

const SUCCESS_ITEMS: CanvasSuccess[] = [
  { id: 1, title: 'Every strategic choice has a plan — every plan traces back to a strategic choice', detail: 'No orphan plans, no unfunded priorities. Navigate from winning ambition down to a team-level OKR and back up again, with every link explicit.' },
  { id: 2, title: 'Plans are hypotheses, not contracts', detail: 'Every plan captures what we will do, why we believe it will work (If/Then/Because), and how we will know (key results with baselines and targets).' },
  { id: 3, title: 'Planning is fast, guided, and connected', detail: 'AI-powered Q&A conversations walk users through plan creation step by step — proposing, not dictating. A well-structured, hypothesis-driven plan takes minutes to draft, not weeks.' },
  { id: 4, title: 'The cascade is coherent and aggregation is meaningful', detail: 'Top-down cascade preserves strategic context at every layer: Corporate → BU → Country → Team. Bottom-up aggregation provides a genuine picture of coverage, alignment, and MECE-ness.' },
  { id: 5, title: 'Governance is configured, not assumed', detail: 'Different organisational units use different planning models (OKR, PMO stage-gate, Programme, hybrid) — configured per unit, not forced into a single template.' },
  { id: 6, title: 'Planning horizons are explicit and structuring', detail: 'A multi-year strategic priority, an annual operating plan, and a quarterly initiative are distinct objects with distinct structures and review cadences.' },
  { id: 7, title: 'Strategy and financials are linked structurally', detail: 'Every financial line has a strategic rationale; every strategic priority has a financial envelope. Resource allocation patterns reveal whether the organisation is actually funding the change it declared.' },
  { id: 8, title: 'Outcome measurement is non-negotiable', detail: 'Plans commit to measurable outcomes (key results with baselines and targets), not just activities. The platform distinguishes between delivery progress and outcome progress.' },
  { id: 9, title: 'Quality floor is high and variance across units is low', detail: 'AI-guided plan creation, structured templates, and quality gates ensure every unit produces plans of consistent rigour: explicit objectives, testable hypotheses, measurable outcomes.' },
  { id: 10, title: 'AI augments judgement, it does not replace it', detail: 'The cognitive heavy-lifting (decomposition, draft generation, coherence analysis, financial feasibility) is delegated to AI. But selecting priorities, making trade-offs, and committing resources remain fundamentally human acts.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function jtbdTitle(j: string | CanvasJTBD): string {
  return typeof j === 'string' ? j : j.title
}

function StrategicPlanContent() {
  const [detailedView, setDetailedView] = useState(false)

  // Vision hooks
  const { data: visionCard, isLoading: visionCardLoading } = useVisionCard('plan')
  const { data: visionCallouts, isLoading: calloutsLoading } = useVisionCardCallouts('plan')
  const updateVisionCard = useUpdateVisionCard('plan')
  const updateVisionCardCallout = useUpdateVisionCardCallout('plan')
  const addVisionCardCallout = useAddVisionCardCallout('plan')

  // Persona hooks
  const { data: personaItems, isLoading: personasItemsLoading } = usePersonas('plan')
  const { data: jtbdItems, isLoading: jtbdsLoading } = usePersonaJTBDs('plan')
  const updatePersona = useUpdatePersona('plan')
  const addPersona = useAddPersona('plan')
  const updatePersonaJTBD = useUpdatePersonaJTBD('plan')
  const addPersonaJTBD = useAddPersonaJTBD('plan')
  const deletePersonaJTBD = useDeletePersonaJTBD('plan')

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
        addVisionCardCallout.mutate({ type: 'plan_vision_card_callout', title: vision.callout.label, subtitle: null, description: vision.callout.body, order_value: 1, parent_id: null })
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
            addPersonaJTBD.mutate({ type: 'plan_persona_jtbd', title, subtitle: inst, description: cog, order_value: jIndex + 1, parent_id: numId })
          }
        })
        // Delete JTBDs that were removed
        existingJtbds.slice(persona.jtbds.length).forEach(j => {
          deletePersonaJTBD.mutate(j.id)
        })
      } else {
        addPersona.mutate({ type: 'plan_persona', ...personaData, subtitle: null, parent_id: null })
      }
    })
  }

  return (
    <>
      <PageHeader
        sticky
        back={{ to: '..' }}
        title="Strategic Plan"
        subtitle="Translating strategy into plans people can own and commit to — with coherent cascade, hypothesis-driven charters, and living financial links."
        breadcrumbs={[{ label: 'Product Vision', to: '..' }, { label: 'Strategic Plan' }]}
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
        <CommentableRegion id="plan-canvas" label="Vision Canvas" className="flex-1 min-w-0">
          <VisionCanvas
            accent="warning"
            canvasId="plan"
            visionStatement={visionStatement}
            visionDetail={visionDetail}
            visionCallout={visionCallout}
            personas={personas}
            pains={PAINS}
            painSubtitle="A compelling strategic priority, agreed at the top, loses its meaning as it cascades through organisational layers — each level reinterpreting it, filtering it, or burying it under a pile of activities."
            painCallout={{ label: 'The Result', body: 'Teams are busy, managers are reporting, and leadership has no idea whether the organisation is making strategic progress or just spinning.', isDestructive: true }}
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

function StrategicPlanPage() {
  const location = useLocation()
  const nav = location.state as { panelOpen?: boolean; typeFilter?: CommentType } | null
  return (
    <CommentProvider initialPanelOpen={nav?.panelOpen} initialTypeFilter={nav?.typeFilter}>
      <StrategicPlanContent />
    </CommentProvider>
  )
}
