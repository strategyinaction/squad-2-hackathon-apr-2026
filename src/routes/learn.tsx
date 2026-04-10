import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLocation } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { LogoutButton } from '#/components/LogoutButton'
import { VisionCanvas } from '#/components/VisionCanvas'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton, type CommentType } from '#/components/CommentingSystem'
import type { CanvasPersona, CanvasPain, CanvasSuccess, CanvasSolution } from '#/components/VisionCanvas'

export const Route = createFileRoute('/learn')({ component: LearnAdaptPage })

// ─── Canvas Data ──────────────────────────────────────────────────────────────

const PERSONAS: CanvasPersona[] = [
  {
    id: 'elt',
    label: 'Executive Leadership',
    quote: '"I need to understand what execution is telling us about our strategy, make timely decisions about where to double down, pivot, or stop, and ensure those decisions actually reach the teams doing the work."',
    jtbds: [
      {
        title: 'Understand what execution data means for the strategy: receive synthesised learning that connects execution signals to strategic hypotheses, not raw dashboards',
        institutionalTemplate: `Executive learning brief: structured summary connecting execution data to the strategic hypotheses they inform — delivering meaning, not raw metrics. Delivered per review cadence.

Hypothesis health: each strategic hypothesis tracked with validation status (untested, supported, challenged, invalidated) and evidence trail.`,
        cognitiveAutomation: `AI generates hypothesis-level briefs: for each strategic bet, what the execution data is telling us — is the hypothesis holding, weakening, or invalidated? Synthesised from across all relevant planning units.

Classifies performance issues: distinguishes poor execution (choice is right, implementation is weak) from hypothesis failure (choice itself is flawed).`,
      },
      {
        title: 'Get instant visibility on what needs leadership attention — escalated from the field, flagged by AI, or triggered by hypothesis health changes',
        institutionalTemplate: `Executive dashboard organised around what requires attention from ELT: pending decisions requiring ELT action, past decisions made (decision log), critical learning briefs.

Structured escalation paths ensure that issues surfaced in check-ins or retrospectives reach the right leadership level without being filtered out by intermediate layers.`,
        cognitiveAutomation: `AI triages and prioritises incoming decision requests: ranks by strategic impact (which hypotheses and priorities are affected), urgency (time-sensitivity of the window for action), and evidence strength.

Flags decisions that have been pending too long.

Surfaces patterns across escalations: e.g., "three units have independently flagged the same issue this quarter."`,
      },
      {
        title: "Get timely access to critical learning briefs from execution — synthesised insights connecting what's happening in the field to the strategic hypotheses that matter most",
        institutionalTemplate: `Learning briefs surfaced on the executive dashboard and delivered per review cadence: each brief connects execution signals to the strategic hypothesis it informs, with validation status (supported, challenged, invalidated) and evidence trail.

Briefs are tagged by priority, BU, and hypothesis — filterable and searchable.

Direct link from brief to the underlying check-ins, retrospectives, and metric data that produced it. People can tag specific leaders to learning briefs to get their attention.`,
        cognitiveAutomation: `AI generates learning briefs by synthesising check-ins, retrospectives, and metric movements from across all relevant planning units.

Highlights what's new since last review.

AI prioritises learning briefs by strategic impact.`,
      },
      {
        title: 'Ensure decisions cascade to affected plans, resources, and teams — and that adaptation actually happens',
        institutionalTemplate: `Decision cascade log: each decision linked to the plans it affects, with status tracking on whether downstream adjustments have been made.

Escalation for plans that haven't adapted. Change communication templates: structured rationale distributed to all affected plan owners.

Two-way: plan owners can ask questions or flag concerns.`,
        cognitiveAutomation: `AI monitors cascade completion: alerts when affected plans haven't been updated within the expected timeframe, flags resistance or conflicts.

Communicator agent generates audience-tailored change narratives translating strategic decisions into BU-level and team-level comms.

AI enables natural-language Q&A: "Why was Priority X changed?" returns a traced, evidence-backed explanation.`,
      },
    ],
  },
  {
    id: 'cfo',
    label: 'CFO Office / Finance Business Partner',
    quote: '"I own the numbers. If the metrics aren\'t defined right, connected to their sources, projected forward, and updated on time, no one can learn from execution — because no one trusts the data."',
    jtbds: [
      {
        title: 'Manage the full lifecycle of key metrics: creation, definition, ownership, integration with source systems, and retirement',
        institutionalTemplate: `Metrics library: centralised registry of all metrics with standardised definitions, ownership, taxonomy and classification (Financial, Customer, Process, Learning; leading, lagging), data source configuration (manual entry, API, ERP/CRM integration), and update frequency.

Workflow for metric creation, approval, and change management.

Connection mapping: visualises relationships and dependencies between metrics across plans.`,
        cognitiveAutomation: `AI validates metric definitions for completeness and consistency: flags duplicates, detects metrics that measure the same thing under different names across units, and identifies gaps.

AI suggests metrics to be used and their connections based on causal logic (e.g., "this leading indicator should be linked to that lagging outcome").`,
      },
      {
        title: 'Produce projections and forecasts of key metrics, based on the plans connected to them and their expected impact',
        institutionalTemplate: `Projection workflow: each metric displays its baseline, target, current actual, and forecast trajectory.

Forecasts linked to the plans and activities expected to drive them, making the causal chain from plan to metric movement explicit.

Scenario views: what happens to metric trajectories if specific plans are delayed, scaled, or stopped.`,
        cognitiveAutomation: `AI generates metric forecasts by combining historical trends with the expected impact of connected plans.

AI flags where projected trajectories will miss targets given current execution pace.

AI highlights metrics where multiple plans claim impact but actuals aren't moving.`,
      },
      {
        title: 'Ensure timely updates of actual values according to the governance of execution, maintaining one source of truth for all performance data',
        institutionalTemplate: `Update governance framework: required update cadence per metric (weekly, monthly, quarterly), tied to the overall execution governance.

Dashboard showing update compliance: which metrics are current, which are stale, which are overdue.

Automated ingestion from connected systems where available; structured manual entry workflow with audit trail where not.`,
        cognitiveAutomation: `AI monitors update compliance and flags overdue metrics before review cycles.

Pre-populates actuals from connected data sources (ERP, CRM, project tools) where integrations exist.

Reads structured and unstructured exports from legacy systems to capture data and update metrics.

Flags data quality issues: missing updates, stale metrics, inconsistencies between related metrics, and values that fall outside expected ranges.`,
      },
    ],
  },
  {
    id: 'planowner',
    label: 'Plan Owner / Team Lead',
    quote: '"I\'m closest to the work. I see what the numbers don\'t capture. When leadership changes direction, I need to know quickly, understand why, and adjust rapidly."',
    jtbds: [
      {
        title: 'Capture periodic learning: not just what happened, but why, and what it means for the strategy',
        institutionalTemplate: `Structured check-in workflows, combining milestone status with interpretation prompts: what happened, why, what does it mean for our hypothesis, what should change.

Standardised format feeds both team dashboards and upstream aggregation.

Escalation mechanism: flag an issue as requiring attention, with structured severity and category.`,
        cognitiveAutomation: `AI prompts reflection based on metric actual updates: "Outcome X moved significantly: what do you think caused this?"

AI suggests connections to strategic hypotheses and flags where similar patterns have been observed in other units.

AI identifies signals that warrant attention before they're missed.

AI generates learning briefs that can be shared with the rest of the organisation.`,
      },
      {
        title: 'Access role-specific critical information in one view: my plan context, my metrics, my open actions, upstream decisions that affect me',
        institutionalTemplate: `Role-based and personalised dashboard: my plan's strategic context (parent priority, hypothesis), my metrics, my open actions, and any upstream decisions that affect me — all in one view.`,
        cognitiveAutomation: `AI generates a periodic brief: what's changed in my plan's context, what needs my attention, and what's coming up in the review cycle.`,
      },
      {
        title: 'Receive and act on upstream decisions that affect my plan — with clear context on what changed, why, and what I need to adjust',
        institutionalTemplate: `Cascade notification system: when a parent priority or strategic choice changes, affected plan owners receive structured alerts with the change, rationale, and expected impact.

Plan revision workflow: update objectives, metrics, or activities in response, with change history preserved.`,
        cognitiveAutomation: `Communicator agent translates upstream decisions into plan-owner-level language: "Priority X has been adjusted because [rationale]. For your plan, this means [specific implications]."

AI suggests specific plan adjustments, flagging metrics that need new targets, and pre-populating revised objectives.`,
      },
    ],
  },
  {
    id: 'strategyoffice',
    label: 'Strategy Office',
    quote: '"I need to aggregate learning across dozens of teams, surface the patterns that matter, prepare leadership to decide, and ensure those decisions cascade — without reading hundreds of reports."',
    jtbds: [
      {
        title: 'Aggregate learning across the portfolio and surface systemic patterns from team to BU to enterprise',
        institutionalTemplate: `Team-level check-ins and learning briefs automatically roll up to BU and enterprise views. Structured summaries per BU, per strategic priority, per hypothesis.

Portfolio analytics dashboard: cross-plan views of outcome metrics, delivery status, and hypothesis health.

Filterable by BU, priority, governance mode, and time period.`,
        cognitiveAutomation: `AI synthesises team-level learning into BU-level insight briefs: patterns across units, converging/diverging signals, hypotheses being validated or challenged.

AI performs cross-portfolio pattern analysis: identifies systemic issues (e.g., "all units targeting capability X are underperforming"), correlations between execution patterns and outcomes, and early warning signals.`,
      },
      {
        title: 'Produce QBR reports and prepare leadership for decisions, synthesising execution data, learning, and strategic implications into actionable briefs',
        institutionalTemplate: `QBR report template: standardised structure combining execution metrics, learning summaries, hypothesis status, and decision prompts. Consistent format across all BUs.

Structured review preparation: curated list of insights, flagged issues, and open questions per strategic priority — ready for QBR or strategy review discussions.`,
        cognitiveAutomation: `Programme Manager agent generates draft QBR reports from platform data, synthesising metrics, team learning, and strategic context into a coherent brief.

Highlights the 3–5 issues most requiring leadership attention.

Strategic Advisor agent identifies the highest-impact questions: which bets need re-evaluation, where new information challenges existing assumptions, what trade-offs are becoming urgent.`,
      },
      {
        title: 'Track decisions from insight to implementation — ensuring nothing falls through the cracks',
        institutionalTemplate: `Decision register: each decision captured with its trigger (learning/insight), rationale, owner, deadline, affected plans, and implementation status. Full audit trail from signal to action.

Cascade management workflow: when a strategic decision changes a priority, the platform maps all affected plans and generates a cascade action list — who needs to change what, by when.`,
        cognitiveAutomation: `AI monitors decision implementation: flags overdue decisions, tracks whether downstream plan adjustments have actually been made, alerts when a decision's intended effect is not materialising in the data.

Performs impact analysis: models which plans, metrics, and resource allocations are affected by a strategic change, and generates a prioritised cascade plan.`,
      },
      {
        title: 'Support the yearly strategy refresh by surfacing accumulated learning, structured as input to the next formulation round',
        institutionalTemplate: `Strategy refresh package: accumulated learning, hypothesis outcomes, decision history, and performance trends over the full cycle — structured by Canvas dimension as input to the Formulate squad.`,
        cognitiveAutomation: `AI generates a strategy refresh brief: what we learned, what held up, what didn't, and what the data suggests for the next strategic cycle.

Connects execution learning back to Canvas dimensions — closing the loop between Learn & Adapt and Formulate.`,
      },
    ],
  },
]

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

