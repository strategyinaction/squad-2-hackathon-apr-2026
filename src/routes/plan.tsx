import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import {
  Card,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '#/components/ui'
import { cn } from '#/lib/utils'
import {
  ChevronRight,
  Lightbulb,
  ThumbUp,
  ModeComment,
  Add,
  Flag,
  QuestionMark,
  CheckCircle,
} from '#/icons'

export const Route = createFileRoute('/plan')({
  component: StrategicPlanPage,
})

// ─── Pain Data ────────────────────────────────────────────────────────────────

const PAINS = [
  {
    id: 1,
    title: 'The "why" has been lost',
    description:
      "Teams receive objectives but not the reasoning behind them. They don't know what the organisation is betting on, what assumptions have been made, or what success is really supposed to look like. They execute in the dark.",
  },
  {
    id: 2,
    title: 'Outcomes have been replaced by activities',
    description:
      'Measurement systems reward task completion, not value creation. "We delivered the training programme" becomes the goal, not "we increased capability in X." Busyness is mistaken for progress.',
  },
  {
    id: 3,
    title: 'Plans are written and forgotten',
    description:
      "Planning is treated as an event — a document produced to satisfy governance — rather than a living tool for alignment and learning. Plans are outdated the moment they're filed.",
  },
  {
    id: 4,
    title: 'Strategy and financials are disconnected',
    description:
      "Long-range plans and annual operating plans exist in separate worlds. There is no live link between strategic priorities, the financial plan, and the resources allocated to execute them. The CFO's view and the strategy office's view don't converge.",
  },
  {
    id: 5,
    title: 'Missing links and alignment across entities',
    description:
      'Different entities, business units, and functions often receive top-down guidelines and develop their plans in silos, using different formats and missing out on possible cross-entity synergies.',
  },
]

// ─── Vision Data ──────────────────────────────────────────────────────────────

const VISION_POINTS = [
  {
    headline: 'Explicitly connected to the strategy it serves',
    detail:
      'Every plan traces directly to the strategic choice it executes. No orphan plans, no unfunded priorities. The organisation can navigate from a winning ambition down to a team-level OKR and back up again, with every link explicit.',
  },
  {
    headline: 'Hypothesis-driven: stating not just what, but why',
    detail:
      'Every plan captures what we will do, why we believe it will work (hypotheses in If/Then/Because format), and how we will know (key results with baselines and targets). This framing connects planning directly to learning.',
  },
  {
    headline: 'Outcome-focused: measuring value created',
    detail:
      "Plans commit to measurable outcomes — key results with baselines and targets — not just activities and deliverables. The platform distinguishes between delivery progress and outcome progress.",
  },
  {
    headline: 'Living: updated as context shifts',
    detail:
      "A plan is not a document. It's a shared commitment and a testable experiment. Because hypotheses and assumptions are explicit, execution generates learning seamlessly. Plans evolve with the business.",
  },
  {
    headline: 'Linked to financials: structurally, not rhetorically',
    detail:
      'Every financial line has a strategic rationale; every strategic priority has a financial envelope. Resource allocation patterns reveal whether the organisation is actually funding the change it declared — or just relabelling the status quo.',
  },
  {
    headline: 'Compatible with other units: synergies are visible',
    detail:
      'Relationships and synergies across plans within the organisation are clearly visible. AI detects overlaps, gaps, and MECE violations across sibling plans — and generates coherence scorecards with specific remediation prompts.',
  },
]

// ─── Personas ────────────────────────────────────────────────────────────────

const PERSONAS = [
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
      "Review the overall annual plan for consistency, coherence, and coverage across the team's OKRs and Initiatives",
    ],
  },
  {
    id: 'cfo',
    label: 'CFO / Finance Partner',
    quote: '"I need to build the financial plan that funds the strategy, ensure resource allocation actually reflects the strategic choices, and flag where ambition exceeds financial reality — before we commit."',
    jtbds: [
      'Formulate the financial plan (long-range and annual) connected to strategic priorities — every financial line linked to a strategic rationale, every priority backed by a financial envelope',
      'Ensure resource allocation reflects the direction of strategic change — where the strategy demands a shift, verify the money is actually shifting',
      'Stress-test the financial feasibility of the strategic plan: surface where ambition exceeds capacity and force explicit trade-offs',
    ],
  },
]

