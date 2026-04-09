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

export const Route = createFileRoute('/formulate')({
  component: FormulateStrategyPage,
})

// ─── Pain Data ────────────────────────────────────────────────────────────────

const PAINS = [
  {
    id: 1,
    title: 'The analytical burden is crushing',
    description:
      'Gathering, processing, and synthesising market data, competitive signals, and internal capabilities requires weeks of manual effort. By the time analysis is ready, some of it is already stale. Every cycle the analyses are repeated from the beginning, without ever building a growing knowledge base.',
  },
  {
    id: 2,
    title: 'No shared language for strategic reasoning',
    description:
      'Every organisation, and every consultant, uses different terminology, frameworks, and structures. This makes it nearly impossible to compare, aggregate, or learn across units. Strategic reasoning stays locked in individual heads and laptops instead of becoming an institutional asset.',
  },
  {
    id: 3,
    title: 'Strategic choices are poorly articulated',
    description:
      'Strategies are expressed as vague aspirations rather than explicit, testable hypotheses. The assumptions underlying a strategic choice — why we believe this will work — are rarely surfaced, let alone documented. When execution falters, there is no way to distinguish a bad strategy from bad execution.',
  },
  {
    id: 4,
    title: "Strategy formulation doesn't cascade below corporate level",
    description:
      'In large, distributed organisations, every BU operates in a different competitive context. Yet the full rigour of strategic analysis is almost never replicated at granular levels. The cost is prohibitive. The result: a well-crafted corporate strategy sits on top of business unit "plans" that are little more than operational to-do lists.',
  },
  {
    id: 5,
    title: 'The consultant leaves, and the strategy walks out the door',
    description:
      'Consultants develop deep contextual understanding during formulation, but that knowledge is not transferred into any institutional system. When the engagement ends, the reasoning behind choices disappears with the team that made them. The next cycle, everything must be re-learned from scratch.',
  },
  {
    id: 6,
    title: 'No structured handoff to execution',
    description:
      'Formulation outputs — choices, assumptions, hypotheses — are expressed in narrative form, not in a structured format that execution teams can operationalise. The strategy-to-execution bridge is a manual, lossy translation — and when execution falters, it is impossible to distinguish whether the strategy was wrong or the translation was.',
  },
]

// ─── Vision Data ──────────────────────────────────────────────────────────────

const VISION_POINTS = [
  {
    headline: 'Data to insight in minutes, not weeks',
    detail:
      'The platform scans financial reports, market data, competitive intelligence, and internal metrics — delivering curated, business-ready insights on demand, visualising and communicating them in a clear, compelling, and impactful manner.',
  },
  {
    headline: 'A standard ontology provides a shared language',
    detail:
      'Standardised across business units, geographies, and engagements, while adapting fluidly to each industry context. Strategic reasoning becomes an institutional asset, not individual expertise.',
  },
  {
    headline: 'Strategic choices are explicit and testable',
    detail:
      'Every choice captures the "From–To" shift, the underlying insights, and the assumptions that need to hold true. Options that were considered and discarded are preserved — not lost.',
  },
  {
    headline: 'The process is governed and quality-gated',
    detail:
      'Key strategic questions are defined upfront with clear ownership, deadlines, and quality gates, reducing variance across units and ensuring every formulation cycle meets a consistent standard.',
  },
  {
    headline: 'AI acts as a sparring partner',
    detail:
      'Stress-testing ideas against established theory, historical precedents, and cross-industry best practices. Revealing blind spots, inconsistencies, and gaps — countering biases while amplifying human judgement.',
  },
]

// ─── Personas ────────────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id: 'elt',
    label: 'Executive Leadership Team',
    quote: '"I need to make high-stakes strategic choices with confidence — grounded in rigorous data and analysis, not gut feel and politics."',
    jtbds: [
      'Understand the current strategic situation: where we play, how we win, how we operate — all in the form of specific, unique insights derived from data',
      'Evaluate strategic options and make explicit choices of what to maintain, what to change (From To), and what to stop doing',
      'Verbalise the hypotheses and assumptions behind each strategic choice, so they can be effectively tested during execution',
      'Engage the leadership teams across the organisation around a shared strategic narrative',
      'Communicate the strategy to stakeholders in a way that builds commitment',
    ],
  },
  {
    id: 'consultants',
    label: 'Strategy Office / Consultants',
    quote: '"I need to facilitate a rigorous, repeatable strategy process that produces high-quality outputs, without drowning in data gathering and slide production."',
    jtbds: [
      'Generate an engagement plan including key strategic questions to be answered and data to be gathered',
      "Gather and import data to populate the client's knowledge base according to the engagement plan",
      'Perform strategic analyses and generate insights efficiently, in a very short time',
      'Generate reports and communication artefacts which can be easily shared with clients for validation',
      'Generate options for strategic choices and help clients frame "From–To" shifts',
      'Manage the end-to-end formulation process to meet deadlines and quality requirements',
      'Ensure consistency across business units and engagements',
    ],
  },
]

