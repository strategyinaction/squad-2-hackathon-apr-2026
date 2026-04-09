import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { PageHeader } from '#/components/PageHeader'
import { Card, Button } from '#/components/ui'
import { cn } from '#/lib/utils'
import {
  Target, Lan, School, ArrowForward,
  Lightbulb, ThumbUp, ModeComment,
  TrendingUp, Groups, ChevronRight, EmojiObjects,
} from '#/icons'

export const Route = createFileRoute('/')({ component: OverviewPage })

// ─── Data ────────────────────────────────────────────────────────────────────

const SQUADS = [
  {
    id: 'formulate',
    number: '01',
    name: 'Formulate Strategy',
    tagline: 'Making Better Strategic Choices',
    description:
      'Turning strategic intent into explicit, testable choices. Covering where to play, how to win, and how to operate — with AI compressing analytical weeks into hours.',
    icon: Target,
    accentBg: 'bg-primary',
    accentText: 'text-white',
    fadedBg: 'bg-primary-faded',
    textColor: 'text-primary',
    ideas: 12,
    feedback: 8,
    path: '/formulate',
  },
  {
    id: 'plan',
    number: '02',
    name: 'Strategic Plan',
    tagline: 'Translating Strategy into Plans',
    description:
      'Breaking strategic choices into prioritised initiatives, OKRs, and financial plans — with coherent cascade from corporate to team level and living hypothesis-driven charters.',
    icon: Lan,
    accentBg: 'bg-warning',
    accentText: 'text-white',
    fadedBg: 'bg-warning-faded',
    textColor: 'text-warning',
    ideas: 9,
    feedback: 14,
    path: '/plan',
  },
  {
    id: 'learn',
    number: '03',
    name: 'Learn & Adapt',
    tagline: 'Extracting Meaning from Execution',
    description:
      'Capturing structured learning from execution, synthesising insights into timely decisions, and cascading adaptations instantly across all affected plans and teams.',
    icon: School,
    accentBg: 'bg-success',
    accentText: 'text-white',
    fadedBg: 'bg-success-faded',
    textColor: 'text-success',
    ideas: 7,
    feedback: 11,
    path: '/learn',
  },
]

const ACTIVITY = [
  {
    id: 1,
    author: 'Sarah Chen',
    initials: 'SC',
    action: 'added an idea',
    squad: 'Formulate Strategy',
    squadPath: '/formulate',
    content:
      'Could we add a "Strategy Confidence Score" that aggregates readiness across Canvas dimensions — giving ELT a single health signal before they commit to choices?',
    type: 'idea' as const,
    votes: 7,
    comments: 3,
    time: '2h ago',
  },
  {
    id: 2,
    author: 'Marco Rossi',
    initials: 'MR',
    action: 'raised a challenge',
    squad: 'Strategic Plan',
    squadPath: '/plan',
    content:
      "Cascade tracking needs to handle 5–6 levels deep for large enterprise clients — the current 3-level assumption won't work for major multinationals.",
    type: 'challenge' as const,
    votes: 11,
    comments: 5,
    time: '4h ago',
  },
  {
    id: 3,
    author: 'Amelia Patel',
    initials: 'AP',
    action: 'left feedback',
    squad: 'Learn & Adapt',
    squadPath: '/learn',
    content:
      'QBR preparation is still too manual — even with AI brief generation, the data connector gap means analysts are still copy-pasting from spreadsheets.',
    type: 'feedback' as const,
    votes: 14,
    comments: 6,
    time: '1d ago',
  },
  {
    id: 4,
    author: 'James Wright',
    initials: 'JW',
    action: 'asked a question',
    squad: 'Formulate Strategy',
    squadPath: '/formulate',
    content:
      "How do we handle BU-level strategy formulation when the BU leader doesn't want to share competitive insights with the parent company?",
    type: 'question' as const,
    votes: 5,
    comments: 4,
    time: '1d ago',
  },
]

const CORE_PAINS = [
  { priority: '10', label: 'Missing links between Strategy, Execution, and Financials' },
  { priority: '9', label: 'Lacking clarity and granularity of top-down cascade and bottom-up aggregation' },
  { priority: '8', label: 'Many systems, no integrated single source of truth for strategy' },
  { priority: '8', label: 'Complexity, cost and time of the strategic management process' },
  { priority: '7', label: 'Poor quality of interactions and collaboration within leadership teams' },
  { priority: '7', label: 'Insufficient quality of data, analysis, and decisions — high variance across units' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: 'idea' | 'challenge' | 'feedback' | 'question' }) {
  const styles = {
    idea: 'bg-primary-faded text-primary',
    challenge: 'bg-destructive-faded text-destructive',
    feedback: 'bg-warning-faded text-warning',
    question: 'bg-muted text-muted-foreground',
  }
  const labels = { idea: 'Idea', challenge: 'Challenge', feedback: 'Feedback', question: 'Question' }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', styles[type])}>
      {labels[type]}
    </span>
  )
}

function InitialsAvatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
  return (
    <div className={cn('rounded-full bg-primary-faded text-primary font-bold flex items-center justify-center shrink-0', sizeClass)}>
      {initials}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function OverviewPage() {
  const [expandedContext, setExpandedContext] = useState(false)

  return (
    <>
      <PageHeader
        title="Product Vision"
        subtitle="A living document for product squads. Read, challenge, and contribute to the platform vision."
        breadcrumbs={[{ label: 'Product Vision' }]}
      />

      {/* Hero */}
      <div className="rounded-2xl bg-primary text-white p-8 mb-8">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">
          Strategy in Action Platform
        </p>
        <h2 className="text-2xl font-bold mb-3 leading-tight">
          The institutional template for strategic management
        </h2>
        <p className="text-white/75 text-sm max-w-2xl leading-relaxed mb-6">
          AI has removed the final barrier. We're building what no one has built before: a shared language,
          structured process, and coordination layer for how organisations formulate, plan, learn from, and
          adapt their strategy.
        </p>
        <div className="flex flex-wrap gap-3">
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-0.5">Positioning</p>
            <p className="text-sm font-bold">Cost Leader vs. Consultancies</p>
            <p className="text-xs text-white/60 mt-0.5">Compress weeks of work into hours</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-0.5">Differentiation</p>
            <p className="text-sm font-bold">Premium vs. Pure SaaS</p>
            <p className="text-xs text-white/60 mt-0.5">Not software — better strategic outcomes</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-0.5">Target ARR</p>
            <p className="text-sm font-bold">£60–90K / BU / year</p>
            <p className="text-xs text-white/60 mt-0.5">"Strategy as a Service" model</p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-0.5">Core Users</p>
            <p className="text-sm font-bold">C-Suite · BU Leaders · Consultants</p>
            <p className="text-xs text-white/60 mt-0.5">Finance Partners · Strategy Office</p>
          </div>
        </div>
      </div>

      {/* Squad Areas */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-heading">Platform Areas</h3>
          <p className="text-xs text-muted-foreground">3 product squads · 28 open contributions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SQUADS.map((squad) => {
            const Icon = squad.icon
            return (
              <Card key={squad.id} className="flex flex-col shadow-xsmall rounded-xl border border-border overflow-hidden">
                <div className="px-5 pt-5 pb-4 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', squad.accentBg)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={cn('text-3xl font-black leading-none', squad.fadedBg === 'bg-primary-faded' ? 'text-primary/15' : squad.fadedBg === 'bg-warning-faded' ? 'text-warning/15' : 'text-success/15')}>
                      {squad.number}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-heading mb-0.5">{squad.name}</h4>
                  <p className={cn('text-xs font-semibold mb-2', squad.textColor)}>{squad.tagline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{squad.description}</p>
                </div>
                <div className={cn('px-5 py-3 border-t border-border flex items-center justify-between', squad.fadedBg)}>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" />
                      {squad.ideas} ideas
                    </span>
                    <span className="flex items-center gap-1">
                      <ModeComment className="w-3.5 h-3.5" />
                      {squad.feedback} feedback
                    </span>
                  </div>
                  <Link to={squad.path as '/formulate'}>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2">
                      Explore
                      <ArrowForward className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Two-column: context + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Strategic Context */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-white shadow-xsmall p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-heading">Core Customer Pains</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              These high-level pains cut across all squad areas. They are the north star for prioritisation.
            </p>
            <div className="flex flex-col gap-2">
              {CORE_PAINS.slice(0, expandedContext ? CORE_PAINS.length : 4).map((pain, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={cn(
                    'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    pain.priority === '10' ? 'bg-destructive text-white' :
                    pain.priority === '9' ? 'bg-destructive-faded text-destructive' :
                    pain.priority === '8' ? 'bg-warning-faded text-warning' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {pain.priority}
                  </span>
                  <p className="text-xs text-foreground leading-snug pt-0.5">{pain.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setExpandedContext(!expandedContext)}
              className="mt-3 text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              {expandedContext ? 'Show less' : `Show ${CORE_PAINS.length - 4} more`}
              <ChevronRight className={cn('w-3 h-3 transition-transform', expandedContext && 'rotate-90')} />
            </button>
          </div>

          {/* Platform functions */}
          <div className="rounded-xl border border-border bg-white shadow-xsmall p-5 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <EmojiObjects className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-heading">Two Core Functions</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="rounded-lg bg-primary-faded border border-primary/10 p-3">
                <p className="text-xs font-bold text-primary mb-1">Institutional Template</p>
                <p className="text-xs text-foreground leading-relaxed">
                  Shared language, process governance, accountability structures, and collaboration layer.
                  Creates coordination, control, and trust.
                </p>
              </div>
              <div className="rounded-lg bg-shell border border-border p-3">
                <p className="text-xs font-bold text-heading mb-1">Cognitive Engine (AI)</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gathers, analyses, synthesises, and supports judgement. Makes strategic work better,
                  faster, and cheaper.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Contributions */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border bg-white shadow-xsmall p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Groups className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-heading">Recent Contributions</h3>
              </div>
              <span className="text-xs text-muted-foreground">28 total across all squads</span>
            </div>
            <div className="flex flex-col gap-3">
              {ACTIVITY.map((item) => (
                <div key={item.id} className="rounded-lg border border-border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <InitialsAvatar initials={item.initials} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-heading">{item.author}</span>
                        <span className="text-xs text-muted-foreground">{item.action} in</span>
                        <Link to={item.squadPath as '/formulate'} className="text-xs font-semibold text-primary hover:underline">
                          {item.squad}
                        </Link>
                        <TypeBadge type={item.type} />
                        <span className="text-xs text-muted-foreground ml-auto">{item.time}</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed line-clamp-2">{item.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                          <ThumbUp className="w-3 h-3" />
                          {item.votes}
                        </button>
                        <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
                          <ModeComment className="w-3 h-3" />
                          {item.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Navigate to a squad area to add your own ideas, raise challenges, or ask questions.
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
