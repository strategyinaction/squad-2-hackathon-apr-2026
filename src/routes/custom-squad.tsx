import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '#/components/PageHeader'
import { ExportButton } from '#/components/ExportButton'
import { LogoutButton } from '#/components/LogoutButton'
import { VisionCanvas } from '#/components/VisionCanvas'
import { CommentProvider, CommentableRegion, CommentsPanel, CommentsToggleButton } from '#/components/CommentingSystem'
import type { CanvasPersona, CanvasPain, CanvasPoint, CanvasSuccess } from '#/components/VisionCanvas'

export const Route = createFileRoute('/custom-squad')({ component: CustomSquadPage })

// ─── Empty canvas data ────────────────────────────────────────────────────────

const EMPTY_PERSONAS: CanvasPersona[] = [
  { id: 'p1', label: 'Persona', quote: '', jtbds: [''] },
]

const EMPTY_PAINS: CanvasPain[] = [
  { id: 1, title: '', description: '' },
]

const EMPTY_PRODUCT_POINTS: CanvasPoint[] = [
  { headline: '', detail: '' },
]

const EMPTY_SUCCESS_ITEMS: CanvasSuccess[] = [
  { id: 1, title: '', detail: '' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

function CustomSquadContent() {
  return (
    <>
      <PageHeader
        back={{ to: '..' }}
        title="New Platform Area"
        subtitle="Use the canvas below to define this platform area's vision, target group, needs, product, and goals."
        breadcrumbs={[{ label: 'Product Vision', to: '..' }, { label: 'New Platform Area' }]}
        actions={<><ExportButton /><CommentsToggleButton /><LogoutButton /></>}
      />
      <div className="flex gap-6">
        <CommentableRegion id="custom-canvas" label="Vision Canvas" className="flex-1 min-w-0">
          <VisionCanvas
            accent="primary"
            canvasId="custom"
            initialEditing={true}
            visionStatement=""
            visionDetail=""
            personas={EMPTY_PERSONAS}
            pains={EMPTY_PAINS}
            productPoints={EMPTY_PRODUCT_POINTS}
            successItems={EMPTY_SUCCESS_ITEMS}
          />
        </CommentableRegion>
        <CommentsPanel />
      </div>
    </>
  )
}

function CustomSquadPage() {
  return (
    <CommentProvider>
      <CustomSquadContent />
    </CommentProvider>
  )
}
