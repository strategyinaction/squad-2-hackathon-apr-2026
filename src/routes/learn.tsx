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

export const Route = createFileRoute('/learn')({
  component: LearnAdaptPage,
})

// ─── Pain Data ────────────────────────────────────────────────────────────────

const PAINS = [
  {
    id: 1,
    title: 'No structured mechanism for capturing learning',
    description:
      'Check-ins happen, QBRs are held, but the insights generated in these moments are trapped in meeting notes, emails, or individual memory. There is no systematic way to capture what was learned, by whom, and what it means for the strategy.',
  },
  {
    id: 2,
    title: 'Execution data exists but meaning does not',
    description:
      'Dashboards track KPIs and OKR progress, but numbers are not easily interpreted and given meaning. A metric moving from red to green tells you what happened, not why it happened, whether the underlying hypothesis held, or what it means for the next quarter.',
  },
  {
    id: 3,
    title: 'Learning is local and siloed',
    description:
      'Even when teams learn something valuable, the insight stays within the team. There is no mechanism to aggregate learning across business units, identify patterns, and surface them to leadership. The organisation repeats the same mistakes in different places and at different times.',
  },
  {
    id: 4,
    title: 'Decisions fall through the cracks',
    description:
      'Insights surface in QBRs, retrospectives, or leadership discussions, but there is no rapid mechanism to flag them as decisions needed, assign ownership, or track whether they were actually made and then implemented.',
  },
  {
    id: 5,
    title: 'The feedback loop is too slow',
    description:
      'In most organisations, the cycle from "we learned something" to "we changed something" runs on a quarterly or annual cadence. By the time a strategic adjustment makes it through governance and cascades to the teams doing the work, the window of opportunity has often closed.',
  },
  {
    id: 6,
    title: "Adaptation doesn't cascade",
    description:
      "Even when a decision is made at the top — to pivot a priority, stop an initiative, double down on a bet — it takes weeks or months for that decision to reach the actions, resources, and activities it affects. The organisation's strategy says one thing; its actions still say another.",
  },
  {
    id: 7,
    title: 'Reporting progress is tedious and burdensome',
    description:
      'Tracking tens and hundreds of plans, metrics, and activities involves a highly time-consuming process to provide progress reports and ensuring everything is up to date.',
  },
]

// ─── Vision Data ──────────────────────────────────────────────────────────────

const VISION_POINTS = [
  {
    headline: 'Data integration: execution flows directly into strategy',
    detail:
      "The platform connects to the organisation's core enterprise systems (ERP, CRM, HRIS, BI tools, project management) so that execution data flows directly into the strategy and plan structure. Numbers are not re-keyed or exported into spreadsheets; they are live, linked to the metrics, plans, and hypotheses they inform.",
  },
  {
    headline: 'Periodic check-ins are lightweight but structured',
    detail:
      "Capturing not just progress metrics but the team's interpretation: what's working, what's surprising, what assumption needs revisiting. Standardised format feeds both team dashboards and upstream aggregation.",
  },
  {
    headline: 'AI interprets execution data in real time',
    detail:
      'Flagging patterns, anomalies, and early signals — and connecting them to the strategic choices they inform. The AI distinguishes between poor execution (choice is right, implementation is weak) and hypothesis failure (choice itself is flawed).',
  },
  {
    headline: 'Learning flows easily from team to enterprise',
    detail:
      'Creating a living body of strategic knowledge that informs the next strategic and planning cycle. QBR reports write themselves, synthesising execution data, team learning, and strategic implications into a coherent brief for leadership — reducing preparation from days to minutes.',
  },
  {
    headline: 'Adaptation cascades instantly',
    detail:
      'When leadership decides to pivot a strategic priority, the platform propagates that change through every affected plan, OKR, and resource allocation decision — flagging what needs to change and who needs to act and why.',
  },
  {
    headline: 'Double-loop learning: execution vs. strategy',
    detail:
      "The organisation can distinguish between two types of adaptation: adjusting execution (doing the same thing better) and adjusting strategy (questioning whether we're doing the right thing). Leadership can see which mode is appropriate for each situation.",
  },
]

// ─── Personas ────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id: 'elt',
    label: 'Executive Leadership',
    quote: '"I need to understand what execution is telling us about our strategy, make timely decisions about where to double down, pivot, or stop, and ensure those decisions actually reach the teams doing the work."',
    jtbds: [
      "Understand what execution data means for the strategy: receive synthesised learning that connects execution signals to strategic hypotheses, not raw dashboards",
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
    quote: '"I need to aggregate learning across dozens of teams, surface the patterns that matter, prepare leadership to decide, and ensure those decisions cascade — without reading hundreds of reports or becoming a bottleneck."',
    jtbds: [
      'Aggregate learning across the portfolio and surface systemic patterns from team to BU to enterprise',
      'Produce QBR reports and prepare leadership for decisions, synthesising execution data, learning, and strategic implications into actionable briefs',
      'Track decisions from insight to implementation — ensuring nothing falls through the cracks',
      'Support the yearly strategy refresh by surfacing accumulated learning, structured as input to the next formulation round',
    ],
  },
]