// ─── Success Criteria ────────────────────────────────────────────────────────

const SUCCESS = [
  { id: 1, title: 'Every strategic choice has a plan — every plan traces back to a strategic choice', detail: 'No orphan plans, no unfunded priorities. Navigate from winning ambition down to a team-level OKR and back up again, with every link explicit.' },
  { id: 2, title: 'Plans are hypotheses, not contracts', detail: 'Every plan captures what we will do, why we believe it will work (If/Then/Because), and how we will know (key results with baselines and targets). "Did our theory hold up?" replaces "Did we do what we said?"' },
  { id: 3, title: 'Planning is fast, guided, and connected', detail: 'AI-powered Q&A conversations walk users through plan creation step by step — proposing, not dictating. A well-structured, hypothesis-driven plan takes minutes to draft, not weeks.' },
  { id: 4, title: 'The cascade is coherent and aggregation is meaningful', detail: 'Top-down cascade preserves strategic context at every layer: Corporate → BU → Country → Team. Bottom-up aggregation provides leadership with a genuine picture of coverage, alignment, and MECE-ness.' },
  { id: 5, title: 'Governance is configured, not assumed', detail: 'Different organisational units use different planning models (OKR, PMO stage-gate, Programme, hybrid) — configured per unit, not forced into a single template.' },
  { id: 6, title: 'Planning horizons are explicit and structuring', detail: 'A multi-year strategic priority, an annual operating plan, and a quarterly initiative are distinct objects with distinct structures and review cadences.' },
  { id: 7, title: 'Strategy and financials are linked structurally', detail: 'Every financial line has a strategic rationale; every strategic priority has a financial envelope. Resource allocation patterns reveal whether the organisation is actually funding the change it declared.' },
  { id: 8, title: 'Outcome measurement is non-negotiable', detail: 'Plans commit to measurable outcomes (key results with baselines and targets), not just activities. The platform distinguishes between delivery progress and outcome progress.' },
  { id: 9, title: 'Quality floor is high and variance across units is low', detail: 'AI-guided plan creation, structured templates, and quality gates ensure every unit produces plans of consistent rigour: explicit objectives, testable hypotheses, measurable outcomes.' },
  { id: 10, title: 'AI augments judgement, it does not replace it', detail: 'The cognitive heavy-lifting (decomposition, draft generation, coherence analysis, financial feasibility) is delegated to AI. But selecting priorities, making trade-offs, and committing resources remain fundamentally human acts.' },
]

// ─── Ideas Data ───────────────────────────────────────────────────────────────

type IdeaType = 'idea' | 'challenge' | 'question' | 'feedback'

interface Contribution {
  id: number
  author: string
  initials: string
  type: IdeaType
  content: string
  votes: number
  comments: number
  time: string
  voted: boolean
}

const INITIAL_CONTRIBUTIONS: Contribution[] = [
  {
    id: 1,
    author: 'Marco Rossi',
    initials: 'MR',
    type: 'challenge',
    content: "Cascade tracking needs to handle 5–6 levels deep for large enterprise clients — the current 3-level assumption won't work for major multinationals like Unilever or Shell.",
    votes: 11,
    comments: 5,
    time: '4h ago',
    voted: false,
  },
  {
    id: 2,
    author: 'Fiona Adams',
    initials: 'FA',
    type: 'idea',
    content: "The plan wizard should allow \"cloning\" a plan from a previous cycle as a starting point — consultants always want to build on last year's structure rather than start from blank templates.",
    votes: 8,
    comments: 2,
    time: '1d ago',
    voted: false,
  },
  {
    id: 3,
    author: 'Chen Wei',
    initials: 'CW',
    type: 'question',
    content: 'How does the financial plan handle multi-currency scenarios for global enterprises? CFOs will need to see consolidated plans in both local currency and group reporting currency.',
    votes: 6,
    comments: 7,
    time: '2d ago',
    voted: false,
  },
  {
    id: 4,
    author: 'Ruth Nakamura',
    initials: 'RN',
    type: 'feedback',
    content: "The If/Then/Because hypothesis format is excellent but needs more guidance in the UI — most plan owners won't know what this means without an example. Consider inline tooltips with examples from their industry.",
    votes: 15,
    comments: 3,
    time: '3d ago',
    voted: false,
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: IdeaType }) {
  const styles: Record<IdeaType, string> = {
    idea: 'bg-primary-faded text-primary',
    challenge: 'bg-destructive-faded text-destructive',
    question: 'bg-muted text-muted-foreground',
    feedback: 'bg-warning-faded text-warning',
  }
  const icons: Record<IdeaType, typeof Lightbulb> = {
    idea: Lightbulb,
    challenge: Flag,
    question: QuestionMark,
    feedback: ModeComment,
  }
  const labels: Record<IdeaType, string> = { idea: 'Idea', challenge: 'Challenge', question: 'Question', feedback: 'Feedback' }
  const Icon = icons[type]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold', styles[type])}>
      <Icon className="w-2.5 h-2.5" />
      {labels[type]}
    </span>
  )
}

