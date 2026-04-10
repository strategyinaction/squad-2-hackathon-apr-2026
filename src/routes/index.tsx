import { type ComponentType, useEffect, useMemo, useRef, useState } from 'react'
import { useHeader, useUpdateHeader } from '#/lib/api/header'
import { useHeaderCards, useUpdateHeaderCard, useAddHeaderCard } from '#/lib/api/headerCards'
import { useCoreFunctionsSection, useUpdateCoreFunctionsSection } from '#/lib/api/coreFunctionsSection'
import { useCoreFunctions, useUpdateCoreFunction, useAddCoreFunction, useDeleteCoreFunction } from '#/lib/api/coreFunctions'
import { usePlatformAreas } from '#/lib/api/platformAreas'
import { useComments } from '#/lib/api/comments'
import { Link, useNavigate, createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { LogoutButton } from '#/components/LogoutButton'
import { Card, Button } from '#/components/ui'
import { cn } from '#/lib/utils'
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, rectSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Target,
  Lan,
  School,
  ArrowForward,
  EmojiObjects,
  Edit,
  Add,
  Close,
  Check,
  DragIndicator,
  AttachFile,
} from '#/icons'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton, HighlightedText, type CommentType } from '#/components/CommentingSystem'
import { ItemDetailModal, ItemDetailPanel, type ItemDetailData } from '#/components/VisionCanvas'

export const Route = createFileRoute('/')({ component: OverviewPage })

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroBlock {
  id: string;
  label: string;
  title: string;
  subtitle: string;
}

interface HeroData {
  eyebrow: string;
  title: string;
  description: string;
  blocks: HeroBlock[];
}

interface CoreFunction {
  id: string;
  title: string;
  body: string;
  isPrimary: boolean;
}

type IconComp = ComponentType<{ className?: string }>

