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

export const Route = createFileRoute('/learn')({ component: LearnAdaptPage })

// ─── Static Canvas Data ───────────────────────────────────────────────────────

const PAINS: CanvasPain[] = [
  { id: 1, title: 'No structured mechanism for capturing learning', description: 'Check-ins happen, QBRs are held, but the insights generated in these moments are trapped in meeting notes, emails, or individual memory. There is no systematic way to capture what was learned, by whom, and what it means for the strategy.' },
  { id: 2, title: 'Execution data exists but meaning does not', description: 'Dashboards track KPIs and OKR progress, but numbers are not easily interpreted and given meaning. A metric moving from red to green tells you what happened, not why it happened, whether the underlying hypothesis held, or what it means for the next quarter.', personaIds: ['elt'] },
  { id: 3, title: 'Learning is local and siloed', description: 'Even when teams learn something valuable, the insight stays within the team. There is no mechanism to aggregate learning across business units, identify patterns, and surface them to leadership. The organisation repeats the same mistakes in different places.', personaIds: ['strategyoffice'] },
  { id: 4, title: 'Decisions fall through the cracks', description: 'Insights surface in QBRs, retrospectives, or leadership discussions, but there is no rapid mechanism to flag them as decisions needed, assign ownership, or track whether they were actually made and then implemented.', personaIds: ['strategyoffice'] },
  { id: 5, title: 'The feedback loop is too slow', description: 'In most organisations, the cycle from "we learned something" to "we changed something" runs on a quarterly or annual cadence. By the time a strategic adjustment makes it through governance and cascades to the teams doing the work, the window of opportunity has often closed.' },
  { id: 6, title: "Adaptation doesn't cascade", description: 'Even when a decision is made at the top — to pivot a priority, stop an initiative, double down on a bet — it takes weeks or months for that decision to reach the actions, resources, and activities it affects.', personaIds: ['elt'] },
  { id: 7, title: 'Reporting progress is tedious and burdensome', description: 'Tracking tens and hundreds of plans, metrics, and activities involves a highly time-consuming process to provide progress reports and ensuring everything is up to date.', personaIds: ['planowner'] },
  { id: 8, title: 'Metric lifecycle is unmanaged and data quality is unreliable', description: 'Metrics are created informally, defined inconsistently across teams, and rarely retire. Duplicate metrics measuring the same thing under different names pollute the data. Without a central registry and governance workflow, no one trusts the numbers — and learning built on bad data leads nowhere.', personaIds: ['cfo'] },
]

const SOLUTIONS: CanvasSolution[] = [
  {
    id: 1,
    title: 'Structured check-in workflows',
    description: 'Combine milestone status with interpretation prompts: what happened, why, what does it mean for the hypothesis, what should change. AI prompts reflection based on metric movements and suggests connections to strategic hypotheses.',
    painIds: [1, 7],
  },
  {
    id: 2,
    title: 'AI hypothesis-level learning briefs',
    description: 'For each strategic bet, synthesises what execution data is telling us: is the hypothesis holding, weakening, or invalidated? Distinguishes poor execution (choice is right, implementation is weak) from hypothesis failure (choice itself is flawed).',
    painIds: [2, 3],
  },
  {
    id: 3,
    title: 'Automatic learning aggregation',
    description: 'Team-level check-ins and learning briefs automatically roll up to BU and enterprise views without manual consolidation. Patterns emerge naturally: which bets are paying off, where surprises are emerging, what assumptions need challenging.',
    painIds: [3, 5],
  },
  {
    id: 4,
    title: 'Decision register with cascade tracking',
    description: "Every decision is captured with its trigger, rationale, owner, deadline, and affected plans. AI monitors implementation and alerts when a decision's intended effect is not materialising in the data.",
    painIds: [4, 6],
  },
  {
    id: 5,
    title: 'AI-generated QBR reports',
    description: 'Programme Manager agent generates draft QBR reports by synthesising metrics, team learning, and strategic context into a coherent brief that flags the 3–5 issues most requiring leadership attention. Preparation drops from days to minutes.',
    painIds: [5, 7],
  },
  {
    id: 6,
    title: 'Instant decision cascade to affected plans',
    description: 'When a strategic priority is adjusted, the platform propagates the change through every affected plan, OKR, and resource allocation — flagging what needs to change and who needs to act within hours, not weeks.',
    painIds: [5, 6],
  },
  {
    id: 7,
    title: 'Metrics library with lifecycle governance',
    description: 'Centralised registry of all metrics with standardised definitions, ownership, taxonomy, and data source configuration. AI validates definitions, detects duplicates across units, and flags data quality issues before they corrupt learning.',
    painIds: [8],
  },
  {
    id: 8,
    title: 'Personalised dashboard per role',
    description: "My plan's strategic context, my metrics, my open actions, and any upstream decisions that affect me — all in one view. AI generates a periodic brief on what's changed and what needs attention in the current review cycle.",
    painIds: [2, 7],
  },
]