// ─── Success Criteria ────────────────────────────────────────────────────────

const SUCCESS = [
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
    author: 'Amelia Patel',
    initials: 'AP',
    type: 'challenge',
    content: 'QBR preparation is still too manual — even with AI brief generation, the data connector gap means analysts are still copy-pasting from spreadsheets. The integrations need to be prioritised before the learning brief UX can deliver its promise.',
    votes: 14,
    comments: 6,
    time: '1d ago',
    voted: false,
  },
  {
    id: 2,
    author: 'Tom Eriksson',
    initials: 'TE',
    type: 'idea',
    content: 'The "double-loop learning" concept is powerful but needs to be visualised for leadership — perhaps a simple 2x2 showing whether the issue is execution or strategy. Makes it much easier to decide which type of intervention is needed.',
    votes: 10,
    comments: 3,
    time: '2d ago',
    voted: false,
  },
  {
    id: 3,
    author: 'Nadia Okonkwo',
    initials: 'NO',
    type: 'question',
    content: "What's the cadence model for check-ins? Weekly feels too frequent for strategic priorities but monthly might be too slow to catch early warning signals. How do we handle this trade-off in the governance layer?",
    votes: 8,
    comments: 5,
    time: '2d ago',
    voted: false,
  },
  {
    id: 4,
    author: 'Raj Bhattacharya',
    initials: 'RB',
    type: 'feedback',
    content: 'The "decisions are objects" principle is the most underrated feature in this section. Most organisations lose track of decisions made — having a structured decision register with rationale and cascade tracking would be transformational.',
    votes: 16,
    comments: 4,
    time: '4d ago',
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
  const icons: Record<IdeaType, typeof Lightbulb> = { idea: Lightbulb, challenge: Flag, question: QuestionMark, feedback: ModeComment }
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
    <div className="w-7 h-7 rounded-full bg-success-faded text-success text-[10px] font-bold flex items-center justify-center shrink-0">
      {initials}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function LearnAdaptPage() {
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
        title="Squad 3: Learn & Adapt"
        subtitle="Extracting meaning from execution and turning insights into timely, cascaded decisions."
        breadcrumbs={[
          { label: 'Product Vision', to: '/' },
          { label: 'Learn & Adapt' },
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
                <h3 className="text-base font-bold text-heading">Organisations Execute but Rarely Learn</h3>
                <p className="text-sm text-muted-foreground">
                  The link between strategy and execution is one-directional: strategy flows down, but learning never
                  flows back up. The result is an organisation that cannot distinguish between a hypothesis that failed
                  and an initiative that was poorly executed.
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
                <p className="text-xs font-bold text-destructive mb-1">The Overall Result</p>
                <p className="text-xs text-foreground leading-relaxed">
                  The organisation may have fragments of a learning loop but no adaptation loop. Learnings don't accumulate;
                  nothing changes. Strategy becomes a retrospective exercise: something you update at the annual offsite,
                  rather than a living, adaptive capability.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="vision">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">Every Execution Cycle Generates Actionable Learning</h3>
                <p className="text-sm text-muted-foreground">
                  A world where structured learning flows directly into timely decisions that change what happens next.
                  The organisation builds institutional memory — strategy evolves continuously.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {VISION_POINTS.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border border-border p-4 bg-white shadow-xsmall">
                    <div className="w-8 h-8 rounded-full bg-success-faded text-success flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-heading mb-1">{point.headline}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{point.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-success-faded border border-success/15 p-4">
                <p className="text-xs font-bold text-success mb-1">The Learning Loop Closes the Circle</p>
                <p className="text-xs text-foreground leading-relaxed">
                  The yearly strategy refresh is supported by a full year of accumulated, structured learning — surfaced
                  as input to the Formulate squad. What we learned, what held up, what didn't, and what the data suggests
                  for the next strategic cycle. Strategy and execution become a single continuous system.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="personas">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">Who We're Building For</h3>
                <p className="text-sm text-muted-foreground">Four primary personas with distinct learning and adaptation needs across the organisation.</p>
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
                    <p className="text-sm italic text-foreground leading-relaxed border-l-4 border-success pl-4">{persona.quote}</p>
                  </div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Jobs to Be Done</h4>
                  <div className="flex flex-col gap-2">
                    {persona.jtbds.map((jtbd, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
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
                <p className="text-sm text-muted-foreground">10 outcome-level ambitions for when learning and adaptation are working well across the organisation.</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {SUCCESS.map((item) => (
                  <Card key={item.id} className="p-4 shadow-xsmall rounded-xl border border-border">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-success-faded text-success text-xs font-bold flex items-center justify-center shrink-0">
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
                  <Lightbulb className="w-4 h-4 text-success" />
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