interface Squad {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: IconComp;
  accentBg: string;
  fadedBg: string;
  textColor: string;
  path: string;
  contentId?: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EMPTY_HERO: HeroData = { eyebrow: '', title: '', description: '', blocks: [] }

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
function coreFunctionsTitle(count: number) {
  const word = COUNT_WORDS[count] ?? String(count)
  if (count === 0) return 'No Core Functions'
  return `${word} Core ${count === 1 ? 'Function' : 'Functions'}`
}

const INITIAL_SQUADS: Squad[] = [
  {
    id: 'formulate',
    name: 'Formulate Strategy',
    tagline: 'Making Better Strategic Choices',
    description:
      'Turning strategic intent into explicit, testable choices. Covering where to play, how to win, and how to operate — with AI compressing analytical weeks into hours.',
    icon: Target as IconComp,
    accentBg: 'bg-primary',
    fadedBg: 'bg-primary-faded',
    textColor: 'text-primary',
    path: '/formulate',
  },
  {
    id: 'plan',
    name: 'Strategic Plan',
    tagline: 'Translating Strategy into Plans',
    description:
      'Breaking strategic choices into prioritised initiatives, OKRs, and financial plans — with coherent cascade from corporate to team level and living hypothesis-driven charters.',
    icon: Lan as IconComp,
    accentBg: 'bg-warning',
    fadedBg: 'bg-warning-faded',
    textColor: 'text-warning',
    path: '/plan',
  },
  {
    id: 'learn',
    name: 'Learn & Adapt',
    tagline: 'Extracting Meaning from Execution',
    description:
      'Capturing structured learning from execution, synthesising insights into timely decisions, and cascading adaptations instantly across all affected plans and teams.',
    icon: School as IconComp,
    accentBg: 'bg-success',
    fadedBg: 'bg-success-faded',
    textColor: 'text-success',
    path: '/learn',
  },
]

function getInitials(author: string): string {
  return author.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// ─── SortableRow ──────────────────────────────────────────────────────────────

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (props: { handleProps: React.HTMLAttributes<HTMLDivElement> }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
    >
      {children({ handleProps: { ...attributes, ...listeners } as React.HTMLAttributes<HTMLDivElement> })}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: 'idea' | 'challenge' | 'feedback' | 'question' }) {
  const styles = { idea: 'bg-primary-faded text-primary', challenge: 'bg-destructive-faded text-destructive', feedback: 'bg-warning-faded text-warning', question: 'bg-muted text-muted-foreground' }
  const labels = { idea: 'Idea', challenge: 'Challenge', feedback: 'Feedback', question: 'Question' }
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[15px] font-semibold', styles[type])}>{labels[type]}</span>
}

function SectionEditButton({
  editing,
  onToggle,
  onCancel,
}: {
  editing: boolean;
  onToggle: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5" onMouseUp={e => e.stopPropagation()}>
      {editing && onCancel && (
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent text-muted-foreground hover:bg-shell hover:border-border transition-colors"
        >
          Cancel
        </button>
      )}
      <button
        onClick={onToggle}
        onMouseUp={e => e.stopPropagation()}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
          editing ? 'bg-shell border-border text-heading' : 'border-transparent text-muted-foreground hover:bg-shell hover:border-border',
        )}
      >
        {editing ? <><Check className="w-3.5 h-3.5" />Done</> : <><Edit className="w-3.5 h-3.5" />Edit</>}
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TOUR_KEY = 'pv-tour-tip-dismissed'
const TOUR_DURATION = 15000
const TOUR_TICK = 100

function TourTip() {
  const [visible, setVisible] = useState(false)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function dismiss() {
    setVisible(false)
    localStorage.setItem(TOUR_KEY, '1')
  }

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible || paused) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      return
    }
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + TOUR_TICK
        if (next >= TOUR_DURATION) { dismiss(); return prev }
        return next
      })
    }, TOUR_TICK)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, paused])

  if (!visible) return null

  const remaining = Math.max(0, 100 - (elapsed / TOUR_DURATION) * 100)

  return (
    <div
      className="pointer-events-auto fixed bottom-6 left-1/2 -translate-x-1/2 z-[800] animate-in fade-in slide-in-from-bottom-3 duration-500"
      style={{ animationFillMode: 'both' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative flex flex-col rounded-2xl bg-heading text-white shadow-large w-80 overflow-hidden">
        <img src='/place-comment-demo.gif' alt="How to place a comment" className="w-[calc(100%-16px)] mx-2 mt-2 rounded-[6px]" />
        <div className="flex items-start gap-3 px-5 pt-3 pb-3">
          <div className="shrink-0 mt-0.5 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <path d="M3 5a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 010 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h5a1 1 0 010 2H4a1 1 0 01-1-1z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold mb-0.5">Leave a comment on any text</p>
            <p className="text-xs text-white/70 leading-relaxed">Select any text on this page to share an idea, raise a challenge, or ask a question.</p>
          </div>
        </div>
        <div className="px-5 pb-3 flex justify-end">
          <button
            onClick={dismiss}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            Got it!
          </button>
        </div>
        <div className="h-0.5 w-full bg-white/10">
          <div className="h-full bg-white/40 transition-none" style={{ width: `${remaining}%` }} />
        </div>
      </div>
    </div>
  )
}

function OverviewContent() {
  // ── Hero state ──────────────────────────────────────────────────────────────
  const { data: headerItem } = useHeader()
  const { data: headerCards } = useHeaderCards()
  const updateHeader = useUpdateHeader()
  const updateHeaderCard = useUpdateHeaderCard()
  const addHeaderCard = useAddHeaderCard()
  const [heroEditing, setHeroEditing] = useState(false)
  const [hero, setHero] = useState<HeroData>(EMPTY_HERO)
  const [heroSnap, setHeroSnap] = useState<string | null>(null)

  useEffect(() => {
    if (!headerItem) return
    setHero(prev => ({
      ...prev,
      eyebrow: headerItem.title ?? '',
      title: headerItem.subtitle ?? '',
      description: headerItem.description ?? '',
    }))
  }, [headerItem])

  useEffect(() => {
    if (!headerCards || heroEditing) return
    setHero(prev => ({
      ...prev,
      blocks: headerCards.map(c => ({
        id: String(c.id),
        label: c.title,
        title: c.subtitle,
        subtitle: c.description,
      })),
    }))
  }, [headerCards, heroEditing])

  // ── Two Core Functions state ────────────────────────────────────────────────
  const { data: coreFunctionsSectionItem } = useCoreFunctionsSection()
  const updateCoreFunctionsSection = useUpdateCoreFunctionsSection()
  const { data: coreFunctionsItems } = useCoreFunctions()
  const updateCoreFunction = useUpdateCoreFunction()
  const addCoreFunction = useAddCoreFunction()
  const deleteCoreFunction = useDeleteCoreFunction()
  const [functionsEditing, setFunctionsEditing] = useState(false)
  const [functions, setFunctions] = useState<CoreFunction[]>([])
  const [functionsDescription, setFunctionsDescription] = useState('')
  const [functionsSnap, setFunctionsSnap] = useState<string | null>(null)

  useEffect(() => {
    if (!coreFunctionsSectionItem) return
    setFunctionsDescription(coreFunctionsSectionItem.description ?? '')
  }, [coreFunctionsSectionItem])

  useEffect(() => {
    if (!coreFunctionsItems || functionsEditing) return
    setFunctions(coreFunctionsItems.map((item, index) => ({
      id: String(item.id),
      title: item.title ?? '',
      body: item.description ?? '',
      isPrimary: index === 0,
    })))
  }, [coreFunctionsItems, functionsEditing])

  // ── Platform Areas state ────────────────────────────────────────────────────
  const [squadsEditing, setSquadsEditing] = useState(false)
  const [squads, setSquads] = useState<Squad[]>(INITIAL_SQUADS)
  const [squadsSnap, setSquadsSnap] = useState<string | null>(null)

  // ── Comments from Directus ──────────────────────────────────────────────────
  const { data: platformAreas } = usePlatformAreas()
  const { data: allComments } = useComments()

  const squadNameToContentId = useMemo<Map<string, number>>(() => {
    const map = new Map<string, number>()
    platformAreas?.forEach(area => {
      if (area.title) map.set(area.title.trim().toLowerCase(), area.id)
    })
    return map
  }, [platformAreas])

  useEffect(() => {
    if (!platformAreas) return
    setSquads(prev =>
      prev.map(squad => ({
        ...squad,
        contentId: squadNameToContentId.get(squad.name.trim().toLowerCase()),
      }))
    )
  }, [platformAreas, squadNameToContentId])

  // ── Block details state ─────────────────────────────────────────────────────
  const [blockDetails, setBlockDetails] = useState<Record<string, ItemDetailData>>({})
  const [openViewBlockId, setOpenViewBlockId] = useState<string | null>(null)
  const [openEditBlockId, setOpenEditBlockId] = useState<string | null>(null)

  // ── Navigation (for badge shortcuts) ───────────────────────────────────────
  const navigate = useNavigate()

  // ── Pointer tracking (click vs drag-select guard) ───────────────────────────
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null)
  function onBlockPointerDown(e: React.PointerEvent) { pointerDownRef.current = { x: e.clientX, y: e.clientY } }
  function wasClick(e: React.MouseEvent) {
    const p = pointerDownRef.current
    return !p || Math.hypot(e.clientX - p.x, e.clientY - p.y) <= 4
  }

  // ── DnD sensors ─────────────────────────────────────────────────────────────
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // ── Hero edit lifecycle ─────────────────────────────────────────────────────
  function beginHeroEdit() { setHeroSnap(JSON.stringify(hero)); setHeroEditing(true) }
  function doneHeroEdit() {
    setHeroSnap(null)
    setHeroEditing(false)
    if (!headerItem) return
    updateHeader.mutate({
      id: headerItem.id,
      data: { title: hero.eyebrow, subtitle: hero.title, description: hero.description },
    })
    hero.blocks.forEach((block, index) => {
      const numId = Number(block.id)
      const cardData = { order_value: index, title: block.label, subtitle: block.title, description: block.subtitle }
      if (!isNaN(numId)) {
        updateHeaderCard.mutate({ id: numId, data: cardData })
      } else {
        addHeaderCard.mutate({ type: 'header_card', ...cardData })
      }
    })
  }
  function cancelHeroEdit() {
    if (heroSnap) setHero(JSON.parse(heroSnap) as HeroData)
    setHeroSnap(null); setHeroEditing(false)
  }

  // ── Functions edit lifecycle ────────────────────────────────────────────────
  function beginFunctionsEdit() { setFunctionsSnap(JSON.stringify(functions)); setFunctionsEditing(true) }
  function doneFunctionsEdit() {
    setFunctionsSnap(null)
    setFunctionsEditing(false)
    if (coreFunctionsSectionItem) {
      updateCoreFunctionsSection.mutate({ id: coreFunctionsSectionItem.id, data: { description: functionsDescription } })
    }
    const currentIds = new Set(functions.map(fn => Number(fn.id)).filter(id => !isNaN(id)))
    coreFunctionsItems?.forEach(item => {
      if (!currentIds.has(item.id)) deleteCoreFunction.mutate(item.id)
    })
    functions.forEach((fn, index) => {
      const numId = Number(fn.id)
      const fnData = { order_value: index, title: fn.title, description: fn.body }
      if (!isNaN(numId)) {
        updateCoreFunction.mutate({ id: numId, data: fnData })
      } else {
        addCoreFunction.mutate({ type: 'core_function', ...fnData })
      }
    })
  }
  function cancelFunctionsEdit() {
    if (functionsSnap) setFunctions(JSON.parse(functionsSnap) as CoreFunction[])
    setFunctionsSnap(null); setFunctionsEditing(false)
  }

  // ── Squads edit lifecycle ───────────────────────────────────────────────────
  function beginSquadsEdit() { setSquadsSnap(JSON.stringify(squads)); setSquadsEditing(true) }
  function doneSquadsEdit() { setSquadsSnap(null); setSquadsEditing(false) }
  function cancelSquadsEdit() {
    if (squadsSnap) setSquads(JSON.parse(squadsSnap) as Squad[])
    setSquadsSnap(null); setSquadsEditing(false)
  }

  // ── Hero helpers ────────────────────────────────────────────────────────────
  function updateHeroField(field: keyof Omit<HeroData, 'blocks'>, value: string) {
    setHero(prev => ({ ...prev, [field]: value }))
  }
  function updateBlock(id: string, field: keyof HeroBlock, value: string) {
    setHero(prev => ({ ...prev, blocks: prev.blocks.map(b => b.id === id ? { ...b, [field]: value } : b) }))
  }
  function addBlock() {
    setHero(prev => ({ ...prev, blocks: [...prev.blocks, { id: `new-${Date.now()}`, label: 'Label', title: 'Title', subtitle: 'Description' }] }))
  }
  function removeBlock(id: string) {
    setHero(prev => ({ ...prev, blocks: prev.blocks.filter(b => b.id !== id) }))
  }
  function handleHeroBlocksDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id) {
      const oldIdx = hero.blocks.findIndex(b => b.id === active.id)
      const newIdx = hero.blocks.findIndex(b => b.id === over.id)
      setHero(prev => ({ ...prev, blocks: arrayMove(prev.blocks, oldIdx, newIdx) }))
    }
  }

  // ── Functions helpers ───────────────────────────────────────────────────────
  function handleFunctionsDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id) {
      const oldIdx = functions.findIndex(f => f.id === active.id)
      const newIdx = functions.findIndex(f => f.id === over.id)
      setFunctions(prev => arrayMove(prev, oldIdx, newIdx))
    }
  }

  // ── Squads helpers ──────────────────────────────────────────────────────────
  function addSquad() {
    setSquads(prev => [...prev, {
      id: `custom-${Date.now()}`,
      name: 'New Platform Area',
      tagline: 'Add a tagline',
      description: 'Describe what this platform area is about and what it enables...',
      icon: EmojiObjects as IconComp,
      accentBg: 'bg-muted',
      fadedBg: 'bg-shell',
      textColor: 'text-muted-foreground',
      path: '/custom-squad',
    }])
  }
  function updateSquad(id: string, field: keyof Pick<Squad, 'name' | 'tagline' | 'description'>, value: string) {
    setSquads(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }
  function removeSquad(id: string) {
    setSquads(prev => prev.filter(s => s.id !== id))
  }
  function handleSquadsDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id) {
      const oldIdx = squads.findIndex(s => s.id === active.id)
      const newIdx = squads.findIndex(s => s.id === over.id)
      setSquads(prev => arrayMove(prev, oldIdx, newIdx))
    }
  }

  // ── Block detail helpers ────────────────────────────────────────────────────
  function getBlockDetail(id: string): ItemDetailData { return blockDetails[id] ?? { notes: '', files: [] } }
  function setBlockDetail(id: string, d: ItemDetailData) { setBlockDetails(prev => ({ ...prev, [id]: d })) }

  const viewBlock = openViewBlockId ? hero.blocks.find(b => b.id === openViewBlockId) : null
  const editBlock = openEditBlockId ? hero.blocks.find(b => b.id === openEditBlockId) : null

  return (
    <>
      <PageHeader
        title="Strategy in Action Product Vision"
        subtitle="A living document for product squads. Read, challenge, and contribute to the platform vision."
        actions={<><ExportButton /><CommentsToggleButton /><LogoutButton /></>}
      />

      <div className="flex gap-6">
        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">

          {/* ── Hero ── */}
          <CommentableRegion id="overview-hero" label="Vision & Positioning" className="rounded-2xl bg-primary text-white p-8 mb-6 relative">

            {/* Hero edit controls */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10" onMouseUp={e => e.stopPropagation()}>
              {heroEditing ? (
                <>
                  <button onClick={cancelHeroEdit} className="px-3 py-1.5 rounded-lg text-xs text-white/70 hover:text-white border border-transparent hover:border-white/30 hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={doneHeroEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-primary hover:bg-white/90 transition-colors">
                    <Check className="w-3.5 h-3.5" />Done
                  </button>
                </>
              ) : (
                <button onClick={beginHeroEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 text-white/80 hover:bg-white/25 transition-colors">
                  <Edit className="w-3.5 h-3.5" />Edit
                </button>
              )}
            </div>

            {heroEditing ? (
              <input value={hero.eyebrow} onChange={e => updateHeroField('eyebrow', e.target.value)} className="block bg-transparent border-b border-white/30 focus:border-white/70 text-white/60 text-xs font-semibold uppercase tracking-widest mb-3 w-full max-w-sm focus:outline-none placeholder:text-white/30" placeholder="Platform name" />
            ) : (
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">{hero.eyebrow}</p>
            )}

            {heroEditing ? (
              <input value={hero.title} onChange={e => updateHeroField('title', e.target.value)} className="block bg-transparent border-b border-white/30 focus:border-white/70 text-white text-2xl font-bold mb-4 w-full pr-32 focus:outline-none placeholder:text-white/30" placeholder="Vision title" />
            ) : (
              <h2 className="text-2xl font-bold mb-3 leading-tight pr-32">{hero.title}</h2>
            )}

            {heroEditing ? (
              <textarea value={hero.description} onChange={e => updateHeroField('description', e.target.value)} rows={3} className="block bg-transparent border border-white/20 focus:border-white/50 rounded-lg text-white/75 text-sm max-w-2xl w-full mb-6 p-2 focus:outline-none resize-none leading-relaxed placeholder:text-white/30" placeholder="Describe the platform vision..." />
            ) : (
              <p className="text-white/75 text-sm max-w-2xl leading-relaxed mb-6 whitespace-pre-wrap">{hero.description}</p>
            )}

            {/* Hero blocks — draggable in edit mode */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleHeroBlocksDragEnd}>
              <SortableContext items={hero.blocks.map(b => b.id)} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap gap-3">
                  {hero.blocks.map(block => (
                    <SortableRow key={block.id} id={block.id}>
                      {({ handleProps }) => (
                        <CommentableRegion id={`hero-block-${block.id}`} label={block.title} className="rounded-xl min-w-[140px]">
                        <div
                          className={cn('bg-white/10 border border-white/20 rounded-xl px-4 py-3 relative transition-colors', !heroEditing && 'cursor-pointer hover:bg-white/20')}
                          onPointerDown={!heroEditing ? onBlockPointerDown : undefined}
                          onClick={!heroEditing ? (e) => { if (wasClick(e)) setOpenViewBlockId(block.id) } : undefined}
                        >
                          {heroEditing ? (
                            <>
                              <div className="flex items-center justify-between mb-1.5">
                                <div {...handleProps} className="cursor-grab text-white/30 hover:text-white/60 transition-colors">
                                  <DragIndicator className="w-3.5 h-3.5" />
                                </div>
                                <button onClick={() => removeBlock(block.id)} className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">
                                  <Close className="w-3 h-3 text-white" />
                                </button>
                              </div>
                              <input value={block.label} onChange={e => updateBlock(block.id, 'label', e.target.value)} className="block bg-transparent border-b border-white/20 focus:border-white/50 text-[15px] font-semibold text-white/50 uppercase tracking-wider mb-1 w-full focus:outline-none placeholder:text-white/30" placeholder="LABEL" />
                              <input value={block.title} onChange={e => updateBlock(block.id, 'title', e.target.value)} className="block bg-transparent border-b border-white/20 focus:border-white/50 text-sm font-bold text-white w-full focus:outline-none placeholder:text-white/40 mt-0.5" placeholder="Title" />
                              <input value={block.subtitle} onChange={e => updateBlock(block.id, 'subtitle', e.target.value)} className="block bg-transparent border-b border-white/20 focus:border-white/50 text-xs text-white/60 mt-1 w-full focus:outline-none placeholder:text-white/30" placeholder="Description" />
                              <button
                                onClick={() => setOpenEditBlockId(block.id)}
                                className="flex items-center gap-1 text-[15px] text-white/40 hover:text-white/70 border border-dashed border-white/20 hover:border-white/40 rounded px-1.5 py-0.5 mt-2 w-full justify-center transition-colors"
                              >
                                <AttachFile className="w-2.5 h-2.5" />
                                {getBlockDetail(block.id).notes || getBlockDetail(block.id).files.length > 0 ? 'Edit details' : 'Add details'}
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-[15px] font-semibold text-white/50 uppercase tracking-wider mb-0.5">{block.label}</p>
                              <p className="text-sm font-bold">{block.title}</p>
                              <p className="text-xs text-white/60 mt-0.5">{block.subtitle}</p>
                            </>
                          )}
                        </div>
                        </CommentableRegion>
                      )}
                    </SortableRow>
                  ))}
                  {heroEditing && (
                    <button onClick={addBlock} className="bg-white/5 border border-dashed border-white/25 rounded-xl px-4 py-3 flex flex-col items-center justify-center gap-1.5 hover:bg-white/10 transition-colors min-w-[120px]">
                      <Add className="w-5 h-5 text-white/35" />
                      <span className="text-xs text-white/40 font-semibold">Add block</span>
                    </button>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </CommentableRegion>

          {/* ── Two Core Functions ── */}
          <CommentableRegion id="overview-functions" label={coreFunctionsTitle(functions.length)} className="rounded-xl border border-border bg-white shadow-xsmall p-6 mb-6">
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <EmojiObjects className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-heading">{coreFunctionsTitle(functions.length)}</h3>
              </div>
              <SectionEditButton
                editing={functionsEditing}
                onToggle={functionsEditing ? doneFunctionsEdit : beginFunctionsEdit}
                onCancel={cancelFunctionsEdit}
              />
            </div>
            {functionsEditing ? (
              <textarea
                value={functionsDescription}
                onChange={e => setFunctionsDescription(e.target.value)}
                rows={2}
                className="block w-full border border-border rounded-lg p-2 text-sm text-muted-foreground leading-relaxed bg-white focus:outline-none resize-none mb-5"
                placeholder="Add context or description for this section..."
              />
            ) : (
              functionsDescription && (
                <HighlightedText as="p" sectionId="overview-functions" text={functionsDescription} className="text-sm text-muted-foreground leading-relaxed mb-5" />
              )
            )}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFunctionsDragEnd}>
              <SortableContext items={functions.map(f => f.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-4">
                  {functions.map((fn, fnIndex) => (
                    <SortableRow key={fn.id} id={fn.id}>
                      {({ handleProps }) => (
                        <CommentableRegion id={`fn-${fn.id}`} label={fn.title} className="rounded-xl">
                        <div className={cn('rounded-xl border p-5 relative', fnIndex === 0 ? 'bg-primary-faded border-primary/10' : 'bg-shell border-border')}>
                          {functionsEditing ? (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <div {...handleProps} className="cursor-grab text-border hover:text-muted-foreground shrink-0 transition-colors">
                                  <DragIndicator className="w-3.5 h-3.5" />
                                </div>
                                {functions.length > 1 && (
                                  <button onClick={() => setFunctions(prev => prev.filter(f => f.id !== fn.id))} className="ml-auto w-5 h-5 rounded-full bg-white hover:bg-shell flex items-center justify-center border border-border">
                                    <Close className="w-3 h-3 text-muted-foreground" />
                                  </button>
                                )}
                              </div>
                              <input value={fn.title} onChange={e => setFunctions(prev => prev.map(f => f.id === fn.id ? { ...f, title: e.target.value } : f))} className={cn('block w-full border-b border-border text-sm font-bold bg-transparent focus:outline-none mb-2', fnIndex === 0 ? 'text-primary' : 'text-heading')} placeholder="Function title" />
                              <textarea value={fn.body} onChange={e => setFunctions(prev => prev.map(f => f.id === fn.id ? { ...f, body: e.target.value } : f))} rows={3} className="block w-full border border-border rounded-lg p-1.5 text-sm leading-relaxed bg-white focus:outline-none resize-none text-foreground" placeholder="Describe this function..." />
                            </>
                          ) : (
                            <>
                              <HighlightedText as="p" sectionId="overview-functions" text={fn.title} className={cn('text-sm font-bold mb-2', fnIndex === 0 ? 'text-primary' : 'text-heading')} />
                              <HighlightedText as="p" sectionId="overview-functions" text={fn.body} className={cn('text-sm leading-relaxed', fnIndex === 0 ? 'text-foreground' : 'text-muted-foreground')} />
                            </>
                          )}
                        </div>
                        </CommentableRegion>
                      )}
                    </SortableRow>
                  ))}
                  {functionsEditing && (
                    <button onClick={() => setFunctions(prev => [...prev, { id: `new-${Date.now()}`, title: 'New Function', body: '', isPrimary: false }])} className="flex-1 min-w-[180px] rounded-xl border border-dashed border-border p-5 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-shell transition-colors">
                      <Add className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-semibold">Add function</span>
                    </button>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </CommentableRegion>

          {/* ── Platform Areas ── */}
          <CommentableRegion id="overview-platform-areas" label="Platform Areas" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-heading">Platform Areas</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{squads.length} product squad{squads.length !== 1 ? 's' : ''} · 26 open contributions</p>
              </div>
              <SectionEditButton
                editing={squadsEditing}
                onToggle={squadsEditing ? doneSquadsEdit : beginSquadsEdit}
                onCancel={cancelSquadsEdit}
              />
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSquadsDragEnd}>
              <SortableContext items={squads.map(s => s.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {squads.map((squad, squadIdx) => {
                    const Icon = squad.icon
                    const squadNumber = String(squadIdx + 1).padStart(2, '0')
                    const TYPE_BADGE_STYLES = { idea: 'bg-primary-faded text-primary', feedback: 'bg-warning-faded text-warning', challenge: 'bg-destructive-faded text-destructive', question: 'bg-muted text-muted-foreground' } as const
                    return (
                      <SortableRow key={squad.id} id={squad.id}>
                        {({ handleProps }) => (
                          <CommentableRegion id={`squad-${squad.id}`} label={squad.name} contentId={squad.contentId} className="rounded-xl">
                          <Card className="flex flex-col shadow-xsmall rounded-xl border border-border overflow-hidden">
                            <div className="px-5 pt-5 pb-4 flex-1">
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', squad.accentBg)}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                {squadsEditing ? (
                                  <div className="flex items-center gap-2">
                                    <div {...handleProps} className="cursor-grab text-border hover:text-muted-foreground transition-colors">
                                      <DragIndicator className="w-4 h-4" />
                                    </div>
                                    <button onClick={() => removeSquad(squad.id)} className="w-6 h-6 rounded-full bg-shell hover:bg-destructive-faded flex items-center justify-center border border-border hover:border-destructive/30 transition-colors">
                                      <Close className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className={cn('text-3xl font-black leading-none', squad.fadedBg === 'bg-primary-faded' ? 'text-primary/15' : squad.fadedBg === 'bg-warning-faded' ? 'text-warning/15' : squad.fadedBg === 'bg-success-faded' ? 'text-success/15' : 'text-muted/30')}>
                                    {squadNumber}
                                  </span>
                                )}
                              </div>
                              {squadsEditing ? (
                                <div className="flex flex-col gap-2">
                                  <input value={squad.name} onChange={e => updateSquad(squad.id, 'name', e.target.value)} className="block w-full border-b border-border text-sm font-bold text-heading bg-transparent focus:outline-none" placeholder="Squad name" />
                                  <input value={squad.tagline} onChange={e => updateSquad(squad.id, 'tagline', e.target.value)} className={cn('block w-full border-b border-border text-xs font-semibold bg-transparent focus:outline-none', squad.textColor)} placeholder="Tagline" />
                                  <textarea value={squad.description} onChange={e => updateSquad(squad.id, 'description', e.target.value)} rows={3} className="block w-full border border-border rounded-lg p-2 text-xs text-muted-foreground leading-relaxed bg-white focus:outline-none resize-none" placeholder="Describe this platform area..." />
                                </div>
                              ) : (
                                <>
                                  <HighlightedText as="h4" sectionId="overview-platform-areas" text={squad.name} className="text-sm font-bold text-heading mb-0.5" />
                                  <HighlightedText as="p" sectionId="overview-platform-areas" text={squad.tagline} className={cn('text-xs font-semibold mb-2', squad.textColor)} />
                                  <HighlightedText as="p" sectionId="overview-platform-areas" text={squad.description} className="text-xs text-muted-foreground leading-relaxed" />
                                </>
                              )}
                            </div>
                            <div className={cn('px-5 py-3 border-t border-border flex items-center justify-between', squad.fadedBg)}>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {(() => {
                                  const counts = (allComments ?? [])
                                    .filter(c => c.content_id === squad.contentId)
                                    .reduce((acc, c) => { acc[c.type] = (acc[c.type] ?? 0) + 1; return acc }, {} as Partial<Record<CommentType, number>>)
                                  return (Object.entries(counts) as Array<[CommentType, number]>)
                                    .filter(([, count]) => count > 0)
                                    .map(([type, count]) => (
                                      <button
                                        key={type}
                                        onClick={() => navigate({ to: squad.path as '/formulate', state: { panelOpen: true, typeFilter: type } })}
                                        className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[15px] font-semibold transition-opacity hover:opacity-75', TYPE_BADGE_STYLES[type])}
                                      >
                                        {count} {type}
                                      </button>
                                    ))
                                })()}
                              </div>
                              <Link to={squad.path as '/formulate'}>
                                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2">
                                  Explore<ArrowForward className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                            {(() => {
                              if (!allComments || squad.contentId === undefined) return null
                              const squadComments = allComments.filter(c => c.content_id === squad.contentId).slice(0, 3)
                              if (squadComments.length === 0) return null
                              return squadComments.map((item, idx, arr) => (
                                <div
                                  key={item.id}
                                  className={cn('px-4 py-3 flex items-start gap-2.5 bg-white', idx < arr.length - 1 && 'border-b border-border/50')}
                                >
                                  <div className="w-6 h-6 text-[15px] rounded-full bg-shell border border-border text-heading font-bold flex items-center justify-center shrink-0 mt-0.5">{getInitials(item.author)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                      <span className="text-[15px] font-semibold text-heading">{item.author}</span>
                                      <TypeBadge type={item.type} />
                                      <span className="text-[14px] text-muted-foreground ml-auto">{getRelativeTime(item.date_created)}</span>
                                    </div>
                                    <p className="text-[15px] text-muted-foreground leading-relaxed line-clamp-2">{item.text}</p>
                                  </div>
                                </div>
                              ))
                            })()}
                          </Card>
                          </CommentableRegion>
                        )}
                      </SortableRow>
                    )
                  })}
                  {squadsEditing && (
                    <button onClick={addSquad} className="rounded-xl border-2 border-dashed border-border bg-white p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-shell transition-colors min-h-[180px]">
                      <div className="w-10 h-10 rounded-xl bg-shell border border-border flex items-center justify-center">
                        <Add className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-muted-foreground">Add Platform Area</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">Creates a new canvas page</p>
                      </div>
                    </button>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </CommentableRegion>

        </div>

        {/* ── Comments panel ── */}
        <CommentsPanel />
      </div>

      {/* Hero block view panel */}
      {openViewBlockId && viewBlock && (
        <ItemDetailPanel
          title={`${viewBlock.label}: ${viewBlock.title}`}
          description={viewBlock.subtitle}
          detail={getBlockDetail(openViewBlockId)}
          onClose={() => setOpenViewBlockId(null)}
          onEdit={() => { const id = openViewBlockId; setOpenViewBlockId(null); setOpenEditBlockId(id) }}
        />
      )}
      {/* Hero block edit modal */}
      {openEditBlockId && editBlock && (
        <ItemDetailModal
          key={openEditBlockId}
          title={`${editBlock.label}: ${editBlock.title}`}
          description={editBlock.subtitle}
          detail={getBlockDetail(openEditBlockId)}
          onClose={() => setOpenEditBlockId(null)}
          onChange={d => setBlockDetail(openEditBlockId, d)}
        />
      )}
      <TourTip />
    </>
  )
}

function OverviewPage() {
  return (
    <CommentProvider>
      <OverviewContent />
    </CommentProvider>
  )
}
