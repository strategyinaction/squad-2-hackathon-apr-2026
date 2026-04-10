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
import { usePainSection, usePains, useUpdatePainSection, useAddPainSection, useUpdatePain, useAddPain } from '#/lib/api/pains'
import { usePainRelievers, useUpdatePainReliever, useAddPainReliever } from '#/lib/api/painRelievers'

export const Route = createFileRoute('/formulate')({ component: FormulateStrategyPage })

// ─── Static Canvas Data (success items remain static for now) ────────────────

const SUCCESS_ITEMS: CanvasSuccess[] = [
  { id: 1, title: 'Strategy formulation takes weeks, not months', detail: 'AI-powered research and analysis compress the data-gathering phase from weeks of manual effort to hours of curated insights, enabling strategy to be performed frequently rather than once every few years.' },
  { id: 2, title: 'Every strategic choice is explicit and "auditable"', detail: 'The organisation can trace any priority back to the analysis that informed it, the options that were considered, the hypotheses that underpin it, and the assumptions that need to hold.' },
  { id: 3, title: 'A shared strategic language exists across the enterprise', detail: 'Business units, geographies, and functional teams use the same ontology, enabling meaningful comparison, aggregation, and cross-pollination of strategic thinking.' },
  { id: 4, title: 'The quality of strategic reasoning is consistently high', detail: 'AI co-pilots reduce variance by ensuring every formulation process follows a rigorous structure. Choices have structure: a current state, a target state, underlying hypotheses, and supporting evidence.' },
  { id: 5, title: 'AI augments judgement, it does not replace it', detail: 'The cognitive heavy-lifting (research, analysis, synthesis, scenario simulation) is delegated to the AI. But strategic judgement — evaluating options, making choices, building commitment — remains a fundamentally human act.' },
  { id: 6, title: 'Governance is customised per engagement', detail: 'Different organisations have different governance and organisational requirements. The platform supports configurable organisational and governance structures, without requiring a one-size-fits-all methodology.' },
  { id: 7, title: 'Strategy is de-mystified', detail: "When someone reads a strategy inside this module, it's clear, meaningful, specific, and makes a lot of sense. It is not a declaration of intent, it is not a slogan, it is not a deck of 150 slides of analysis." },
]

// ─── Helpers: map Directus content items → Canvas types ──────────────────────

/** subtitle stores comma-separated persona content IDs → string[] */
function parsePersonaIds(subtitle: string | null): string[] {
  if (!subtitle) return []
  return subtitle.split(',').map(s => s.trim()).filter(Boolean)
}

/** subtitle stores comma-separated pain content IDs → number[] */
function parsePainIds(subtitle: string | null): number[] {
  if (!subtitle) return []
  return subtitle.split(',').map(s => Number.parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n))
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function jtbdTitle(j: string | CanvasJTBD): string {
  return typeof j === 'string' ? j : j.title
}