// ─── Success Criteria ────────────────────────────────────────────────────────

const SUCCESS = [
  {
    id: 1,
    title: 'Strategy formulation takes weeks, not months',
    detail:
      'AI-powered research and analysis compress the data-gathering phase from weeks of manual effort to hours of curated insights, enabling strategy to be performed frequently rather than once every few years.',
  },
  {
    id: 2,
    title: 'Every strategic choice is explicit and "auditable"',
    detail:
      'The organisation can trace any priority back to the analysis that informed it, the options that were considered, the hypotheses that underpin it, and the assumptions that need to hold.',
  },
  {
    id: 3,
    title: 'A shared strategic language exists across the enterprise',
    detail:
      'Business units, geographies, and functional teams use the same ontology, enabling meaningful comparison, aggregation, and cross-pollination of strategic thinking.',
  },
  {
    id: 4,
    title: 'The quality of strategic reasoning is consistently high',
    detail:
      "AI co-pilots reduce variance by ensuring every formulation process follows a rigorous structure, while adapting to each unit's specific context. Choices have structure: a current state, a target state, underlying hypotheses, and supporting evidence.",
  },
  {
    id: 5,
    title: 'AI augments judgement, it does not replace it',
    detail:
      'The cognitive heavy-lifting (research, analysis, synthesis, scenario simulation) is delegated to the AI. But strategic judgement — evaluating options, making choices, building commitment — remains a fundamentally human act.',
  },
  {
    id: 6,
    title: 'Governance is customised per engagement',
    detail:
      'Different organisations have different governance and organisational requirements. The platform supports configurable organisational and governance structures, without requiring a one-size-fits-all methodology.',
  },
  {
    id: 7,
    title: 'Strategy is de-mystified',
    detail:
      "When someone reads a strategy inside this module, it's clear, meaningful, specific, and makes a lot of sense. It is not a declaration of intent, it is not a slogan, it is not a deck of 150 slides of analysis.",
  },
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
    author: 'Sarah Chen',
    initials: 'SC',
    type: 'idea',
    content:
      'Could we add a "Strategy Confidence Score" that aggregates readiness across all Canvas dimensions — giving ELT a single health signal before they commit to choices?',
    votes: 7,
    comments: 3,
    time: '2h ago',
    voted: false,
  },
  {
    id: 2,
    author: 'James Wright',
    initials: 'JW',
    type: 'challenge',
    content:
      'Workshop mode needs offline support — boardrooms and leadership retreats often have poor or no connectivity. The current assumption of online-first will block adoption in key use cases.',
    votes: 9,
    comments: 4,
    time: '1d ago',
    voted: false,
  },
  {
    id: 3,
    author: 'Lena Müller',
    initials: 'LM',
    type: 'question',
    content:
      "How do we handle BU-level strategy formulation when the BU leader doesn't want to share competitive insights with the parent company? What's the data governance model for sensitive competitive intelligence?",
    votes: 5,
    comments: 6,
    time: '2d ago',
    voted: false,
  },
  {
    id: 4,
    author: 'David Park',
    initials: 'DP',
    type: 'feedback',
    content:
      "The From–To structure is the most powerful concept in the platform. It should be front and centre in the onboarding experience — many consultants we've tested with don't immediately grasp why it matters.",
    votes: 12,
    comments: 2,
    time: '3d ago',
    voted: false,
  },
]

