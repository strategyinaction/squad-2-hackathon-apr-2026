import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '#/lib/utils';
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AttachFile, ChevronRight, CheckCircle, Edit, Check, Add, Close, DragIndicator,
} from '#/icons';
import { CommentableRegion, HighlightedText } from '#/components/CommentingSystem';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccentVariant = 'primary' | 'warning' | 'success';

const ACCENT: Record<AccentVariant, {
  text: string;
  faded: string;
  fadedBorder: string;
  bullet: string;
  pillActive: string;
  quoteBorder: string;
  calloutText: string;
}> = {
  primary: {
    text: 'text-primary',
    faded: 'bg-primary-faded',
    fadedBorder: 'border-primary/20',
    bullet: 'bg-primary-faded text-primary',
    pillActive: 'bg-primary text-white border-primary',
    quoteBorder: 'border-l-primary',
    calloutText: 'text-primary',
  },
  warning: {
    text: 'text-warning',
    faded: 'bg-warning-faded',
    fadedBorder: 'border-warning/20',
    bullet: 'bg-warning-faded text-warning',
    pillActive: 'bg-warning text-white border-warning',
    quoteBorder: 'border-l-warning',
    calloutText: 'text-warning',
  },
  success: {
    text: 'text-success',
    faded: 'bg-success-faded',
    fadedBorder: 'border-success/20',
    bullet: 'bg-success-faded text-success',
    pillActive: 'bg-success text-white border-success',
    quoteBorder: 'border-l-success',
    calloutText: 'text-success',
  },
};

export interface CanvasPersona {
  id: string;
  label: string;
  quote: string;
  jtbds: string[];
}

export interface CanvasPain {
  id: number;
  title: string;
  description: string;
}

export interface CanvasPoint {
  headline: string;
  detail: string;
}

export interface CanvasSuccess {
  id: number;
  title: string;
  detail: string;
}

interface CanvasData {
  visionStatement: string;
  visionDetail: string;
  visionCallout: { label: string; body: string } | undefined;
  personas: CanvasPersona[];
  pains: CanvasPain[];
  painSubtitle: string | undefined;
  painCallout: { label: string; body: string; isDestructive?: boolean } | undefined;
  productPoints: CanvasPoint[];
  productSubtitle: string | undefined;
  productCallout: { label: string; body: string } | undefined;
  successItems: CanvasSuccess[];
}

export interface VisionCanvasProps {
  accent: AccentVariant;
  initialEditing?: boolean;
  canvasId?: string;
  visionStatement: string;
  visionDetail: string;
  visionCallout?: { label: string; body: string };
  personas: CanvasPersona[];
  pains: CanvasPain[];
  painSubtitle?: string;
  painCallout?: { label: string; body: string; isDestructive?: boolean };
  productPoints: CanvasPoint[];
  productSubtitle?: string;
  productCallout?: { label: string; body: string };
  successItems: CanvasSuccess[];
}

// ─── Shared item detail ───────────────────────────────────────────────────────

export interface ItemDetailData {
  notes: string;
  files: Array<{ id: string; name: string; size: string; dataUrl?: string }>;
}

// ─── SortableRow ──────────────────────────────────────────────────────────────

function SortableRow({
  id,
  children,
}: {
  id: number | string;
  children: (props: { handleProps: React.HTMLAttributes<HTMLDivElement> }) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
    >
      {children({ handleProps: { ...attributes, ...listeners } as React.HTMLAttributes<HTMLDivElement> })}
    </div>
  );
}

// ─── RichTextEditor ───────────────────────────────────────────────────────────

function RichTextEditor({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync initial value on mount only
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(cmd: string) {
    document.execCommand(cmd, false);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary/30">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-shell">
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('bold'); }} className="w-6 h-6 flex items-center justify-center rounded text-[11px] font-bold text-muted-foreground hover:bg-border hover:text-foreground transition-colors">B</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('italic'); }} className="w-6 h-6 flex items-center justify-center rounded text-[11px] italic text-muted-foreground hover:bg-border hover:text-foreground transition-colors">I</button>
        <div className="w-px h-3.5 bg-border mx-0.5" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} className="w-6 h-6 flex items-center justify-center rounded text-[11px] text-muted-foreground hover:bg-border hover:text-foreground transition-colors">•≡</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }} className="w-6 h-6 flex items-center justify-center rounded text-[10px] text-muted-foreground hover:bg-border hover:text-foreground transition-colors">1≡</button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        data-placeholder={placeholder}
        className="p-2.5 text-xs text-foreground leading-relaxed min-h-[80px] focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_strong]:font-semibold [&_em]:italic"
      />
    </div>
  );
}

// ─── ItemDetailModal ──────────────────────────────────────────────────────────