const SUCCESS_ITEMS: CanvasSuccess[] = [
  { id: 1, title: 'Every planning unit generates structured learning, not just status updates', detail: 'Check-ins capture interpretation alongside metrics: what the team believes is happening and why, in under 10 minutes. Learning is a first-class output of execution, not an afterthought.' },
  { id: 2, title: 'Interpretation matters more than data', detail: 'A metric without context is noise. The platform always pairs quantitative signals with qualitative interpretation: what does this number mean, why did it change, and what should we do about it.' },
  { id: 3, title: 'Learning is connected to hypotheses', detail: 'Every learning signal is traceable back to the strategic hypothesis it informs. This is what distinguishes strategic learning from operational reporting — and what makes the Learning Loop work.' },
  { id: 4, title: 'Learning flows upward automatically', detail: 'Team-level insights aggregate to BU and enterprise views without manual consolidation. Patterns emerge naturally: which bets are paying off, where surprises are emerging, what assumptions need challenging.' },
  { id: 5, title: 'QBR preparation drops from days to minutes', detail: 'AI synthesises execution data, team learning, and strategic context into draft briefs that flag the issues requiring leadership attention. Humans spend time deciding, not preparing.' },
  { id: 6, title: 'The organisation practises double-loop learning', detail: 'The platform explicitly supports two types of adaptation: adjusting execution (single-loop: are we executing well?) and questioning the strategy itself (double-loop: are we executing the right thing?).' },
  { id: 7, title: 'Decisions are objects, not events', detail: 'Every decision is captured with its rationale, linked to the learning that triggered it, assigned to an owner, given a deadline, and tracked to completion. Nothing falls through the cracks.' },
  { id: 8, title: 'Cascade is a platform capability, not a communication exercise', detail: 'When a strategic priority is adjusted, every downstream plan is flagged within hours — with clear guidance on what needs to change. Plan owners are not left guessing.' },
  { id: 9, title: 'Speed of adaptation is a competitive advantage', detail: 'The value of learning is time-decayed. An insight acted on in a week is worth more than the same insight acted in a quarter. The platform compresses the cycle from signal to decision to action.' },
  { id: 10, title: 'The organisation builds institutional memory', detail: 'Lessons from past cycles are searchable, structured, and connected — not buried in old slide decks. The yearly strategy refresh is informed by a full year of accumulated, structured learning.' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function jtbdTitle(j: string | CanvasJTBD): string {
  return typeof j === 'string' ? j : j.title
}

function LearnAdaptContent() {
  const [detailedView, setDetailedView] = useState(false)

  // Vision hooks
  const { data: visionCard, isLoading: visionCardLoading } = useVisionCard('learn')
  const { data: visionCallouts, isLoading: calloutsLoading } = useVisionCardCallouts('learn')
  const updateVisionCard = useUpdateVisionCard('learn')
  const updateVisionCardCallout = useUpdateVisionCardCallout('learn')
  const addVisionCardCallout = useAddVisionCardCallout('learn')

  // Persona hooks
  const { data: personaItems, isLoading: personasItemsLoading } = usePersonas('learn')
  const { data: jtbdItems, isLoading: jtbdsLoading } = usePersonaJTBDs('learn')
  const updatePersona = useUpdatePersona('learn')
  const addPersona = useAddPersona('learn')
  const updatePersonaJTBD = useUpdatePersonaJTBD('learn')
  const addPersonaJTBD = useAddPersonaJTBD('learn')
  const deletePersonaJTBD = useDeletePersonaJTBD('learn')

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
        addVisionCardCallout.mutate({ type: 'learn_vision_card_callout', title: vision.callout.label, subtitle: null, description: vision.callout.body, order_value: 1, parent_id: null })
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
            addPersonaJTBD.mutate({ type: 'learn_persona_jtbd', title, subtitle: inst, description: cog, order_value: jIndex + 1, parent_id: numId })
          }
        })
        // Delete JTBDs that were removed
        existingJtbds.slice(persona.jtbds.length).forEach(j => {
          deletePersonaJTBD.mutate(j.id)
        })
      } else {
        addPersona.mutate({ type: 'learn_persona', ...personaData, subtitle: null, parent_id: null })
      }
    })
  }

  return (
    <>
      <PageHeader
        sticky
        back={{ to: '..' }}
        title="Learn & Adapt"
        subtitle="Extracting meaning from execution and turning insights into timely, cascaded decisions."
        breadcrumbs={[{ label: 'Product Vision', to: '..' }, { label: 'Learn & Adapt' }]}
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
        <CommentableRegion id="learn-canvas" label="Vision Canvas" className="flex-1 min-w-0">
          <VisionCanvas
            accent="success"
            canvasId="learn"
            visionStatement={visionStatement}
            visionDetail={visionDetail}
            visionCallout={visionCallout}
            personas={personas}
            pains={PAINS}
            painSubtitle="The link between strategy and execution is one-directional: strategy flows down, but learning never flows back up."
            painCallout={{ label: 'The Overall Result', body: 'The organisation may have fragments of a learning loop but no adaptation loop. Learnings don\'t accumulate; nothing changes. Strategy becomes a retrospective exercise, not a living capability.', isDestructive: true }}
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

function LearnAdaptPage() {
  const location = useLocation()
  const nav = location.state as { panelOpen?: boolean; typeFilter?: CommentType } | null
  return (
    <CommentProvider initialPanelOpen={nav?.panelOpen} initialTypeFilter={nav?.typeFilter}>
      <LearnAdaptContent />
    </CommentProvider>
  )
}