function FormulateStrategyContent() {
  const [detailedView, setDetailedView] = useState(false)

  // Vision hooks
  const { data: visionCard, isLoading: visionCardLoading } = useVisionCard()
  const { data: visionCallouts, isLoading: calloutsLoading } = useVisionCardCallouts()
  const updateVisionCard = useUpdateVisionCard()
  const updateVisionCardCallout = useUpdateVisionCardCallout()
  const addVisionCardCallout = useAddVisionCardCallout()

  // Persona hooks
  const { data: personaItems, isLoading: personasItemsLoading } = usePersonas()
  const { data: jtbdItems, isLoading: jtbdsLoading } = usePersonaJTBDs()
  const updatePersona = useUpdatePersona()
  const addPersona = useAddPersona()
  const updatePersonaJTBD = useUpdatePersonaJTBD()
  const addPersonaJTBD = useAddPersonaJTBD()
  const deletePersonaJTBD = useDeletePersonaJTBD()

  // Pain hooks
  const { data: painSection, isLoading: painSectionLoading } = usePainSection()
  const { data: painItems, isLoading: painsLoading } = usePains()
  const updatePainSection = useUpdatePainSection()
  const addPainSection = useAddPainSection()
  const updatePain = useUpdatePain()
  const addPain = useAddPain()

  // Pain reliever hooks
  const { data: painRelieverItems, isLoading: painRelieversLoading } = usePainRelievers()
  const updatePainReliever = useUpdatePainReliever()
  const addPainReliever = useAddPainReliever()

  const visionLoading = visionCardLoading || calloutsLoading
  const personasLoading = personasItemsLoading || jtbdsLoading
  const painsAllLoading = painSectionLoading || painsLoading || painRelieversLoading

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

  // Map Pains from API → CanvasPain[]
  const pains: CanvasPain[] = painItems
    ? painItems.map(p => ({
        id: p.id,
        title: p.title ?? '',
        description: p.description ?? '',
        personaIds: parsePersonaIds(p.subtitle),
      }))
    : []

  // Map Pain Subtitle
  const painSubtitle = painSection?.title ?? undefined

  // Map Pain Relievers (solutions) from API → CanvasSolution[]
  const solutions: CanvasSolution[] = painRelieverItems
    ? painRelieverItems.map(s => ({
        id: s.id,
        title: s.title ?? '',
        description: s.description ?? '',
        painIds: parsePainIds(s.subtitle),
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
        addVisionCardCallout.mutate({ type: 'vision_card_callout', title: vision.callout.label, subtitle: null, description: vision.callout.body, order_value: 1, parent_id: null })
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
            addPersonaJTBD.mutate({ type: 'persona_jtbd', title, subtitle: inst, description: cog, order_value: jIndex + 1, parent_id: numId })
          }
        })
        // Delete JTBDs that were removed
        existingJtbds.slice(persona.jtbds.length).forEach(j => {
          deletePersonaJTBD.mutate(j.id)
        })
      } else {
        addPersona.mutate({ type: 'persona', ...personaData, subtitle: null, parent_id: null })
      }
    })
  }

  function handleSavePains(updatedPains: CanvasPain[], updatedSubtitle?: string) {
    // Save / update pain section subtitle
    if (updatedSubtitle !== undefined) {
      if (painSection) {
        updatePainSection.mutate({ id: painSection.id, data: { title: updatedSubtitle } })
      } else {
        addPainSection.mutate({ type: 'pain_section', title: updatedSubtitle, subtitle: null, description: null, order_value: 1, parent_id: null })
      }
    }
    // Save each pain
    updatedPains.forEach((pain, i) => {
      const personaIdStr = pain.personaIds?.length ? pain.personaIds.join(',') : null
      const painData = { title: pain.title, description: pain.description, subtitle: personaIdStr, order_value: i + 1 }
      const existing = painItems?.find(p => p.id === pain.id)
      if (existing) {
        updatePain.mutate({ id: pain.id, data: painData })
      } else {
        addPain.mutate({ type: 'pain', ...painData, parent_id: null })
      }
    })
  }

  function handleSaveSolutions(updatedSolutions: CanvasSolution[]) {
    updatedSolutions.forEach((sol, i) => {
      const painIdStr = sol.painIds.length ? sol.painIds.join(',') : null
      const solData = { title: sol.title, description: sol.description, subtitle: painIdStr, order_value: i + 1 }
      const existing = painRelieverItems?.find(s => s.id === sol.id)
      if (existing) {
        updatePainReliever.mutate({ id: sol.id, data: solData })
      } else {
        addPainReliever.mutate({ type: 'pain_reliever', ...solData, parent_id: null })
      }
    })
  }

  return (
    <>
      <PageHeader
        sticky
        back={{ to: '..' }}
        title="Formulate Strategy"
        subtitle="Making Better Strategic Choices — which ELT can commit on, in a fast and inexpensive way."
        breadcrumbs={[{ label: 'Product Vision', to: '..' }, { label: 'Formulate Strategy' }]}
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
        <CommentableRegion id="formulate-canvas" label="Vision Canvas" className="flex-1 min-w-0">
          <VisionCanvas
            accent="primary"
            canvasId="formulate"
            visionStatement={visionStatement}
            visionDetail={visionDetail}
            visionCallout={visionCallout}
            personas={personas}
            pains={pains}
            painSubtitle={painSubtitle}
            solutions={solutions}
            successItems={SUCCESS_ITEMS}
            detailedView={detailedView}
            onSaveVision={handleSaveVision}
            visionLoading={visionLoading}
            onSavePersonas={handleSavePersonas}
            personasLoading={personasLoading}
            onSavePains={handleSavePains}
            onSaveSolutions={handleSaveSolutions}
            painsLoading={painsAllLoading}
          />
        </CommentableRegion>
        <CommentsPanel />
      </div>
    </>
  )
}

function FormulateStrategyPage() {
  const location = useLocation()
  const nav = location.state as { panelOpen?: boolean; typeFilter?: CommentType } | null
  return (
    <CommentProvider initialPanelOpen={nav?.panelOpen} initialTypeFilter={nav?.typeFilter}>
      <FormulateStrategyContent />
    </CommentProvider>
  )
}