function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-7 h-7 rounded-full bg-warning-faded text-warning text-[10px] font-bold flex items-center justify-center shrink-0">
      {initials}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function StrategicPlanPage() {
  const [activePersona, setActivePersona] = useState('elt')
  const [contributions, setContributions] = useState<Contribution[]>(INITIAL_CONTRIBUTIONS)
  const [filter, setFilter] = useState<IdeaType | 'all'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [newType, setNewType] = useState<IdeaType>('idea')
  const [newContent, setNewContent] = useState('')

  const filtered = filter === 'all' ? contributions : contributions.filter((c) => c.type === filter)

  function handleVote(id: number) {
    setContributions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, votes: c.voted ? c.votes - 1 : c.votes + 1, voted: !c.voted } : c)),
    )
  }

  function handleAdd() {
    if (!newContent.trim()) return
    setContributions((prev) => [
      { id: Date.now(), author: 'You', initials: 'YO', type: newType, content: newContent, votes: 0, comments: 0, time: 'just now', voted: false },
      ...prev,
    ])
    setNewContent('')
    setAddOpen(false)
  }

  const counts = {
    all: contributions.length,
    idea: contributions.filter((c) => c.type === 'idea').length,
    challenge: contributions.filter((c) => c.type === 'challenge').length,
    question: contributions.filter((c) => c.type === 'question').length,
    feedback: contributions.filter((c) => c.type === 'feedback').length,
  }

  return (
    <>
      <PageHeader
        title="Squad 2: Strategic Plan"
        subtitle="Translating strategy into plans people can own and commit to — with coherent cascade, hypothesis-driven charters, and living financial links."
        breadcrumbs={[
          { label: 'Product Vision', to: '/' },
          { label: 'Strategic Plan' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="secondary" size="sm">← Back to Overview</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
              <Add className="w-4 h-4 mr-1" />
              Add Contribution
            </Button>
          </div>
        }
      />

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="pain">
            <TabsList className="mb-6">
              <TabsTrigger value="pain">The Pain</TabsTrigger>
              <TabsTrigger value="vision">The Vision</TabsTrigger>
              <TabsTrigger value="personas">For Whom</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
            </TabsList>

            <TabsContent value="pain">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">Strategy Fails in Translation</h3>
                <p className="text-sm text-muted-foreground">
                  A compelling strategic priority, agreed at the top, loses its meaning as it cascades through
                  organisational layers — each level reinterpreting it, filtering it, or burying it under a pile of activities.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {PAINS.map((pain) => (
                  <Card key={pain.id} className="p-4 shadow-xsmall rounded-xl border border-border">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-destructive-faded text-destructive text-xs font-bold flex items-center justify-center shrink-0">
                        {pain.id}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-heading mb-1">{pain.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{pain.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-destructive-faded border border-destructive/15 p-4">
                <p className="text-xs font-bold text-destructive mb-1">The Result</p>
                <p className="text-xs text-foreground leading-relaxed">
                  Teams are busy, managers are reporting, and leadership has no idea whether the organisation is making
                  strategic progress or just spinning. The result is a familiar failure mode: well-crafted corporate strategy
                  sits on top of operational to-do lists, with no real strategic reasoning at the unit level.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="vision">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">Plans as Shared Commitments and Testable Experiments</h3>
                <p className="text-sm text-muted-foreground">
                  In this world, a plan is not a document. Every team — from executive leadership to the front line —
                  is working from a plan that is connected, hypothesis-driven, outcome-focused, living, and governed.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {VISION_POINTS.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border border-border p-4 bg-white shadow-xsmall">
                    <div className="w-8 h-8 rounded-full bg-warning-faded text-warning flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-heading mb-1">{point.headline}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{point.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-warning-faded border border-warning/15 p-4">
                <p className="text-xs font-bold text-warning mb-1">Cascade &amp; Aggregation</p>
                <p className="text-xs text-foreground leading-relaxed">
                  The platform provides granular cascade and aggregation — one of its most distinctive capabilities.
                  Cascade flows top-down; aggregation flows bottom-up. Because hypotheses and assumptions are explicit,
                  execution generates learning seamlessly.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="personas">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">Who We're Building For</h3>
                <p className="text-sm text-muted-foreground">Four primary personas with distinct planning needs across the cascade hierarchy.</p>
              </div>
              <div className="flex gap-2 mb-5 flex-wrap">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    className={cn(
                      'px-4 py-2 rounded-full text-xs font-semibold border transition-all',
                      activePersona === p.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-muted-foreground border-border hover:border-primary/40',
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {PERSONAS.filter((p) => p.id === activePersona).map((persona) => (
                <div key={persona.id}>
                  <div className="rounded-xl border border-border bg-white shadow-xsmall p-5 mb-4">
                    <p className="text-sm italic text-foreground leading-relaxed border-l-4 border-warning pl-4">{persona.quote}</p>
                  </div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Jobs to Be Done</h4>
                  <div className="flex flex-col gap-2">
                    {persona.jtbds.map((jtbd, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground leading-snug">{jtbd}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="success">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">What Success Looks Like</h3>
                <p className="text-sm text-muted-foreground">Outcome-level ambitions for when this area is working well. 10 criteria across cascade, quality, and financial linkage.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {SUCCESS.map((item) => (
                  <Card key={item.id} className="p-4 shadow-xsmall rounded-xl border border-border">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-warning-faded text-warning text-xs font-bold flex items-center justify-center shrink-0">
                        {item.id}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-heading mb-1">{item.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Ideas & Feedback Panel */}
        <div className="w-80 shrink-0">
          <div className="sticky top-6">
            <div className="rounded-xl border border-border bg-white shadow-xsmall overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-shell flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  <span className="text-sm font-bold text-heading">Contributions</span>
                </div>
                <button onClick={() => setAddOpen(true)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  <Add className="w-3.5 h-3.5" />Add
                </button>
              </div>
              <div className="px-3 py-2 border-b border-border flex gap-1.5 overflow-x-auto">
                {(['all', 'idea', 'challenge', 'question', 'feedback'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all',
                      filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40',
                    )}
                  >
                    {f === 'all' ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
                  </button>
                ))}
              </div>
              <div className="flex flex-col divide-y divide-border max-h-[560px] overflow-y-auto">
                {filtered.map((item) => (
                  <div key={item.id} className="p-3 hover:bg-shell/50 transition-colors">
                    <div className="flex items-start gap-2 mb-2">
                      <InitialsAvatar initials={item.initials} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[11px] font-semibold text-heading truncate">{item.author}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                        </div>
                        <TypeBadge type={item.type} />
                      </div>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed mb-2">{item.content}</p>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleVote(item.id)} className={cn('flex items-center gap-1 text-[10px] font-semibold transition-colors', item.voted ? 'text-primary' : 'text-muted-foreground hover:text-primary')}>
                        <ThumbUp className="w-3 h-3" />{item.votes}
                      </button>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <ModeComment className="w-3 h-3" />{item.comments}
                      </span>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="p-6 text-center"><p className="text-xs text-muted-foreground">No contributions of this type yet.</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add a Contribution</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Type</p>
              <div className="flex flex-wrap gap-2">
                {(['idea', 'challenge', 'question', 'feedback'] as IdeaType[]).map((t) => (
                  <button key={t} onClick={() => setNewType(t)} className={cn('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all', newType === t ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40')}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Your contribution</p>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Share an idea, raise a challenge, ask a question, or leave feedback on this squad's vision..." className="w-full rounded-lg border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white" rows={4} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAdd} disabled={!newContent.trim()}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