export function ItemDetailModal({
  title,
  description,
  detail,
  onClose,
  onChange,
}: {
  title: string;
  description: string;
  detail: ItemDetailData;
  onClose: () => void;
  onChange: (d: ItemDetailData) => void;
}) {
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const pending: Array<ItemDetailData['files'][number]> = [];
    let remaining = files.length;
    if (remaining === 0) return;

    files.forEach(f => {
      const sizeStr = f.size < 1024 ? `${f.size} B` : f.size < 1048576 ? `${(f.size / 1024).toFixed(1)} KB` : `${(f.size / 1048576).toFixed(1)} MB`;
      const entry: ItemDetailData['files'][number] = { id: `${Date.now()}-${f.name}`, name: f.name, size: sizeStr };
      if (f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          entry.dataUrl = ev.target?.result as string;
          pending.push(entry);
          remaining--;
          if (remaining === 0) onChange({ ...detail, files: [...detail.files, ...pending] });
        };
        reader.readAsDataURL(f);
      } else {
        pending.push(entry);
        remaining--;
        if (remaining === 0) onChange({ ...detail, files: [...detail.files, ...pending] });
      }
    });
    e.target.value = '';
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[1px]"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-large border border-border w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-border flex items-start gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Add Details</p>
            <h3 className="text-sm font-bold text-heading leading-snug">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-shell transition-colors"
          >
            <Close className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          {description && (
            <p className="text-xs text-foreground leading-relaxed mb-4 pb-4 border-b border-border">{description}</p>
          )}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-heading mb-1.5">Source Notes</label>
            <RichTextEditor
              value={detail.notes}
              onChange={notes => onChange({ ...detail, notes })}
              placeholder="Add context, sources, or references that justify this content..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1.5">Attachments</label>
            {detail.files.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-2">
                {detail.files.map(f => {
                  const isImg = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f.name);
                  return (
                    <div key={f.id}>
                      {isImg && f.dataUrl && (
                        <div className="rounded-lg overflow-hidden border border-border mb-1">
                          <img src={f.dataUrl} alt={f.name} className="w-full object-cover max-h-40" />
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-shell rounded-lg px-3 py-2 border border-border">
                        <AttachFile className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-foreground flex-1 truncate">{f.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{f.size}</span>
                        <button
                          onClick={() => onChange({ ...detail, files: detail.files.filter(x => x.id !== f.id) })}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-1 shrink-0"
                        >
                          <Close className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer border border-dashed border-border rounded-lg px-3 py-2 transition-colors hover:border-primary/40 hover:bg-shell w-full">
              <AttachFile className="w-3.5 h-3.5 shrink-0" />
              <span>Add attachment</span>
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={onFileChange} />
            </label>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border shrink-0 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">Done</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── ItemDetailPanel ──────────────────────────────────────────────────────────

export function ItemDetailPanel({
  title,
  description,
  detail,
  onClose,
  onEdit,
}: {
  title: string;
  description: string;
  detail: ItemDetailData;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const hasContent = detail.notes || detail.files.length > 0;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);

  return createPortal(
    <>
      <div className={cn('fixed inset-0 z-[1500] bg-black/10 transition-opacity duration-300', mounted ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <div className={cn('fixed right-0 top-0 h-full w-96 bg-white shadow-large z-[1501] flex flex-col border-l border-border transition-transform duration-300 ease-out', mounted ? 'translate-x-0' : 'translate-x-full')}>
        <div className="px-5 py-4 border-b border-border flex items-start gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Details</p>
            <h3 className="text-sm font-bold text-heading leading-snug">{title}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-shell border border-transparent hover:border-border transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-shell transition-colors"
            >
              <Close className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {description && (
            <p className="text-xs text-foreground leading-relaxed mb-4 pb-4 border-b border-border">{description}</p>
          )}
          {!hasContent ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground mb-1">No details added yet.</p>
              <p className="text-[10px] text-muted-foreground/70">Enter edit mode to add notes and attachments.</p>
            </div>
          ) : (
            <>
              {detail.notes && (
                <div className="mb-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notes</p>
                  <div
                    className="text-xs text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_strong]:font-semibold [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: detail.notes }}
                  />
                </div>
              )}
              {detail.files.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Attachments</p>
                  <div className="flex flex-col gap-2">
                    {detail.files.map(f => {
                      const isImg = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f.name);
                      return (
                        <div key={f.id}>
                          {isImg && f.dataUrl && (
                            <div className="rounded-lg overflow-hidden border border-border mb-1.5">
                              <img src={f.dataUrl} alt={f.name} className="w-full object-cover max-h-52" />
                            </div>
                          )}
                          <div className="flex items-center gap-2 bg-shell rounded-lg px-3 py-2 border border-border">
                            <AttachFile className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-foreground flex-1 truncate">{f.name}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{f.size}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export function VisionCanvas({
  accent,
  initialEditing = false,
  canvasId = 'canvas',
  visionStatement,
  visionDetail,
  visionCallout,
  personas,
  pains,
  painSubtitle,
  painCallout,
  productPoints,
  productSubtitle,
  productCallout,
  successItems,
}: VisionCanvasProps) {
  const [data, setData] = useState<CanvasData>({
    visionStatement,
    visionDetail,
    visionCallout,
    personas,
    pains,
    painSubtitle,
    painCallout,
    productPoints,
    productSubtitle,
    productCallout,
    successItems,
  });
  const [activePersona, setActivePersona] = useState(personas[0]?.id ?? '');
  const a = ACCENT[accent];

  // ── Pointer-distance click guard (prevents opening panel on text-select drag) ─
  const pdRef = useRef<{ x: number; y: number } | null>(null);
  function onItemPD(e: React.PointerEvent) { pdRef.current = { x: e.clientX, y: e.clientY }; }
  function isClick(e: React.MouseEvent) { const p = pdRef.current; return !p || Math.hypot(e.clientX - p.x, e.clientY - p.y) <= 4; }

  // ── Per-section editing states ─────────────────────────────────────────────
  const [visionEditing, setVisionEditing] = useState(initialEditing);
  const [targetEditing, setTargetEditing] = useState(initialEditing);
  const [needsEditing, setNeedsEditing] = useState(initialEditing);
  const [productEditing, setProductEditing] = useState(initialEditing);
  const [goalsEditing, setGoalsEditing] = useState(initialEditing);

  // JSON snapshots captured on edit-start; restored on cancel
  const [visionSnap, setVisionSnap] = useState<string | null>(null);
  const [targetSnap, setTargetSnap] = useState<string | null>(null);
  const [needsSnap, setNeedsSnap] = useState<string | null>(null);
  const [productSnap, setProductSnap] = useState<string | null>(null);
  const [goalsSnap, setGoalsSnap] = useState<string | null>(null);

  // ── Item details ───────────────────────────────────────────────────────────
  const [itemDetails, setItemDetails] = useState<Record<string, ItemDetailData>>({});
  const [openViewDetailId, setOpenViewDetailId] = useState<string | null>(null);
  const [openEditDetailId, setOpenEditDetailId] = useState<string | null>(null);

  // ── DnD sensors ────────────────────────────────────────────────────────────
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Data helpers ───────────────────────────────────────────────────────────
  function upd<K extends keyof CanvasData>(key: K, val: CanvasData[K]) {
    setData(d => ({ ...d, [key]: val }));
  }

  // ── Edit lifecycle ─────────────────────────────────────────────────────────
  type Section = 'vision' | 'target' | 'needs' | 'product' | 'goals';

  function beginEdit(section: Section) {
    const snap = JSON.stringify(data);
    if (section === 'vision')   { setVisionSnap(snap);  setVisionEditing(true);  }
    if (section === 'target')   { setTargetSnap(snap);  setTargetEditing(true);  }
    if (section === 'needs')    { setNeedsSnap(snap);   setNeedsEditing(true);   }
    if (section === 'product')  { setProductSnap(snap); setProductEditing(true); }
    if (section === 'goals')    { setGoalsSnap(snap);   setGoalsEditing(true);   }
  }

  function doneEdit(section: Section) {
    if (section === 'vision')  { setVisionSnap(null);  setVisionEditing(false);  }
    if (section === 'target')  {
      setTargetSnap(null); setTargetEditing(false);
      if (!data.personas.find(p => p.id === activePersona) && data.personas.length > 0)
        setActivePersona(data.personas[0]?.id ?? '');
    }
    if (section === 'needs')   { setNeedsSnap(null);   setNeedsEditing(false);   }
    if (section === 'product') { setProductSnap(null); setProductEditing(false); }
    if (section === 'goals')   { setGoalsSnap(null);   setGoalsEditing(false);   }
  }

  function cancelEdit(section: Section) {
    const snaps: Record<Section, string | null> = { vision: visionSnap, target: targetSnap, needs: needsSnap, product: productSnap, goals: goalsSnap };
    const snap = snaps[section];
    if (!snap) { doneEdit(section); return; }
    const r = JSON.parse(snap) as CanvasData;
    if (section === 'vision') {
      setData(d => ({ ...d, visionStatement: r.visionStatement, visionDetail: r.visionDetail, visionCallout: r.visionCallout }));
      setVisionSnap(null); setVisionEditing(false);
    }
    if (section === 'target') {
      setData(d => ({ ...d, personas: r.personas }));
      setTargetSnap(null); setTargetEditing(false);
      if (r.personas.length > 0) setActivePersona(r.personas[0]?.id ?? '');
    }
    if (section === 'needs') {
      setData(d => ({ ...d, pains: r.pains, painSubtitle: r.painSubtitle, painCallout: r.painCallout }));
      setNeedsSnap(null); setNeedsEditing(false);
    }
    if (section === 'product') {
      setData(d => ({ ...d, productPoints: r.productPoints, productSubtitle: r.productSubtitle, productCallout: r.productCallout }));
      setProductSnap(null); setProductEditing(false);
    }
    if (section === 'goals') {
      setData(d => ({ ...d, successItems: r.successItems }));
      setGoalsSnap(null); setGoalsEditing(false);
    }
  }

  // ── Item detail helpers ────────────────────────────────────────────────────
  function getDetail(id: string): ItemDetailData { return itemDetails[id] ?? { notes: '', files: [] }; }
  function setDetail(id: string, d: ItemDetailData) { setItemDetails(prev => ({ ...prev, [id]: d })); }

  // ── DnD handlers ──────────────────────────────────────────────────────────
  function handlePersonasDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) upd('personas', arrayMove(data.personas, active.id as number, over.id as number));
  }
  function handlePainsDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) upd('pains', arrayMove(data.pains, active.id as number, over.id as number));
  }
  function handlePointsDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) upd('productPoints', arrayMove(data.productPoints, active.id as number, over.id as number));
  }
  function handleSuccessDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) upd('successItems', arrayMove(data.successItems, active.id as number, over.id as number));
  }

  const rid = (name: string) => `${canvasId}-${name}`;
  const activePers = data.personas.find(p => p.id === activePersona) ?? data.personas[0];

  // Resolve display info for a given detail ID
  function resolveDetailInfo(id: string | null): { title: string; description: string } | null {
    if (!id) return null;
    if (id.startsWith('pain-')) {
      const pain = data.pains.find(p => p.id === parseInt(id.replace('pain-', '')));
      return pain ? { title: pain.title, description: pain.description } : null;
    } else if (id.startsWith('pp-')) {
      const point = data.productPoints[parseInt(id.replace('pp-', ''))];
      return point ? { title: point.headline, description: point.detail } : null;
    } else if (id.startsWith('success-')) {
      const item = data.successItems.find(s => s.id === parseInt(id.replace('success-', '')));
      return item ? { title: item.title, description: item.detail } : null;
    } else if (id.startsWith('persona-')) {
      const persona = data.personas.find(p => p.id === id.replace('persona-', ''));
      return persona ? { title: persona.label, description: persona.jtbds.join('\n') } : null;
    }
    return null;
  }
  const viewDetailInfo = resolveDetailInfo(openViewDetailId);
  const editDetailInfo = resolveDetailInfo(openEditDetailId);

  return (
    <div className="rounded-xl border border-border bg-white shadow-xsmall overflow-hidden">

      {/* ── Vision row — full width ── */}
      <div className={cn('border-b border-border relative', a.faded)}>
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10" onMouseUp={e => e.stopPropagation()}>
          {visionEditing ? (
            <>
              <button
                onClick={() => cancelEdit('vision')}
                className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-transparent hover:border-border hover:bg-white/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => doneEdit('vision')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-border text-heading shadow-xsmall hover:bg-shell transition-colors"
              >
                <Check className="w-3.5 h-3.5" />Done
              </button>
            </>
          ) : (
            <button
              onClick={() => beginEdit('vision')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-transparent text-muted-foreground hover:bg-white/60 hover:border-border transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />Edit
            </button>
          )}
        </div>

        {visionEditing ? (
          <div className="px-6 py-5">
            <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', a.text)}>Vision</p>
            <input
              value={data.visionStatement}
              onChange={e => upd('visionStatement', e.target.value)}
              className="block w-full bg-transparent border-b border-border focus:border-primary text-base font-bold text-heading leading-snug mb-3 pr-36 focus:outline-none"
              placeholder="Vision statement..."
            />
            <textarea
              value={data.visionDetail}
              onChange={e => upd('visionDetail', e.target.value)}
              rows={2}
              className="block w-full border border-border rounded-lg p-2 text-sm text-foreground leading-relaxed max-w-4xl focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none bg-white/60 mb-2"
              placeholder="Describe the vision in more detail..."
            />
            {data.visionCallout ? (
              <div className={cn('mt-3 rounded-lg border p-3 relative', a.faded, a.fadedBorder)}>
                <button onClick={() => upd('visionCallout', undefined)} className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition-colors border border-border/50">
                  <Close className="w-3 h-3 text-muted-foreground" />
                </button>
                <input value={data.visionCallout.label} onChange={e => upd('visionCallout', { ...data.visionCallout!, label: e.target.value })} className={cn('block w-full bg-transparent border-b border-border focus:outline-none text-xs font-bold mb-1.5 pr-6', a.calloutText)} placeholder="Callout label..." />
                <textarea value={data.visionCallout.body} onChange={e => upd('visionCallout', { ...data.visionCallout!, body: e.target.value })} rows={2} className="block w-full bg-white/60 border border-border rounded p-1.5 text-xs text-foreground leading-relaxed focus:outline-none resize-none" placeholder="Callout body..." />
              </div>
            ) : (
              <button onClick={() => upd('visionCallout', { label: 'Label', body: '' })} className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg px-3 py-1.5 transition-colors">
                <Add className="w-3.5 h-3.5" />Add callout
              </button>
            )}
          </div>
        ) : (
          <CommentableRegion id={rid('vision')} label="Vision" className="px-6 py-5">
            <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-2', a.text)}>Vision</p>
            <HighlightedText as="h3" sectionId={rid('vision')} text={data.visionStatement} className="text-base font-bold text-heading leading-snug mb-2 pr-36" />
            <HighlightedText as="p" sectionId={rid('vision')} text={data.visionDetail} className="text-sm text-muted-foreground leading-relaxed max-w-4xl" />
            {data.visionCallout && (
              <div className={cn('mt-3 rounded-lg border p-3', a.faded, a.fadedBorder)}>
                <HighlightedText as="p" sectionId={rid('vision')} text={data.visionCallout.label} className={cn('text-xs font-bold mb-0.5', a.calloutText)} />
                <HighlightedText as="p" sectionId={rid('vision')} text={data.visionCallout.body} className="text-xs text-foreground leading-relaxed" />
              </div>
            )}
          </CommentableRegion>
        )}
      </div>

      {/* ── 4-column grid ── */}
      <div className="grid grid-cols-4 divide-x divide-border">

        {/* ── Target Group ── */}
        <CanvasCell
          label="Target Group"
          question="Who are we building for?"
          accent={a}
          commentSectionId={targetEditing ? undefined : rid('target-group')}
          commentSectionLabel="Target Group"
          editing={targetEditing}
          onEdit={() => beginEdit('target')}
          onDone={() => doneEdit('target')}
          onCancel={() => cancelEdit('target')}
        >
          {targetEditing ? (
            <div className="flex flex-col gap-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePersonasDragEnd}>
                <SortableContext items={data.personas.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                  {data.personas.map((p, pi) => (
                    <SortableRow key={p.id} id={pi}>
                      {({ handleProps }) => (
                        <div className="rounded-lg border border-border bg-shell/30 p-3 relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div {...handleProps} className="cursor-grab text-border hover:text-muted-foreground shrink-0 transition-colors">
                              <DragIndicator className="w-3.5 h-3.5" />
                            </div>
                            <input
                              value={p.label}
                              onChange={e => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, label: e.target.value } : x))}
                              className="flex-1 border-b border-border text-[11px] font-bold text-heading bg-transparent focus:outline-none"
                              placeholder="Persona name"
                            />
                            <button onClick={() => upd('personas', data.personas.filter((_, i) => i !== pi))} className="w-5 h-5 rounded-full bg-white hover:bg-shell flex items-center justify-center border border-border shrink-0">
                              <Close className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                          </div>
                          <textarea value={p.quote} onChange={e => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, quote: e.target.value } : x))} rows={2} className="block w-full border border-border rounded p-1.5 text-[10px] italic text-foreground leading-relaxed mb-2 bg-white focus:outline-none resize-none" placeholder="Representative quote..." />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Jobs to be done</p>
                          {p.jtbds.map((jtbd, ji) => (
                            <div key={ji} className="flex items-center gap-1 mb-1">
                              <input value={jtbd} onChange={e => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, jtbds: x.jtbds.map((j, k) => k === ji ? e.target.value : j) } : x))} className="flex-1 border-b border-border text-[10px] text-foreground bg-transparent focus:outline-none py-0.5" placeholder="Job to be done..." />
                              <button onClick={() => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, jtbds: x.jtbds.filter((_, k) => k !== ji) } : x))} className="w-4 h-4 rounded-full bg-shell hover:bg-border flex items-center justify-center shrink-0">
                                <Close className="w-2.5 h-2.5 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, jtbds: [...x.jtbds, ''] } : x))} className={cn('flex items-center gap-1 text-[10px] hover:opacity-80 mt-2 transition-colors', a.text)}>
                            <Add className="w-3 h-3" />Add JTBD
                          </button>
                          <button
                            onClick={() => setOpenEditDetailId(`persona-${p.id}`)}
                            className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2 py-1 mt-2 w-full transition-colors"
                          >
                            <AttachFile className="w-3 h-3" />
                            {getDetail(`persona-${p.id}`).notes || getDetail(`persona-${p.id}`).files.length > 0 ? 'Edit details' : 'Add details / attachment'}
                          </button>
                        </div>
                      )}
                    </SortableRow>
                  ))}
                </SortableContext>
              </DndContext>
              <button onClick={() => upd('personas', [...data.personas, { id: Date.now().toString(), label: 'New Persona', quote: '', jtbds: [] }])} className="flex items-center justify-center gap-1.5 border border-dashed border-border rounded-lg py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                <Add className="w-3.5 h-3.5" />Add persona
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5 mb-1">
                {data.personas.map(p => (
                  <button key={p.id} onClick={() => setActivePersona(p.id)} className={cn('px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all', activePersona === p.id ? a.pillActive : 'bg-white text-muted-foreground border-border hover:border-primary/30')}>
                    {p.label}
                  </button>
                ))}
              </div>
              {activePers && (
                <div
                  className="flex flex-col gap-3 cursor-pointer rounded-lg p-1.5 -mx-1.5 hover:bg-shell/70 transition-colors"
                  onPointerDown={onItemPD}
                  onClick={(e) => { if (isClick(e)) setOpenViewDetailId(`persona-${activePers.id}`); }}
                >
                  <div className="flex items-start gap-1.5">
                    <HighlightedText as="p" sectionId={rid('target-group')} text={activePers.quote} className={cn('flex-1 text-[11px] italic text-foreground leading-relaxed border-l-2 pl-3', a.quoteBorder)} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Jobs to be done</p>
                    <div className="flex flex-col gap-2">
                      {activePers.jtbds.map((jtbd, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <ChevronRight className={cn('w-3 h-3 mt-0.5 shrink-0', a.text)} />
                          <HighlightedText as="p" sectionId={rid('target-group')} text={jtbd} className="text-[11px] text-foreground leading-snug" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CanvasCell>

        {/* ── Needs ── */}
        <CanvasCell
          label="Needs"
          question="What problems are we solving?"
          accent={a}
          commentSectionId={needsEditing ? undefined : rid('needs')}
          commentSectionLabel="Needs"
          editing={needsEditing}
          onEdit={() => beginEdit('needs')}
          onDone={() => doneEdit('needs')}
          onCancel={() => cancelEdit('needs')}
        >
          {needsEditing ? (
            <>
              {data.painSubtitle !== undefined ? (
                <textarea value={data.painSubtitle} onChange={e => upd('painSubtitle', e.target.value)} rows={2} className="block w-full border border-border rounded-lg p-1.5 text-[11px] text-muted-foreground leading-relaxed mb-3 bg-white focus:outline-none resize-none" placeholder="Subtitle..." />
              ) : (
                <button onClick={() => upd('painSubtitle', '')} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2 py-1 mb-3 transition-colors">
                  <Add className="w-3 h-3" />Add subtitle
                </button>
              )}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePainsDragEnd}>
                <SortableContext items={data.pains.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-3">
                    {data.pains.map((pain, i) => (
                      <SortableRow key={pain.id} id={i}>
                        {({ handleProps }) => (
                          <div className="flex items-start gap-1.5">
                            <div {...handleProps} className="cursor-grab text-border hover:text-muted-foreground shrink-0 mt-1.5 transition-colors">
                              <DragIndicator className="w-3.5 h-3.5" />
                            </div>
                            <span className="w-5 h-5 rounded-full bg-destructive-faded text-destructive text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <input value={pain.title} onChange={e => upd('pains', data.pains.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} className="block w-full border-b border-border text-[11px] font-bold text-heading leading-tight bg-transparent focus:outline-none mb-0.5" placeholder="Pain title..." />
                              <textarea value={pain.description} onChange={e => upd('pains', data.pains.map((x, k) => k === i ? { ...x, description: e.target.value } : x))} rows={2} className="block w-full border border-border rounded p-1 text-[10px] text-muted-foreground leading-relaxed bg-white focus:outline-none resize-none mt-1" placeholder="Description..." />
                              <button
                                onClick={() => setOpenEditDetailId(`pain-${pain.id}`)}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-1.5 py-0.5 mt-1.5 transition-colors"
                              >
                                <AttachFile className="w-2.5 h-2.5" />
                                {getDetail(`pain-${pain.id}`).notes || getDetail(`pain-${pain.id}`).files.length > 0 ? 'Edit details' : 'Add details'}
                              </button>
                            </div>
                            <button onClick={() => upd('pains', data.pains.filter((_, k) => k !== i))} className="w-5 h-5 rounded-full bg-shell hover:bg-border flex items-center justify-center shrink-0 mt-0.5 border border-border">
                              <Close className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </SortableRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <button onClick={() => upd('pains', [...data.pains, { id: Date.now(), title: '', description: '' }])} className="flex items-center justify-center gap-1.5 border border-dashed border-border rounded-lg py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors mt-3 w-full">
                <Add className="w-3.5 h-3.5" />Add need
              </button>
              {data.painCallout ? (
                <div className={cn('mt-3 rounded-lg border p-2.5 relative bg-shell border-border')}>
                  <button onClick={() => upd('painCallout', undefined)} className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white hover:bg-border flex items-center justify-center border border-border">
                    <Close className="w-2.5 h-2.5 text-muted-foreground" />
                  </button>
                  <input value={data.painCallout.label} onChange={e => upd('painCallout', { ...data.painCallout!, label: e.target.value })} className={cn('block w-full bg-transparent border-b border-border focus:outline-none text-[10px] font-bold mb-1 pr-5', data.painCallout.isDestructive ? 'text-destructive' : a.calloutText)} />
                  <textarea value={data.painCallout.body} onChange={e => upd('painCallout', { ...data.painCallout!, body: e.target.value })} rows={2} className="block w-full border border-border rounded p-1 text-[10px] text-foreground leading-relaxed bg-transparent focus:outline-none resize-none" />
                </div>
              ) : (
                <button onClick={() => upd('painCallout', { label: 'Note', body: '' })} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2 py-1 mt-3 transition-colors">
                  <Add className="w-3 h-3" />Add callout
                </button>
              )}
            </>
          ) : (
            <>
              {data.painSubtitle && <HighlightedText as="p" sectionId={rid('needs')} text={data.painSubtitle} className="text-[11px] text-muted-foreground leading-relaxed mb-3" />}
              <div className="flex flex-col gap-3">
                {data.pains.map((pain, i) => (
                  <div
                    key={pain.id}
                    className="flex items-start gap-2 cursor-pointer rounded-lg p-1.5 -mx-1.5 hover:bg-shell/60 transition-colors"
                    onPointerDown={onItemPD}
                    onClick={(e) => { if (isClick(e)) setOpenViewDetailId(`pain-${pain.id}`); }}
                  >
                    <span className="w-5 h-5 rounded-full bg-destructive-faded text-destructive text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1">
                      <HighlightedText as="p" sectionId={rid('needs')} text={pain.title} className="text-[11px] font-bold text-heading leading-tight" />
                      <HighlightedText as="p" sectionId={rid('needs')} text={pain.description} className="text-[10px] text-muted-foreground leading-relaxed mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
              {data.painCallout && (
                <div className={cn('mt-3 rounded-lg border p-2.5', data.painCallout.isDestructive ? 'bg-destructive-faded border-destructive/20' : cn(a.faded, a.fadedBorder))}>
                  <HighlightedText as="p" sectionId={rid('needs')} text={data.painCallout.label} className={cn('text-[10px] font-bold mb-0.5', data.painCallout.isDestructive ? 'text-destructive' : a.calloutText)} />
                  <HighlightedText as="p" sectionId={rid('needs')} text={data.painCallout.body} className="text-[10px] text-foreground leading-relaxed" />
                </div>
              )}
            </>
          )}
        </CanvasCell>

        {/* ── Product ── */}
        <CanvasCell
          label="Product"
          question="What are we building?"
          accent={a}
          commentSectionId={productEditing ? undefined : rid('product')}
          commentSectionLabel="Product"
          editing={productEditing}
          onEdit={() => beginEdit('product')}
          onDone={() => doneEdit('product')}
          onCancel={() => cancelEdit('product')}
        >
          {productEditing ? (
            <>
              {data.productSubtitle !== undefined ? (
                <textarea value={data.productSubtitle} onChange={e => upd('productSubtitle', e.target.value)} rows={2} className="block w-full border border-border rounded-lg p-1.5 text-[11px] text-muted-foreground leading-relaxed mb-3 bg-white focus:outline-none resize-none" placeholder="Subtitle..." />
              ) : (
                <button onClick={() => upd('productSubtitle', '')} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2 py-1 mb-3 transition-colors">
                  <Add className="w-3 h-3" />Add subtitle
                </button>
              )}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePointsDragEnd}>
                <SortableContext items={data.productPoints.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-3">
                    {data.productPoints.map((point, i) => (
                      <SortableRow key={i} id={i}>
                        {({ handleProps }) => (
                          <div className="flex items-start gap-1.5">
                            <div {...handleProps} className="cursor-grab text-border hover:text-muted-foreground shrink-0 mt-1 transition-colors">
                              <DragIndicator className="w-3.5 h-3.5" />
                            </div>
                            <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5', a.bullet)}><CheckCircle className="w-3 h-3" /></div>
                            <div className="flex-1 min-w-0">
                              <input value={point.headline} onChange={e => upd('productPoints', data.productPoints.map((x, k) => k === i ? { ...x, headline: e.target.value } : x))} className="block w-full border-b border-border text-[11px] font-bold text-heading leading-tight bg-transparent focus:outline-none mb-0.5" placeholder="Headline..." />
                              <textarea value={point.detail} onChange={e => upd('productPoints', data.productPoints.map((x, k) => k === i ? { ...x, detail: e.target.value } : x))} rows={2} className="block w-full border border-border rounded p-1 text-[10px] text-muted-foreground leading-relaxed bg-white focus:outline-none resize-none mt-1" placeholder="Detail..." />
                              <button
                                onClick={() => setOpenEditDetailId(`pp-${i}`)}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-1.5 py-0.5 mt-1.5 transition-colors"
                              >
                                <AttachFile className="w-2.5 h-2.5" />
                                {getDetail(`pp-${i}`).notes || getDetail(`pp-${i}`).files.length > 0 ? 'Edit details' : 'Add details'}
                              </button>
                            </div>
                            <button onClick={() => upd('productPoints', data.productPoints.filter((_, k) => k !== i))} className="w-5 h-5 rounded-full bg-shell hover:bg-border flex items-center justify-center shrink-0 mt-0.5 border border-border">
                              <Close className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </SortableRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <button onClick={() => upd('productPoints', [...data.productPoints, { headline: '', detail: '' }])} className="flex items-center justify-center gap-1.5 border border-dashed border-border rounded-lg py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors mt-3 w-full">
                <Add className="w-3.5 h-3.5" />Add point
              </button>
              {data.productCallout ? (
                <div className={cn('mt-3 rounded-lg border p-2.5 relative', a.faded, a.fadedBorder)}>
                  <button onClick={() => upd('productCallout', undefined)} className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white hover:bg-shell flex items-center justify-center border border-border">
                    <Close className="w-2.5 h-2.5 text-muted-foreground" />
                  </button>
                  <input value={data.productCallout.label} onChange={e => upd('productCallout', { ...data.productCallout!, label: e.target.value })} className={cn('block w-full bg-transparent border-b border-border focus:outline-none text-[10px] font-bold mb-1 pr-5', a.calloutText)} />
                  <textarea value={data.productCallout.body} onChange={e => upd('productCallout', { ...data.productCallout!, body: e.target.value })} rows={2} className="block w-full bg-transparent border border-border rounded p-1 text-[10px] text-foreground leading-relaxed focus:outline-none resize-none" />
                </div>
              ) : (
                <button onClick={() => upd('productCallout', { label: 'Label', body: '' })} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2 py-1 mt-3 transition-colors">
                  <Add className="w-3 h-3" />Add callout
                </button>
              )}
            </>
          ) : (
            <>
              {data.productSubtitle && <HighlightedText as="p" sectionId={rid('product')} text={data.productSubtitle} className="text-[11px] text-muted-foreground leading-relaxed mb-3" />}
              <div className="flex flex-col gap-3">
                {data.productPoints.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 cursor-pointer rounded-lg p-1.5 -mx-1.5 hover:bg-shell/60 transition-colors"
                    onPointerDown={onItemPD}
                    onClick={(e) => { if (isClick(e)) setOpenViewDetailId(`pp-${i}`); }}
                  >
                    <div className={cn('w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5', a.bullet)}><CheckCircle className="w-3 h-3" /></div>
                    <div className="flex-1">
                      <HighlightedText as="p" sectionId={rid('product')} text={point.headline} className="text-[11px] font-bold text-heading leading-tight" />
                      <HighlightedText as="p" sectionId={rid('product')} text={point.detail} className="text-[10px] text-muted-foreground leading-relaxed mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
              {data.productCallout && (
                <div className={cn('mt-3 rounded-lg border p-2.5', a.faded, a.fadedBorder)}>
                  <HighlightedText as="p" sectionId={rid('product')} text={data.productCallout.label} className={cn('text-[10px] font-bold mb-0.5', a.calloutText)} />
                  <HighlightedText as="p" sectionId={rid('product')} text={data.productCallout.body} className="text-[10px] text-foreground leading-relaxed" />
                </div>
              )}
            </>
          )}
        </CanvasCell>

        {/* ── Business Goals ── */}
        <CanvasCell
          label="Business Goals"
          question="What does success look like?"
          accent={a}
          commentSectionId={goalsEditing ? undefined : rid('goals')}
          commentSectionLabel="Business Goals"
          editing={goalsEditing}
          onEdit={() => beginEdit('goals')}
          onDone={() => doneEdit('goals')}
          onCancel={() => cancelEdit('goals')}
        >
          {goalsEditing ? (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSuccessDragEnd}>
                <SortableContext items={data.successItems.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-3">
                    {data.successItems.map((item, i) => (
                      <SortableRow key={item.id} id={i}>
                        {({ handleProps }) => (
                          <div className="flex items-start gap-1.5">
                            <div {...handleProps} className="cursor-grab text-border hover:text-muted-foreground shrink-0 mt-1 transition-colors">
                              <DragIndicator className="w-3.5 h-3.5" />
                            </div>
                            <span className={cn('w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5', a.bullet)}>{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <input value={item.title} onChange={e => upd('successItems', data.successItems.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} className="block w-full border-b border-border text-[11px] font-bold text-heading leading-tight bg-transparent focus:outline-none mb-0.5" placeholder="Goal title..." />
                              <textarea value={item.detail} onChange={e => upd('successItems', data.successItems.map((x, k) => k === i ? { ...x, detail: e.target.value } : x))} rows={2} className="block w-full border border-border rounded p-1 text-[10px] text-muted-foreground leading-relaxed bg-white focus:outline-none resize-none mt-1" placeholder="Detail..." />
                              <button
                                onClick={() => setOpenEditDetailId(`success-${item.id}`)}
                                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-1.5 py-0.5 mt-1.5 transition-colors"
                              >
                                <AttachFile className="w-2.5 h-2.5" />
                                {getDetail(`success-${item.id}`).notes || getDetail(`success-${item.id}`).files.length > 0 ? 'Edit details' : 'Add details'}
                              </button>
                            </div>
                            <button onClick={() => upd('successItems', data.successItems.filter((_, k) => k !== i))} className="w-5 h-5 rounded-full bg-shell hover:bg-border flex items-center justify-center shrink-0 mt-0.5 border border-border">
                              <Close className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </SortableRow>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <button onClick={() => upd('successItems', [...data.successItems, { id: Date.now(), title: '', detail: '' }])} className="flex items-center justify-center gap-1.5 border border-dashed border-border rounded-lg py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors mt-3 w-full">
                <Add className="w-3.5 h-3.5" />Add goal
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {data.successItems.map((item, i) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 cursor-pointer rounded-lg p-1.5 -mx-1.5 hover:bg-shell/60 transition-colors"
                  onPointerDown={onItemPD}
                  onClick={(e) => { if (isClick(e)) setOpenViewDetailId(`success-${item.id}`); }}
                >
                  <span className={cn('w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5', a.bullet)}>{i + 1}</span>
                  <div className="flex-1">
                    <HighlightedText as="p" sectionId={rid('goals')} text={item.title} className="text-[11px] font-bold text-heading leading-tight" />
                    <HighlightedText as="p" sectionId={rid('goals')} text={item.detail} className="text-[10px] text-muted-foreground leading-relaxed mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CanvasCell>

      </div>

      {/* View side panel */}
      {openViewDetailId && viewDetailInfo && (
        <ItemDetailPanel
          title={viewDetailInfo.title}
          description={viewDetailInfo.description}
          detail={getDetail(openViewDetailId)}
          onClose={() => setOpenViewDetailId(null)}
          onEdit={() => { const id = openViewDetailId; setOpenViewDetailId(null); setOpenEditDetailId(id); }}
        />
      )}
      {/* Edit modal */}
      {openEditDetailId && editDetailInfo && (
        <ItemDetailModal
          key={openEditDetailId}
          title={editDetailInfo.title}
          description={editDetailInfo.description}
          detail={getDetail(openEditDetailId)}
          onClose={() => setOpenEditDetailId(null)}
          onChange={d => setDetail(openEditDetailId, d)}
        />
      )}
    </div>
  );
}

// ─── Column cell wrapper ──────────────────────────────────────────────────────

function CanvasCell({
  label,
  question,
  accent,
  commentSectionId,
  commentSectionLabel,
  editing = false,
  onEdit,
  onDone,
  onCancel,
  children,
}: {
  label: string;
  question: string;
  accent: typeof ACCENT[AccentVariant];
  commentSectionId?: string;
  commentSectionLabel?: string;
  editing?: boolean;
  onEdit?: () => void;
  onDone?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}) {
  const body = commentSectionId ? (
    <CommentableRegion id={commentSectionId} label={commentSectionLabel ?? label} className="p-4 flex flex-col overflow-y-auto">
      {children}
    </CommentableRegion>
  ) : (
    <div className="p-4 flex flex-col overflow-y-auto">
      {children}
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-shell shrink-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-bold uppercase tracking-widest', accent.text)}>{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 italic">{question}</p>
          </div>
          {onEdit && (
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5" onMouseUp={e => e.stopPropagation()}>
              {editing ? (
                <>
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={onDone}
                    className="flex items-center gap-0.5 px-2 py-1 rounded text-[10px] font-semibold bg-white border border-border text-heading shadow-xsmall hover:bg-shell transition-colors"
                  >
                    <Check className="w-3 h-3" />Done
                  </button>
                </>
              ) : (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-0.5 px-2 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
                >
                  <Edit className="w-3 h-3" />Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {body}
    </div>
  );
}