function LearnAdaptContent() {
  const [detailedView, setDetailedView] = useState(false)
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
            visionStatement="A world where every execution cycle generates actionable learning that flows automatically up the organisation, triggers timely decisions, and cascades change down to every affected plan and team."
            visionDetail="The organisation builds institutional memory — strategy evolves continuously rather than being reset at the annual offsite. The loop between strategy and execution finally closes."
            visionCallout={{ label: 'The Learning Loop Closes the Circle', body: 'The yearly strategy refresh is supported by a full year of accumulated, structured learning — surfaced as input to the Formulate squad. What we learned, what held up, what didn\'t, and what the data suggests for the next strategic cycle.' }}
            personas={PERSONAS}
            pains={PAINS}
            painSubtitle="The link between strategy and execution is one-directional: strategy flows down, but learning never flows back up."
            painCallout={{ label: 'The Overall Result', body: 'The organisation may have fragments of a learning loop but no adaptation loop. Learnings don\'t accumulate; nothing changes. Strategy becomes a retrospective exercise, not a living capability.', isDestructive: true }}
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

function LearnAdaptPage() {
  const location = useLocation()
  const nav = location.state as { panelOpen?: boolean; typeFilter?: CommentType } | null
  return (
    <CommentProvider initialPanelOpen={nav?.panelOpen} initialTypeFilter={nav?.typeFilter}>
      <LearnAdaptContent />
    </CommentProvider>
  )
}
