import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLocation } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { LogoutButton } from '#/components/LogoutButton'
import { VisionCanvas } from '#/components/VisionCanvas'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton, type CommentType } from '#/components/CommentingSystem'
import type { CanvasPersona, CanvasPain, CanvasSuccess, CanvasSolution } from '#/components/VisionCanvas'

export const Route = createFileRoute('/plan')({ component: StrategicPlanPage })

// ─── Canvas Data ──────────────────────────────────────────────────────────────

const PERSONAS: CanvasPersona[] = [
  {
    id: 'elt',
    label: 'Executive Leadership',
    quote: '"I need to shape a strategic plan that translates our choices into a coherent set of priorities, cascade it across the organisation, and verify that the whole adds up — before execution begins."',
    jtbds: [
      {
        title: 'Select the building blocks of the strategic plan: strategic priorities, enabling priorities, and strategic projects — anchored to the strategic choices and winning ambition',
        institutionalTemplate: `Priority selection workflow linked to the Strategy Canvas: each candidate priority displays its connection to one or more strategic choices (and to the Winning Ambition).

Structured taxonomy by type (strategic, enabling) and horizon (H1-Core, H2-Scale, H3-Future).

Visual coverage map showing which choices are served and which are uncovered.`,
        cognitiveAutomation: `AI proposes candidate priorities derived from the strategic choices and their underlying hypotheses.

AI flags gaps — choices with no supporting priority — and overlaps — priorities that duplicate effort across dimensions.

AI scores coherence between the priority portfolio and the Winning Ambition.`,
      },
      {
        title: 'Plan each strategic priority in all its necessary elements: objective, key results, hypotheses, timeline, activities, team, financial envelope, and risk',
        institutionalTemplate: `Structured charter template (consistent across all plan types) that enforces completeness: objective linked to rationale, 2–4 key results with baselines and targets, hypotheses in If/Then/Because format with confidence levels, milestones, benefits, CapEx/OpEx, and risk register.

Draft vs. publish workflow. Quality gates prevent publication of incomplete plans.`,
        cognitiveAutomation: `AI generates a structured Q&A wizard that walks the user through each charter element step by step — proposing draft answers grounded in the strategic context (choices, hypotheses, winning ambition) that the user can accept, edit, or overwrite. The user remains in control; the AI accelerates, it does not dictate.

AI Strategic Advisor stress-tests the completed charter's internal logic: do the activities plausibly produce the key results? Do the hypotheses cover the critical assumptions?`,
      },
      {
        title: 'Cascade the strategic plan across business units and country units, preserving strategic intent while allowing local contextualisation',
        institutionalTemplate: `Hierarchical cascade structure according to the governance structure previously set.

Each child plan inherits its parent's strategic context, hypotheses, and outcome expectations.

Cascade vs. Contributes connection types define rigidity. Cascade tracker shows completion status per unit: which units have published aligned plans, which are still in draft, which have not started.`,
        cognitiveAutomation: `AI suggests draft cascade plans per unit, adapting parent priorities to local context (market, competitive position, regulatory environment) while preserving strategic alignment.

Flags units that have not initiated cascade.

Detects semantic drift: where a child plan's content has diverged from the parent's intent.`,
      },
      {
        title: 'Review the overall strategic plan across units to ensure coherence — coverage, alignment, MECE-ness, and financial feasibility',
        institutionalTemplate: `Portfolio view: all plans visible in a single grid, filterable by BU, country, plan type, horizon, and status.

Cross-plan comparison using identical structure and fields.

Aggregated financial view: total investment per priority, per unit, per horizon — surfacing over/under-allocation against strategic weight.

Connection map visualising the full cascade tree with alignment indicators.`,
        cognitiveAutomation: `AI performs portfolio-level coherence analysis: identifies orphan plans (no parent linkage), uncovered priorities (strategic choices with no downstream plans), conflicting objectives between sibling units, and MECE violations (overlaps and gaps).

Generates a coherence scorecard with specific remediation prompts.`,
      },
    ],
  },
  {
    id: 'teamlead',
    label: 'Team Lead / Plan Owner',
    quote: '"I need to turn a strategic priority into an annual plan my team can own and deliver — with clear objectives, measurable outcomes, and a direct line back to the strategy."',
    jtbds: [
      {
        title: 'Break down a strategic priority into team-level annual OKRs and/or Initiatives, selecting the right planning instrument for each piece of work',
        institutionalTemplate: `Each annual plan (OKR or Initiative) is created within the context of its parent strategic priority, inheriting strategic context, hypotheses, and outcome expectations.

Structured templates per plan type: OKRs for outcome-driven goals, Initiatives for scoped deliverables.

Parent-child linkage enforced; the team lead sees exactly which priority they are serving and what success looks like upstream.`,
        cognitiveAutomation: `AI generates a structured Q&A conversation that guides the decomposition: proposes candidate OKRs or Initiatives derived from the parent priority's logic and the team's domain, with suggested answers the user can accept, edit, or overwrite.

AI flags any gap (e.g. where the parent priority's key results are not yet covered by any child plan).

AI suggests the appropriate plan type (OKR vs. Initiative).`,
      },
      {
        title: 'Plan each OKR or Initiative fully: objective, key results, hypotheses, timeline, activities, team, and financial envelope',
        institutionalTemplate: `Structured charter (consistent across units) that enforces completeness: objective linked to rationale and parent priority, 2–4 key results with baselines and targets, hypotheses in If/Then/Because format, milestones, activities, team allocation, and budget (CapEx/OpEx).

Draft vs. publish workflow with quality gates. Visual lineage always visible: team goal → BU priority → corporate strategy.`,
        cognitiveAutomation: `AI walks the user through the charter step by step, proposing draft answers grounded in the parent priority's context and the team's historical data.

Suggests key results aligned to the parent's outcome expectations, generates hypotheses from the team's specific execution logic, and flags gaps or inconsistencies.

Strategic Advisor stress-tests the completed plan: do the activities plausibly produce the key results? Is the financial envelope realistic given scope?`,
      },
      {
        title: "Review the overall annual plan for consistency, coherence, and coverage across the team's OKRs and Initiatives",
        institutionalTemplate: `Annual Plan overview showing all of the team's plans in a single view: objectives, key results, timelines, and parent linkages.

Visual indicators for coverage (which parent key results are addressed), overlap (duplicate effort across plans), and conflicts.`,
        cognitiveAutomation: `AI performs coherence analysis across the team's annual plan portfolio: flags objectives that overlap or conflict, identifies parent key results with no downstream coverage, detects timeline bottlenecks where too many milestones converge, and checks that aggregated financial commitments fit within the team's budget envelope.

Generates a coherence summary with specific items to resolve before publishing.`,
      },
    ],
  },
  {
    id: 'strategyoffice',
    label: 'Strategy Office / Consultants',
    quote: '"I need to design how planning works, drive it to completion across all units, and guarantee that the result is coherent — before anyone starts executing."',
    jtbds: [
      {
        title: 'Design and configure the planning governance — cadence, cascading rules, approval gates, and governance modes per organisational unit',
        institutionalTemplate: `Governance configuration workspace: define how many cascade levels, planning taxonomy per unit (OKR, PMO stage-gate, Programme, hybrid), required vs. optional charter fields per mode, approval workflows, and review cadence.

Template library of pre-built planning models adaptable to different organisational contexts.

Cascade rigidity settings (tight / moderate / loose) control how much freedom child plans have to diverge from parent intent.`,
        cognitiveAutomation: `AI recommends governance configurations based on Q&As on organisational complexity, number of planning units, and the nature of each unit's work (team size, time horizon, dependency profile).

AI suggests which units suit OKR vs. PMO vs. Programme modes. Flags where governance settings may be too rigid (stifling local adaptation) or too loose (risking strategic drift), based on Q&A conversations.`,
      },
      {
        title: 'Orchestrate the end-to-end planning process — drive planning to completion across all units within deadlines and quality standards',
        institutionalTemplate: `Planning process dashboard: real-time view of planning status across all organisational units — who has published, who is in draft, who has not started.

Milestone tracker per planning cycle with ownership and deadlines. Notification engine that prompts plan owners at key gates.

Quality gates enforced per governance mode: plans cannot be published until mandatory fields are complete and parent linkage is established.`,
        cognitiveAutomation: `AI monitors planning progress and identifies bottlenecks: units falling behind schedule, plans stuck in draft with incomplete sections, approval queues creating delays.

Generates status briefs for the Strategy Office highlighting where intervention is needed. Sends contextualised nudges to plan owners — not generic reminders, but specific prompts ("Your OKR is missing key results for parent KR #3").`,
      },
      {
        title: 'Assure quality and coherence across the full cascade — cross-unit review, MECE analysis, and alignment validation before plans go live',
        institutionalTemplate: `Cross-plan comparison views: identical structure and fields across all units, enabling side-by-side analysis at every cascade level.

Portfolio views (scope × horizon) showing the full plan landscape. Overlap and gap detection across sibling plans.

Aggregated financial view: total investment per priority, per unit, per horizon.

Alignment dashboard: % of plans linked, % with outcome metrics, % passing quality gates.`,
        cognitiveAutomation: `AI performs portfolio-level coherence analysis: identifies orphan plans (no parent linkage), uncovered priorities (strategic choices with no downstream plans), conflicting objectives between sibling units, and MECE violations (overlaps and gaps).

Generates a coherence scorecard with specific remediation items — actionable, not just diagnostic.`,
      },
    ],
  },
  {
    id: 'cfo',
    label: 'CFO / Finance Partner',
    quote: '"I need to build the financial plan that funds the strategy, ensure resource allocation actually reflects the strategic choices, and flag where ambition exceeds financial reality — before we commit."',
    jtbds: [
      {
        title: 'Formulate the financial plan (long-range and annual) connected to strategic priorities — every financial line linked to a strategic rationale, every priority backed by a financial envelope',
        institutionalTemplate: `Financial plan structure linked to each planning unit: CapEx, OpEx, revenue projections, and investment requirements connected to the priorities they fund.

Dual-horizon view (long-range + annual). AOP template linking each annual objective to its parent strategic priority, with required fields for resource requirements (people, budget) and financial projections (revenue impact, cost savings).

Structured connection between operating plan and financial plan: no financial line without a strategic rationale, no strategic priority without a financial envelope.

Integrates with FP&A software when available at the client.`,
        cognitiveAutomation: `Via structured Q&A conversations, AI generates draft financial projections across multiple planning scenarios, based on strategic plan commitments, historical patterns, and benchmark data.

Flags orphan lines: priorities with no financial allocation and budget lines with no strategic justification.

Pre-populates AOP financial fields from parent priority data where available.`,
      },
      {
        title: 'Ensure resource allocation reflects the direction of strategic change — verify the money is actually shifting where the strategy demands it',
        institutionalTemplate: `Resource allocation view overlaid on the strategic portfolio: spend per priority, per BU, per horizon.

Year-on-year allocation comparison showing how spend has moved relative to strategic intent.

Configurable allocation rules and thresholds.`,
        cognitiveAutomation: `AI analyses allocation patterns against the strategic choices and their implied From→To shifts. Core question: is the organisation funding the change it declared, or is money flowing to the same places it always flowed?

AI highlights the gap between declared strategy and revealed strategy (i.e., where the money actually goes).`,
      },
      {
        title: 'Stress-test the financial feasibility of the strategic plan: surface where ambition exceeds capacity and force explicit trade-offs',
        institutionalTemplate: `Gap analysis view: strategic commitments that exceed financial capacity, and financial reserves not allocated to any strategic priority.

Scenario modelling workspace: model the financial implications of different portfolio configurations (e.g., what if we fund Priority A at full ambition — what must we cut?).`,
        cognitiveAutomation: `AI models financial feasibility under different scenarios — flagging where ambitions outstrip resources and quantifying the trade-offs.

Suggests rebalancing options: which priorities could absorb a budget reduction with minimal impact on key results, and which are underfunded relative to their strategic weight.

Simulates the cascade effect of reallocation decisions across units.`,
      },
    ],
  },
]

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

function StrategicPlanContent() {
  const [detailedView, setDetailedView] = useState(false)
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
            visionStatement="A world where every plan traces back to a strategic choice, states not just what but why it will work, and evolves continuously as execution generates learning."
            visionDetail="Plans are not documents — they are shared commitments and testable experiments. Every team, from executive leadership to the front line, works from a plan that is connected, hypothesis-driven, outcome-focused, living, and financially linked."
            visionCallout={{ label: 'Cascade & Aggregation', body: 'The platform provides granular cascade and aggregation — one of its most distinctive capabilities. Cascade flows top-down; aggregation flows bottom-up. Because hypotheses and assumptions are explicit, execution generates learning seamlessly.' }}
            personas={PERSONAS}
            pains={PAINS}
            painSubtitle="A compelling strategic priority, agreed at the top, loses its meaning as it cascades through organisational layers — each level reinterpreting it, filtering it, or burying it under a pile of activities."
            painCallout={{ label: 'The Result', body: 'Teams are busy, managers are reporting, and leadership has no idea whether the organisation is making strategic progress or just spinning.', isDestructive: true }}
            solutions={SOLUTIONS}
            successItems={SUCCESS_ITEMS}
            detailedView={detailedView}
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