// ─── Ideas Panel Sub-components ───────────────────────────────────────────────

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
    <div className="w-7 h-7 rounded-full bg-primary-faded text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
      {initials}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function FormulateStrategyPage() {
  const [activePersona, setActivePersona] = useState('elt')
  const [contributions, setContributions] = useState<Contribution[]>(INITIAL_CONTRIBUTIONS)
  const [filter, setFilter] = useState<IdeaType | 'all'>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [newType, setNewType] = useState<IdeaType>('idea')
  const [newContent, setNewContent] = useState('')

  const filtered = filter === 'all' ? contributions : contributions.filter((c) => c.type === filter)

  function handleVote(id: number) {
    setContributions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, votes: c.voted ? c.votes - 1 : c.votes + 1, voted: !c.voted } : c,
      ),
    )
  }

  function handleAdd() {
    if (!newContent.trim()) return
    const newItem: Contribution = {
      id: Date.now(),
      author: 'You',
      initials: 'YO',
      type: newType,
      content: newContent,
      votes: 0,
      comments: 0,
      time: 'just now',
      voted: false,
    }
    setContributions((prev) => [newItem, ...prev])
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
        title="Squad 1: Formulate Strategy"
        subtitle="Making Better Strategic Choices — which ELT can commit on, in a fast and inexpensive way."
        breadcrumbs={[
          { label: 'Product Vision', to: '/' },
          { label: 'Formulate Strategy' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="secondary" size="sm">
                ← Back to Overview
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
              <Add className="w-4 h-4 mr-1" />
              Add Contribution
            </Button>
          </div>
        }
      />

      <div className="flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <Tabs defaultValue="pain">
            <TabsList className="mb-6">
              <TabsTrigger value="pain">The Pain</TabsTrigger>
              <TabsTrigger value="vision">The Vision</TabsTrigger>
              <TabsTrigger value="personas">For Whom</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
            </TabsList>

            {/* Pain Tab */}
            <TabsContent value="pain">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">What's Broken Today</h3>
                <p className="text-sm text-muted-foreground">
                  Strategy formulation is trapped in an artisanal model — depending on consultants' skills,
                  ad-hoc spreadsheets, and PowerPoint decks assembled under time pressure.
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
            </TabsContent>

            {/* Vision Tab */}
            <TabsContent value="vision">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">What the World Looks Like When We've Solved It</h3>
                <p className="text-sm text-muted-foreground">
                  A world where formulating strategy is not a once-every-few-years ordeal, but a structured,
                  AI-augmented capability the organisation can activate whenever the context demands it.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {VISION_POINTS.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border border-border p-4 bg-white shadow-xsmall">
                    <div className="w-8 h-8 rounded-full bg-primary-faded text-primary flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-heading mb-1">{point.headline}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{point.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-primary-faded border border-primary/15 p-4">
                <p className="text-xs font-bold text-primary mb-1">The Strategy Digital Twin</p>
                <p className="text-xs text-foreground leading-relaxed">
                  At the technological heart of the platform is a living, machine-readable mirror of the
                  organisation's strategy — capturing data, goals, assumptions, options, and plans in a
                  unified Knowledge Graph. It powers seven agentic services through a Strategy Co-Pilot:
                  Industry Expert, Researcher, Business Analyst, Communicator, Simulator, Programme Manager,
                  and Strategic Advisor.
                </p>
              </div>
            </TabsContent>

            {/* Personas Tab */}
            <TabsContent value="personas">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">Who We're Building For</h3>
                <p className="text-sm text-muted-foreground">
                  Two primary personas with distinct but complementary needs in the formulation process.
                </p>
              </div>
              <div className="flex gap-2 mb-5">
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
                    <p className="text-sm italic text-foreground leading-relaxed border-l-4 border-primary pl-4">
                      {persona.quote}
                    </p>
                  </div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Jobs to Be Done
                  </h4>
                  <div className="flex flex-col gap-2">
                    {persona.jtbds.map((jtbd, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground leading-snug">{jtbd}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Success Tab */}
            <TabsContent value="success">
              <div className="flex flex-col gap-1 mb-4">
                <h3 className="text-base font-bold text-heading">What Success Looks Like</h3>
                <p className="text-sm text-muted-foreground">
                  Outcome-level ambitions for when this area is working well. Not features — results.
                </p>
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
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-heading">Contributions</span>
                </div>
                <button
                  onClick={() => setAddOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <Add className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Filter */}
              <div className="px-3 py-2 border-b border-border flex gap-1.5 overflow-x-auto">
                {(['all', 'idea', 'challenge', 'question', 'feedback'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all',
                      filter === f
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-muted-foreground border-border hover:border-primary/40',
                    )}
                  >
                    {f === 'all' ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
                  </button>
                ))}
              </div>

              {/* Contributions list */}
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
                      <button
                        onClick={() => handleVote(item.id)}
                        className={cn(
                          'flex items-center gap-1 text-[10px] font-semibold transition-colors',
                          item.voted ? 'text-primary' : 'text-muted-foreground hover:text-primary',
                        )}
                      >
                        <ThumbUp className="w-3 h-3" />
                        {item.votes}
                      </button>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <ModeComment className="w-3 h-3" />
                        {item.comments}
                      </span>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-xs text-muted-foreground">No contributions of this type yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contribution Dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a Contribution</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Type
              </p>
              <div className="flex flex-wrap gap-2">
                {(['idea', 'challenge', 'question', 'feedback'] as IdeaType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                      newType === t
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-muted-foreground border-border hover:border-primary/40',
                    )}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Your contribution
              </p>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Share an idea, raise a challenge, ask a question, or leave feedback on this squad's vision..."
                className="w-full rounded-lg border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 bg-white"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAdd} disabled={!newContent.trim()}>
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
