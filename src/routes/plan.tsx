import { createFileRoute } from '@tanstack/react-router'
import { useLocation } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { LogoutButton } from '#/components/LogoutButton'
import { VisionCanvas } from '#/components/VisionCanvas'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton, type CommentType } from '#/components/CommentingSystem'
import type { CanvasPersona, CanvasPain, CanvasPoint, CanvasSuccess } from '#/components/VisionCanvas'

export const Route = createFileRoute('/plan')({ component: StrategicPlanPage })

// ─── Canvas Data ──────────────────────────────────────────────────────────────

const PERSONAS: CanvasPersona[] = [
  {
    id: 'elt',
    label: 'Executive Leadership',
    quote: '"I need to shape a strategic plan that translates our choices into a coherent set of priorities, cascade it across the organisation, and verify that the whole adds up — before execution begins."',
    jtbds: [
      'Select the building blocks of the strategic plan: strategic priorities, enabling priorities, and strategic projects — anchored to the strategic choices and winning ambition',
      'Plan each strategic priority in all its necessary elements: objective, key results, hypotheses, timeline, activities, team, financial envelope, and risk',
      'Cascade the strategic plan across business units and country units, preserving strategic intent while allowing local contextualisation',
      'Review the overall strategic plan across units to ensure coherence — coverage, alignment, MECE-ness, and financial feasibility',
    ],
  },
  {
    id: 'teamlead',
    label: 'Team Lead / Plan Owner',
    quote: '"I need to turn a strategic priority into an annual plan my team can own and deliver — with clear objectives, measurable outcomes, and a direct line back to the strategy."',
    jtbds: [
      'Break down a strategic priority into team-level annual OKRs and/or Initiatives, selecting the right planning instrument for each piece of work',
      'Plan each OKR or Initiative fully: objective, key results, hypotheses, timeline, activities, team, and financial envelope',
      'Review the overall annual plan for consistency, coherence, and coverage across the team\'s OKRs and Initiatives',
    ],
  },
  {
    id: 'cfo',
    label: 'CFO / Finance Partner',
    quote: '"I need to build the financial plan that funds the strategy, ensure resource allocation actually reflects the strategic choices, and flag where ambition exceeds financial reality — before we commit."',
    jtbds: [
      'Formulate the financial plan (long-range and annual) connected to strategic priorities — every financial line linked to a strategic rationale, every priority backed by a financial envelope',
      'Ensure resource allocation reflects the direction of strategic change — verify the money is actually shifting where the strategy demands it',
      'Stress-test the financial feasibility of the strategic plan: surface where ambition exceeds capacity and force explicit trade-offs',
    ],
  },
]

const PAINS: CanvasPain[] = [
  { id: 1, title: 'The "why" has been lost', description: 'Teams receive objectives but not the reasoning behind them. They don\'t know what the organisation is betting on, what assumptions have been made, or what success is really supposed to look like. They execute in the dark.' },
  { id: 2, title: 'Outcomes have been replaced by activities', description: 'Measurement systems reward task completion, not value creation. "We delivered the training programme" becomes the goal, not "we increased capability in X." Busyness is mistaken for progress.' },
  { id: 3, title: 'Plans are written and forgotten', description: 'Planning is treated as an event — a document produced to satisfy governance — rather than a living tool for alignment and learning. Plans are outdated the moment they\'re filed.' },
  { id: 4, title: 'Strategy and financials are disconnected', description: 'Long-range plans and annual operating plans exist in separate worlds. There is no live link between strategic priorities, the financial plan, and the resources allocated to execute them.' },
  { id: 5, title: 'Missing links and alignment across entities', description: 'Different entities, business units, and functions often receive top-down guidelines and develop their plans in silos, using different formats and missing out on possible cross-entity synergies.' },
]

const PRODUCT_POINTS: CanvasPoint[] = [
  { headline: 'Explicitly connected to the strategy it serves', detail: 'Every plan traces directly to the strategic choice it executes. No orphan plans, no unfunded priorities. The organisation can navigate from a winning ambition down to a team-level OKR and back up again, with every link explicit.' },
  { headline: 'Hypothesis-driven: stating not just what, but why', detail: 'Every plan captures what we will do, why we believe it will work (hypotheses in If/Then/Because format), and how we will know (key results with baselines and targets). This framing connects planning directly to learning.' },
  { headline: 'Outcome-focused: measuring value created', detail: 'Plans commit to measurable outcomes — key results with baselines and targets — not just activities and deliverables. The platform distinguishes between delivery progress and outcome progress.' },
  { headline: 'Living: updated as context shifts', detail: 'A plan is not a document. It\'s a shared commitment and a testable experiment. Because hypotheses and assumptions are explicit, execution generates learning seamlessly. Plans evolve with the business.' },
  { headline: 'Linked to financials: structurally, not rhetorically', detail: 'Every financial line has a strategic rationale; every strategic priority has a financial envelope. Resource allocation patterns reveal whether the organisation is actually funding the change it declared.' },
  { headline: 'Compatible with other units: synergies are visible', detail: 'AI detects overlaps, gaps, and MECE violations across sibling plans — and generates coherence scorecards with specific remediation prompts.' },
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

function StrategicPlanContent() {
  return (
    <>
      <PageHeader
        back={{ to: '..' }}
        title="Strategic Plan"
        subtitle="Translating strategy into plans people can own and commit to — with coherent cascade, hypothesis-driven charters, and living financial links."
        breadcrumbs={[{ label: 'Product Vision', to: '..' }, { label: 'Strategic Plan' }]}
        actions={<><ExportButton /><CommentsToggleButton /><LogoutButton /></>}
      />
      <div className="flex gap-6">
        <CommentableRegion id="plan-canvas" label="Vision Canvas" className="flex-1 min-w-0">
          <VisionCanvas
            accent="warning"
            canvasId="plan"
            visionStatement="A world where every plan traces back to a strategic choice, states not just what but why it will work, and evolves continuously as execution generates learning."
            visionDetail="Plans are not documents — they are shared commitments and testable experiments. Every team, from executive leadership to the front line, works from a plan that is connected, hypothesis-driven, outcome-focused, living, and financially linked."
            visionCallout={{ label: 'Cascade & Aggregation', body: 'The platform provides granular cascade and aggregation — one of its most distinctive capabilities. Cascade flows top-down; aggregation flows bottom-up. Because hypotheses and assumptions are explicit, execution generates learning seamlessly.' }}
            personas={PERSONAS}
            pains={PAINS}
            painSubtitle="A compelling strategic priority, agreed at the top, loses its meaning as it cascades through organisational layers — each level reinterpreting it, filtering it, or burying it under a pile of activities."
            painCallout={{ label: 'The Result', body: 'Teams are busy, managers are reporting, and leadership has no idea whether the organisation is making strategic progress or just spinning.', isDestructive: true }}
            productPoints={PRODUCT_POINTS}
            successItems={SUCCESS_ITEMS}
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
