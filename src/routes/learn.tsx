import { createFileRoute } from '@tanstack/react-router'
import { useLocation } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { LogoutButton } from '#/components/LogoutButton'
import { VisionCanvas } from '#/components/VisionCanvas'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton, type CommentType } from '#/components/CommentingSystem'
import type { CanvasPersona, CanvasPain, CanvasPoint, CanvasSuccess } from '#/components/VisionCanvas'

export const Route = createFileRoute('/learn')({ component: LearnAdaptPage })

// ─── Canvas Data ──────────────────────────────────────────────────────────────

const PERSONAS: CanvasPersona[] = [
  {
    id: 'elt',
    label: 'Executive Leadership',
    quote: '"I need to understand what execution is telling us about our strategy, make timely decisions about where to double down, pivot, or stop, and ensure those decisions actually reach the teams doing the work."',
    jtbds: [
      'Understand what execution data means for the strategy: receive synthesised learning that connects execution signals to strategic hypotheses, not raw dashboards',
      'Get instant visibility on what needs leadership attention — escalated from the field, flagged by AI, or triggered by hypothesis health changes',
      'Get timely access to critical learning briefs from execution — synthesised insights connecting what\'s happening in the field to the strategic hypotheses that matter most',
      'Ensure decisions cascade to affected plans, resources, and teams — and that adaptation actually happens',
    ],
  },
  {
    id: 'planowner',
    label: 'Plan Owner / Team Lead',
    quote: '"I\'m closest to the work. I see what the numbers don\'t capture. When leadership changes direction, I need to know quickly, understand why, and adjust rapidly."',
    jtbds: [
      'Capture periodic learning: not just what happened, but why, and what it means for the strategy',
      'Access role-specific critical information in one view: my plans context, my metrics, my open actions, upstream decisions that affect me',
      'Receive and act on upstream decisions that affect my plan — with clear context on what changed, why, and what I need to adjust',
    ],
  },
  {
    id: 'strategyoffice',
    label: 'Strategy Office',
    quote: '"I need to aggregate learning across dozens of teams, surface the patterns that matter, prepare leadership to decide, and ensure those decisions cascade — without reading hundreds of reports."',
    jtbds: [
      'Aggregate learning across the portfolio and surface systemic patterns from team to BU to enterprise',
      'Produce QBR reports and prepare leadership for decisions, synthesising execution data, learning, and strategic implications into actionable briefs',
      'Track decisions from insight to implementation — ensuring nothing falls through the cracks',
      'Support the yearly strategy refresh by surfacing accumulated learning, structured as input to the next formulation round',
    ],
  },
]

const PAINS: CanvasPain[] = [
  { id: 1, title: 'No structured mechanism for capturing learning', description: 'Check-ins happen, QBRs are held, but the insights generated in these moments are trapped in meeting notes, emails, or individual memory. There is no systematic way to capture what was learned, by whom, and what it means for the strategy.' },
  { id: 2, title: 'Execution data exists but meaning does not', description: 'Dashboards track KPIs and OKR progress, but numbers are not easily interpreted and given meaning. A metric moving from red to green tells you what happened, not why it happened, whether the underlying hypothesis held, or what it means for the next quarter.' },
  { id: 3, title: 'Learning is local and siloed', description: 'Even when teams learn something valuable, the insight stays within the team. There is no mechanism to aggregate learning across business units, identify patterns, and surface them to leadership. The organisation repeats the same mistakes in different places.' },
  { id: 4, title: 'Decisions fall through the cracks', description: 'Insights surface in QBRs, retrospectives, or leadership discussions, but there is no rapid mechanism to flag them as decisions needed, assign ownership, or track whether they were actually made and then implemented.' },
  { id: 5, title: 'The feedback loop is too slow', description: 'In most organisations, the cycle from "we learned something" to "we changed something" runs on a quarterly or annual cadence. By the time a strategic adjustment makes it through governance and cascades to the teams doing the work, the window of opportunity has often closed.' },
  { id: 6, title: "Adaptation doesn't cascade", description: 'Even when a decision is made at the top — to pivot a priority, stop an initiative, double down on a bet — it takes weeks or months for that decision to reach the actions, resources, and activities it affects.' },
  { id: 7, title: 'Reporting progress is tedious and burdensome', description: 'Tracking tens and hundreds of plans, metrics, and activities involves a highly time-consuming process to provide progress reports and ensuring everything is up to date.' },
]

const PRODUCT_POINTS: CanvasPoint[] = [
  { headline: 'Data integration: execution flows directly into strategy', detail: 'The platform connects to the organisation\'s core enterprise systems (ERP, CRM, HRIS, BI tools, project management) so that execution data flows directly into the strategy and plan structure. Numbers are live, linked to the metrics, plans, and hypotheses they inform.' },
  { headline: 'Periodic check-ins are lightweight but structured', detail: 'Capturing not just progress metrics but the team\'s interpretation: what\'s working, what\'s surprising, what assumption needs revisiting. Standardised format feeds both team dashboards and upstream aggregation.' },
  { headline: 'AI interprets execution data in real time', detail: 'Flagging patterns, anomalies, and early signals — and connecting them to the strategic choices they inform. The AI distinguishes between poor execution (choice is right, implementation is weak) and hypothesis failure (choice itself is flawed).' },
  { headline: 'Learning flows easily from team to enterprise', detail: 'QBR reports write themselves, synthesising execution data, team learning, and strategic implications into a coherent brief for leadership — reducing preparation from days to minutes.' },
  { headline: 'Adaptation cascades instantly', detail: 'When leadership decides to pivot a strategic priority, the platform propagates that change through every affected plan, OKR, and resource allocation decision — flagging what needs to change and who needs to act and why.' },
  { headline: 'Double-loop learning: execution vs. strategy', detail: 'The organisation can distinguish between two types of adaptation: adjusting execution (doing the same thing better) and adjusting strategy (questioning whether we\'re doing the right thing).' },
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
  return (
    <>
      <PageHeader
        back={{ to: '..' }}
        title="Learn & Adapt"
        subtitle="Extracting meaning from execution and turning insights into timely, cascaded decisions."
        breadcrumbs={[{ label: 'Product Vision', to: '..' }, { label: 'Learn & Adapt' }]}
        actions={<><ExportButton /><CommentsToggleButton /><LogoutButton /></>}
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
            productPoints={PRODUCT_POINTS}
            successItems={SUCCESS_ITEMS}
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
