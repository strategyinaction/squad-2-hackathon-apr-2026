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
  OpenInNew, PlayCircle, ImageIcon,
} from '#/icons';
import { CommentableRegion, HighlightedText, useCommentsCtx } from '#/components/CommentingSystem';

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

export interface CanvasJTBD {
  title: string;
  institutionalTemplate?: string;
  cognitiveAutomation?: string;
}

export interface CanvasPersona {
  id: string;
  label: string;
  quote: string;
  avatarUrl?: string;
  jtbds: Array<string | CanvasJTBD>;
}

function jtbdTitle(j: string | CanvasJTBD): string {
  return typeof j === 'string' ? j : j.title;
}

function jtbdHasDetails(j: string | CanvasJTBD): j is CanvasJTBD {
  return typeof j !== 'string' && !!(j.institutionalTemplate || j.cognitiveAutomation);
}

export interface CanvasPain {
  id: number;
  title: string;
  description: string;
  /** One or more persona IDs this pain belongs to; omit for all personas */
  personaIds?: string[];
}

export interface CanvasSolution {
  id: number;
  title: string;
  description: string;
  /** Pain IDs this solution addresses */
  painIds: number[];
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
  successItems: CanvasSuccess[];
  solutions: CanvasSolution[];
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
  successItems: CanvasSuccess[];
  solutions?: CanvasSolution[];
  detailedView?: boolean;
  onSaveVision?: (vision: { statement: string; detail: string; callout?: { label: string; body: string } }) => void;
  visionLoading?: boolean;
  onSavePersonas?: (personas: CanvasPersona[]) => void;
  personasLoading?: boolean;
  onSavePains?: (pains: CanvasPain[], subtitle?: string) => void;
  onSaveSolutions?: (solutions: CanvasSolution[]) => void;
  painsLoading?: boolean;
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
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('bold'); }} className="w-6 h-6 flex items-center justify-center rounded text-[16px] font-bold text-muted-foreground hover:bg-border hover:text-foreground transition-colors">B</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('italic'); }} className="w-6 h-6 flex items-center justify-center rounded text-[16px] italic text-muted-foreground hover:bg-border hover:text-foreground transition-colors">I</button>
        <div className="w-px h-3.5 bg-border mx-0.5" />
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertUnorderedList'); }} className="w-6 h-6 flex items-center justify-center rounded text-[16px] text-muted-foreground hover:bg-border hover:text-foreground transition-colors">•≡</button>
        <button type="button" onMouseDown={e => { e.preventDefault(); exec('insertOrderedList'); }} className="w-6 h-6 flex items-center justify-center rounded text-[15px] text-muted-foreground hover:bg-border hover:text-foreground transition-colors">1≡</button>
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
            <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Add Details</p>
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
                        <span className="text-[15px] text-muted-foreground shrink-0">{f.size}</span>
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
            <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Details</p>
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
              <p className="text-[15px] text-muted-foreground/70">Enter edit mode to add notes and attachments.</p>
            </div>
          ) : (
            <>
              {detail.notes && (
                <div className="mb-5">
                  <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Notes</p>
                  <div
                    className="text-xs text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_strong]:font-semibold [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: detail.notes }}
                  />
                </div>
              )}
              {detail.files.length > 0 && (
                <div>
                  <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Attachments</p>
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
                            <span className="text-[15px] text-muted-foreground shrink-0">{f.size}</span>
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
  successItems,
  solutions = [],
  detailedView = false,
  onSaveVision,
  visionLoading = false,
  onSavePersonas,
  personasLoading = false,
  onSavePains,
  onSaveSolutions,
  painsLoading = false,
}: VisionCanvasProps) {
  const commentsCtx = useCommentsCtx();
  const panelOpen = commentsCtx?.panelOpen ?? false;

  const [data, setData] = useState<CanvasData>({
    visionStatement,
    visionDetail,
    visionCallout,
    personas,
    pains,
    painSubtitle,
    painCallout,
    successItems,
    solutions,
  });

  // Sync props into state when they change (e.g. after API data loads)
  useEffect(() => {
    setData(d => ({
      ...d,
      visionStatement,
      visionDetail,
      visionCallout,
      personas,
      pains,
      painSubtitle,
      painCallout,
      successItems,
      solutions,
    }));
  }, [visionStatement, visionDetail, visionCallout, personas, pains, painSubtitle, painCallout, successItems, solutions]);

  const [activePersonas, setActivePersonas] = useState<string[]>(personas.map(p => p.id));
  const a = ACCENT[accent];

  // ── Pointer-distance click guard (prevents opening panel on text-select drag) ─
  const pdRef = useRef<{ x: number; y: number } | null>(null);
  function onItemPD(e: React.PointerEvent) { pdRef.current = { x: e.clientX, y: e.clientY }; }
  function isClick(e: React.MouseEvent) { const p = pdRef.current; return !p || Math.hypot(e.clientX - p.x, e.clientY - p.y) <= 4; }

  // ── Per-section editing states ─────────────────────────────────────────────
  const [visionEditing, setVisionEditing] = useState(initialEditing);
  const [targetEditing, setTargetEditing] = useState(initialEditing);
  const [needsEditing, setNeedsEditing] = useState(initialEditing);
  const [relieversEditing, setRelieversEditing] = useState(initialEditing);
  const [goalsEditing, setGoalsEditing] = useState(initialEditing);

  const [visionSnap, setVisionSnap] = useState<string | null>(null);
  const [targetSnap, setTargetSnap] = useState<string | null>(null);
  const [needsSnap, setNeedsSnap] = useState<string | null>(null);
  const [relieversSnap, setRelieversSnap] = useState<string | null>(null);
  const [goalsSnap, setGoalsSnap] = useState<string | null>(null);

  // ── Item details ───────────────────────────────────────────────────────────
  const [itemDetails, setItemDetails] = useState<Record<string, ItemDetailData>>({});
  const [openViewDetailId, setOpenViewDetailId] = useState<string | null>(null);
  const [openEditDetailId, setOpenEditDetailId] = useState<string | null>(null);
  const [openPersonaJTBDPanel, setOpenPersonaJTBDPanel] = useState<CanvasPersona | null>(null);
  const [openSolutionPanel, setOpenSolutionPanel] = useState<CanvasSolution | null>(null);

  // ── Pain ↔ Solution hover highlighting ────────────────────────────────────
  const [hoveredPainId, setHoveredPainId] = useState<number | null>(null);
  const [hoveredSolutionId, setHoveredSolutionId] = useState<number | null>(null);

  // ── DnD sensors ────────────────────────────────────────────────────────────
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Data helpers ───────────────────────────────────────────────────────────
  function upd<K extends keyof CanvasData>(key: K, val: CanvasData[K]) {
    setData(d => ({ ...d, [key]: val }));
  }

  // ── Edit lifecycle ─────────────────────────────────────────────────────────
  type Section = 'vision' | 'target' | 'needs' | 'relievers' | 'goals';

  function beginEdit(section: Section) {
    const snap = JSON.stringify(data);
    if (section === 'vision')    { setVisionSnap(snap);    setVisionEditing(true);    }
    if (section === 'target')    { setTargetSnap(snap);    setTargetEditing(true);    }
    if (section === 'needs')     { setNeedsSnap(snap);     setNeedsEditing(true);     }
    if (section === 'relievers') { setRelieversSnap(snap); setRelieversEditing(true); }
    if (section === 'goals')     { setGoalsSnap(snap);     setGoalsEditing(true);     }
  }

  function doneEdit(section: Section) {
    if (section === 'vision')    {
      setVisionSnap(null);    setVisionEditing(false);
      onSaveVision?.({ statement: data.visionStatement, detail: data.visionDetail, callout: data.visionCallout });
    }
    if (section === 'target') {
      setTargetSnap(null); setTargetEditing(false);
      const validIds = new Set(data.personas.map(p => p.id));
      setActivePersonas(prev => {
        const updated = prev.filter(id => validIds.has(id));
        return updated.length > 0 ? updated : data.personas.map(p => p.id);
      });
      onSavePersonas?.(data.personas);
    }
    if (section === 'needs')     { setNeedsSnap(null);     setNeedsEditing(false);     onSavePains?.(data.pains, data.painSubtitle); }
    if (section === 'relievers') { setRelieversSnap(null); setRelieversEditing(false); onSaveSolutions?.(data.solutions); }
    if (section === 'goals')     { setGoalsSnap(null);     setGoalsEditing(false);     }
  }

  function cancelEdit(section: Section) {
    const snaps: Record<Section, string | null> = { vision: visionSnap, target: targetSnap, needs: needsSnap, relievers: relieversSnap, goals: goalsSnap };
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
      const validIds = new Set(r.personas.map(p => p.id));
      setActivePersonas(prev => {
        const updated = prev.filter(id => validIds.has(id));
        return updated.length > 0 ? updated : r.personas.map(p => p.id);
      });
    }
    if (section === 'needs') {
      setData(d => ({ ...d, pains: r.pains, painSubtitle: r.painSubtitle, painCallout: r.painCallout }));
      setNeedsSnap(null); setNeedsEditing(false);
    }
    if (section === 'relievers') {
      setData(d => ({ ...d, solutions: r.solutions }));
      setRelieversSnap(null); setRelieversEditing(false);
    }
    if (section === 'goals') {
      setData(d => ({ ...d, successItems: r.successItems }));
      setGoalsSnap(null); setGoalsEditing(false);
    }
  }

  // ── Persona toggle ─────────────────────────────────────────────────────────
  function togglePersona(id: string) {
    setActivePersonas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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
  function handleSuccessDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) upd('successItems', arrayMove(data.successItems, active.id as number, over.id as number));
  }

  const rid = (name: string) => `${canvasId}-${name}`;

  // ── Filtered content ───────────────────────────────────────────────────────
  const multipleSelected = activePersonas.length > 1;
  const filteredPains = activePersonas.length === 0
    ? data.pains
    : data.pains.filter(p => !p.personaIds?.length || p.personaIds.some(id => activePersonas.includes(id)));
  const visiblePainIds = new Set(filteredPains.map(p => p.id));
  const filteredSolutions = data.solutions.filter(s => s.painIds.some(id => visiblePainIds.has(id)));

  // ── Detail resolution ──────────────────────────────────────────────────────
  function resolveDetailInfo(id: string | null): { title: string; description: string } | null {
    if (!id) return null;
    if (id.startsWith('pain-')) {
      const pain = data.pains.find(p => p.id === parseInt(id.replace('pain-', '')));
      return pain ? { title: pain.title, description: pain.description } : null;
    } else if (id.startsWith('success-')) {
      const item = data.successItems.find(s => s.id === parseInt(id.replace('success-', '')));
      return item ? { title: item.title, description: item.detail } : null;
    } else if (id.startsWith('persona-')) {
      const persona = data.personas.find(p => p.id === id.replace('persona-', ''));
      return persona ? { title: persona.label, description: persona.jtbds.map(j => jtbdTitle(j)).join('\n') } : null;
    }
    return null;
  }
  const viewDetailInfo = resolveDetailInfo(openViewDetailId);
  const editDetailInfo = resolveDetailInfo(openEditDetailId);

  return (
    <div className="rounded-xl border border-border bg-white shadow-xsmall overflow-hidden">

      {/* ── Vision row — full width ── */}
      <div className={cn('border-b border-border relative', a.faded)}>
        {visionLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {!panelOpen && (
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
        )}

        {visionEditing ? (
          <div className="px-6 py-5">
            <p className={cn('text-[15px] font-bold uppercase tracking-widest mb-2', a.text)}>Vision</p>
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
            <p className={cn('text-[15px] font-bold uppercase tracking-widest mb-2', a.text)}>Vision</p>
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

      {/* ── Target Group — full width horizontal ── */}
      <div className="border-b border-border relative">
        {personasLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        <div className="px-4 py-3 border-b border-border bg-shell flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-bold uppercase tracking-widest', a.text)}>Target Group</p>
            <p className="text-[16px] text-muted-foreground mt-0.5 italic">Who are we building for?</p>
          </div>
          {!panelOpen && (
            <div className="flex items-center gap-0.5 shrink-0" onMouseUp={e => e.stopPropagation()}>
              {targetEditing ? (
                <>
                  <button
                    onClick={() => cancelEdit('target')}
                    className="px-2 py-1 rounded text-[15px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => doneEdit('target')}
                    className="flex items-center gap-0.5 px-2 py-1 rounded text-[15px] font-semibold bg-white border border-border text-heading shadow-xsmall hover:bg-shell transition-colors"
                  >
                    <Check className="w-3 h-3" />Done
                  </button>
                </>
              ) : (
                <button
                  onClick={() => beginEdit('target')}
                  className="flex items-center gap-0.5 px-2 py-1 rounded text-[15px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
                >
                  <Edit className="w-3 h-3" />Edit
                </button>
              )}
            </div>
          )}
        </div>

        {targetEditing ? (
          <div className="p-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handlePersonasDragEnd}>
              <SortableContext items={data.personas.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-2 gap-3">
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
                              className="flex-1 border-b border-border text-[16px] font-bold text-heading bg-transparent focus:outline-none"
                              placeholder="Persona name"
                            />
                            <button onClick={() => upd('personas', data.personas.filter((_, i) => i !== pi))} className="w-5 h-5 rounded-full bg-white hover:bg-shell flex items-center justify-center border border-border shrink-0">
                              <Close className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                          </div>
                          <textarea value={p.quote} onChange={e => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, quote: e.target.value } : x))} rows={2} className="block w-full border border-border rounded p-1.5 text-[15px] italic text-foreground leading-relaxed mb-2 bg-white focus:outline-none resize-none" placeholder="Representative quote..." />
                          <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Jobs to be done</p>
                          {p.jtbds.map((jtbd, ji) => (
                            <div key={ji} className="flex items-center gap-1 mb-1">
                              <input value={jtbdTitle(jtbd)} onChange={e => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, jtbds: x.jtbds.map((j, k) => k === ji ? (typeof j === 'string' ? e.target.value : { ...j, title: e.target.value }) : j) } : x))} className="flex-1 border-b border-border text-[15px] text-foreground bg-transparent focus:outline-none py-0.5" placeholder="Job to be done..." />
                              <button onClick={() => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, jtbds: x.jtbds.filter((_, k) => k !== ji) } : x))} className="w-4 h-4 rounded-full bg-shell hover:bg-border flex items-center justify-center shrink-0">
                                <Close className="w-2.5 h-2.5 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => upd('personas', data.personas.map((x, i) => i === pi ? { ...x, jtbds: [...x.jtbds, ''] } : x))} className={cn('flex items-center gap-1 text-[15px] hover:opacity-80 mt-2 transition-colors', a.text)}>
                            <Add className="w-3 h-3" />Add JTBD
                          </button>
                          <button
                            onClick={() => setOpenEditDetailId(`persona-${p.id}`)}
                            className="flex items-center justify-center gap-1 text-[15px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2 py-1 mt-2 w-full transition-colors"
                          >
                            <AttachFile className="w-3 h-3" />
                            {getDetail(`persona-${p.id}`).notes || getDetail(`persona-${p.id}`).files.length > 0 ? 'Edit details' : 'Add details / attachment'}
                          </button>
                        </div>
                      )}
                    </SortableRow>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <button onClick={() => upd('personas', [...data.personas, { id: Date.now().toString(), label: 'New Persona', quote: '', jtbds: [] }])} className="flex items-center justify-center gap-1.5 border border-dashed border-border rounded-lg py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors mt-3 w-full">
              <Add className="w-3.5 h-3.5" />Add persona
            </button>
          </div>
        ) : (
          <CommentableRegion id={rid('target-group')} label="Target Group" className="px-4 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${data.personas.length}, 1fr)` }}>
              {data.personas.map(p => {
                const isActive = activePersonas.includes(p.id);
                return (
                  <CommentableRegion key={p.id} id={rid(`persona-${p.id}`)} label={p.label} className="rounded-xl">
                    <div
                      className={cn(
                        'rounded-xl border p-4 cursor-pointer transition-all',
                        isActive
                          ? cn('border-2', a.fadedBorder, a.faded)
                          : 'border border-border bg-shell/30 opacity-50 hover:opacity-75'
                      )}
                      onClick={() => togglePersona(p.id)}
                      onPointerDown={onItemPD}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {p.avatarUrl && (
                          <img
                            src={p.avatarUrl}
                            alt={p.label}
                            className="w-14 h-14 rounded-full object-cover object-top shrink-0 border-2 border-white shadow-small"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-bold leading-tight', isActive ? a.text : 'text-muted-foreground')}>{p.label}</p>
                        </div>
                      </div>
                      <HighlightedText
                        as="p"
                        sectionId={rid('target-group')}
                        text={p.quote}
                        className={cn('text-xs italic leading-relaxed border-l-2 pl-3', isActive ? cn('text-foreground', a.quoteBorder) : 'text-muted-foreground border-border')}
                      />
                      {!panelOpen && p.jtbds.length > 0 && (
                        <button
                          onClick={e => { e.stopPropagation(); setOpenPersonaJTBDPanel(p); }}
                          className={cn(
                            'flex items-center gap-1 mt-3 text-[14px] font-semibold px-2 py-1 rounded-md transition-colors w-full justify-center',
                            isActive
                              ? cn(a.faded, a.text, 'hover:opacity-80 border border-transparent')
                              : 'bg-shell/60 text-muted-foreground hover:bg-shell border border-border/50'
                          )}
                        >
                          Jobs to be done
                          <ChevronRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </CommentableRegion>
                );
              })}
            </div>
          </CommentableRegion>
        )}
      </div>

      {/* ── Pains | Pain Relievers — 50/50 ── */}
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border relative">
        {painsLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* ── Pains ── */}
        <CanvasCell
          label="Pains"
          question="What problems are we solving?"
          accent={a}
          commentSectionId={needsEditing ? undefined : rid('pains')}
          commentSectionLabel="Pains"
          editing={needsEditing}
          onEdit={() => beginEdit('needs')}
          onDone={() => doneEdit('needs')}
          onCancel={() => cancelEdit('needs')}
        >
          {needsEditing ? (
            <>
              {data.painSubtitle !== undefined ? (
                <textarea value={data.painSubtitle} onChange={e => upd('painSubtitle', e.target.value)} rows={2} className="block w-full border border-border rounded-lg p-1.5 text-[16px] text-muted-foreground leading-relaxed mb-3 bg-white focus:outline-none resize-none" placeholder="Subtitle..." />
              ) : (
                <button onClick={() => upd('painSubtitle', '')} className="flex items-center gap-1 text-[15px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2 py-1 mb-3 transition-colors">
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
                            <span className="w-5 h-5 rounded-full bg-destructive-faded text-destructive text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <input value={pain.title} onChange={e => upd('pains', data.pains.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} className="block w-full border-b border-border text-[16px] font-bold text-heading leading-tight bg-transparent focus:outline-none mb-0.5" placeholder="Pain title..." />
                              <textarea value={pain.description} onChange={e => upd('pains', data.pains.map((x, k) => k === i ? { ...x, description: e.target.value } : x))} rows={2} className="block w-full border border-border rounded p-1 text-[15px] text-muted-foreground leading-relaxed bg-white focus:outline-none resize-none mt-1" placeholder="Description..." />
                              {/* Persona attribution — multi-toggle */}
                              <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                <span className="text-[15px] text-muted-foreground shrink-0">Users:</span>
                                {data.personas.map(pers => {
                                  const sel = (pain.personaIds ?? []).includes(pers.id);
                                  return (
                                    <button
                                      key={pers.id}
                                      type="button"
                                      onClick={() => upd('pains', data.pains.map((x, k) => k === i ? {
                                        ...x,
                                        personaIds: sel
                                          ? (x.personaIds ?? []).filter(id => id !== pers.id)
                                          : [...(x.personaIds ?? []), pers.id],
                                      } : x))}
                                      className={cn(
                                        'text-[14px] font-semibold px-1.5 py-0.5 rounded-full transition-colors border',
                                        sel ? cn(a.bullet, 'border-transparent') : 'bg-shell text-muted-foreground border-border',
                                      )}
                                    >
                                      {pers.label}
                                    </button>
                                  );
                                })}
                              </div>
                              <button
                                onClick={() => setOpenEditDetailId(`pain-${pain.id}`)}
                                className="flex items-center gap-1 text-[15px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-1.5 py-0.5 mt-1.5 transition-colors"
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
                <Add className="w-3.5 h-3.5" />Add pain
              </button>
              {data.painCallout ? (
                <div className={cn('mt-3 rounded-lg border p-2.5 relative bg-shell border-border')}>
                  <button onClick={() => upd('painCallout', undefined)} className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white hover:bg-border flex items-center justify-center border border-border">
                    <Close className="w-2.5 h-2.5 text-muted-foreground" />
                  </button>
                  <input value={data.painCallout.label} onChange={e => upd('painCallout', { ...data.painCallout!, label: e.target.value })} className={cn('block w-full bg-transparent border-b border-border focus:outline-none text-[15px] font-bold mb-1 pr-5', data.painCallout.isDestructive ? 'text-destructive' : a.calloutText)} />
                  <textarea value={data.painCallout.body} onChange={e => upd('painCallout', { ...data.painCallout!, body: e.target.value })} rows={2} className="block w-full border border-border rounded p-1 text-[15px] text-foreground leading-relaxed bg-transparent focus:outline-none resize-none" />
                </div>
              ) : (
                <button onClick={() => upd('painCallout', { label: 'Note', body: '' })} className="flex items-center gap-1 text-[15px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2 py-1 mt-3 transition-colors">
                  <Add className="w-3 h-3" />Add callout
                </button>
              )}
            </>
          ) : (
            <>
              {data.painSubtitle && <HighlightedText as="p" sectionId={rid('pains')} text={data.painSubtitle} className="text-xs text-muted-foreground leading-relaxed mb-3" />}
              {filteredPains.length === 0 ? (
                <p className="text-[16px] text-muted-foreground italic">
                  {activePersonas.length === 0 ? 'Select a user above to see their pains.' : 'No pains for the selected users.'}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredPains.map((pain, i) => {
                    const painPersonas = pain.personaIds?.length
                      ? data.personas.filter(p => pain.personaIds!.includes(p.id))
                      : [];
                    const isSolutionHovered = hoveredSolutionId !== null &&
                      data.solutions.find(s => s.id === hoveredSolutionId)?.painIds.includes(pain.id);
                    return (
                      <CommentableRegion key={pain.id} id={rid(`pain-${pain.id}`)} label={pain.title} className="rounded-lg">
                        <div
                          className={cn(
                            'flex items-start gap-2 cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-all duration-200',
                            isSolutionHovered
                              ? 'bg-primary/10 ring-2 ring-inset ring-primary/40 shadow-sm'
                              : hoveredPainId === pain.id
                                ? 'bg-shell ring-1 ring-inset ring-border shadow-sm'
                                : 'hover:bg-shell ring-1 ring-inset hover:ring-border ring-transparent hover:shadow-sm',
                          )}
                          onPointerDown={onItemPD}
                          onClick={(e) => { if (isClick(e)) setOpenViewDetailId(`pain-${pain.id}`); }}
                          onMouseEnter={() => { if (!panelOpen) setHoveredPainId(pain.id); }}
                          onMouseLeave={() => setHoveredPainId(null)}
                        >
                          <span className="w-5 h-5 rounded-full bg-destructive-faded text-destructive text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                              <HighlightedText as="p" sectionId={rid('pains')} text={pain.title} className="text-xs font-bold text-heading leading-tight flex-1" />
                              {multipleSelected && painPersonas.map(pers => (
                                <span key={pers.id} className={cn('text-[14px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap', a.bullet)}>
                                  {pers.label}
                                </span>
                              ))}
                            </div>
                            {detailedView && <HighlightedText as="p" sectionId={rid('pains')} text={pain.description} className="text-[16px] text-muted-foreground leading-relaxed mt-0.5" />}
                          </div>
                        </div>
                      </CommentableRegion>
                    );
                  })}
                </div>
              )}
              {data.painCallout && (
                <div className={cn('mt-3 rounded-lg border p-2.5', data.painCallout.isDestructive ? 'bg-destructive-faded border-destructive/20' : cn(a.faded, a.fadedBorder))}>
                  <HighlightedText as="p" sectionId={rid('pains')} text={data.painCallout.label} className={cn('text-[16px] font-bold mb-0.5', data.painCallout.isDestructive ? 'text-destructive' : a.calloutText)} />
                  <HighlightedText as="p" sectionId={rid('pains')} text={data.painCallout.body} className="text-[16px] text-foreground leading-relaxed" />
                </div>
              )}
            </>
          )}
        </CanvasCell>

        {/* ── Pain Relievers ── */}
        <CanvasCell
          label="Pain Relievers"
          question="How does the platform solve each pain?"
          accent={a}
          commentSectionId={relieversEditing ? undefined : rid('relievers')}
          commentSectionLabel="Pain Relievers"
          editing={relieversEditing}
          onEdit={() => beginEdit('relievers')}
          onDone={() => doneEdit('relievers')}
          onCancel={() => cancelEdit('relievers')}
        >
          {relieversEditing ? (
            <div className="flex flex-col gap-3">
              {data.solutions.map((sol, i) => (
                <div key={sol.id} className="rounded-lg border border-border bg-shell/30 p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <input
                      value={sol.title}
                      onChange={e => upd('solutions', data.solutions.map((x, k) => k === i ? { ...x, title: e.target.value } : x))}
                      className="flex-1 border-b border-border text-[16px] font-bold text-heading bg-transparent focus:outline-none"
                      placeholder="Solution title..."
                    />
                    <button
                      onClick={() => upd('solutions', data.solutions.filter((_, k) => k !== i))}
                      className="w-5 h-5 rounded-full bg-white hover:bg-shell flex items-center justify-center border border-border shrink-0"
                    >
                      <Close className="w-2.5 h-2.5 text-muted-foreground" />
                    </button>
                  </div>
                  <textarea
                    value={sol.description}
                    onChange={e => upd('solutions', data.solutions.map((x, k) => k === i ? { ...x, description: e.target.value } : x))}
                    rows={2}
                    className="block w-full border border-border rounded p-1 text-[15px] text-muted-foreground leading-relaxed bg-white focus:outline-none resize-none mb-2"
                    placeholder="How this addresses the pain..."
                  />
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[15px] text-muted-foreground shrink-0">Addresses:</span>
                    {data.pains.map(pain => {
                      const linked = sol.painIds.includes(pain.id);
                      return (
                        <button
                          key={pain.id}
                          type="button"
                          onClick={() => upd('solutions', data.solutions.map((x, k) => k === i ? {
                            ...x,
                            painIds: linked ? x.painIds.filter(id => id !== pain.id) : [...x.painIds, pain.id],
                          } : x))}
                          className={cn(
                            'text-[14px] font-semibold px-1.5 py-0.5 rounded-full transition-colors border',
                            linked ? 'bg-destructive-faded text-destructive border-transparent' : 'bg-shell text-muted-foreground border-border',
                          )}
                        >
                          {pain.title || `Pain ${pain.id}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button
                onClick={() => upd('solutions', [...data.solutions, { id: Date.now(), title: '', description: '', painIds: [] }])}
                className="flex items-center justify-center gap-1.5 border border-dashed border-border rounded-lg py-2 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors w-full"
              >
                <Add className="w-3.5 h-3.5" />Add solution
              </button>
            </div>
          ) : filteredSolutions.length === 0 ? (
            <p className="text-[16px] text-muted-foreground italic">
              {data.solutions.length === 0
                ? 'No pain relievers defined yet. Enter edit mode to add them.'
                : 'No pain relievers for the selected users.'}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSolutions.map((sol, i) => {
                const isPainHovered = hoveredPainId !== null && sol.painIds.includes(hoveredPainId);
                return (
                  <CommentableRegion key={sol.id} id={rid(`solution-${sol.id}`)} label={sol.title} className="rounded-lg">
                    <div
                      className={cn(
                        'flex items-start gap-2 cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-all duration-200',
                        isPainHovered
                          ? 'bg-primary/10 ring-2 ring-inset ring-primary/40 shadow-sm'
                          : hoveredSolutionId === sol.id
                            ? 'bg-shell ring-1 ring-inset ring-border shadow-sm'
                            : 'hover:bg-shell ring-1 ring-inset hover:ring-border ring-transparent hover:shadow-sm',
                      )}
                      onPointerDown={onItemPD}
                      onClick={(e) => { if (isClick(e)) setOpenSolutionPanel(sol); }}
                      onMouseEnter={() => { if (!panelOpen) setHoveredSolutionId(sol.id); }}
                      onMouseLeave={() => setHoveredSolutionId(null)}
                    >
                      <span className={cn('w-5 h-5 rounded-full text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5', a.bullet)}>{i + 1}</span>
                      <div className="flex-1">
                        <HighlightedText as="p" sectionId={rid('relievers')} text={sol.title} className="text-xs font-bold text-heading leading-tight" />
                        {detailedView && <HighlightedText as="p" sectionId={rid('relievers')} text={sol.description} className="text-[16px] text-muted-foreground leading-relaxed mt-0.5" />}
                        {sol.painIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {sol.painIds.map(pid => {
                              const pain = data.pains.find(p => p.id === pid);
                              if (!pain) return null;
                              return (
                                <span
                                  key={pid}
                                  className="text-[14px] font-medium px-1.5 py-0.5 rounded-full bg-destructive-faded text-destructive"
                                >
                                  {pain.title}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommentableRegion>
                );
              })}
            </div>
          )}
        </CanvasCell>

      </div>

      {/* ── What success looks like — full width ── */}
      <div>
        <div className="px-4 py-3 border-b border-border bg-shell flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-bold uppercase tracking-widest', a.text)}>What success looks like</p>
            <p className="text-[16px] text-muted-foreground mt-0.5 italic">What outcomes will we have achieved?</p>
          </div>
          {!panelOpen && (
            <div className="flex items-center gap-0.5 shrink-0" onMouseUp={e => e.stopPropagation()}>
              {goalsEditing ? (
                <>
                  <button
                    onClick={() => cancelEdit('goals')}
                    className="px-2 py-1 rounded text-[15px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => doneEdit('goals')}
                    className="flex items-center gap-0.5 px-2 py-1 rounded text-[15px] font-semibold bg-white border border-border text-heading shadow-xsmall hover:bg-shell transition-colors"
                  >
                    <Check className="w-3 h-3" />Done
                  </button>
                </>
              ) : (
                <button
                  onClick={() => beginEdit('goals')}
                  className="flex items-center gap-0.5 px-2 py-1 rounded text-[15px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
                >
                  <Edit className="w-3 h-3" />Edit
                </button>
              )}
            </div>
          )}
        </div>

        {goalsEditing ? (
          <div className="p-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSuccessDragEnd}>
              <SortableContext items={data.successItems.map((_, i) => i)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-2 gap-3">
                  {data.successItems.map((item, i) => (
                    <SortableRow key={item.id} id={i}>
                      {({ handleProps }) => (
                        <div className="flex items-start gap-1.5">
                          <div {...handleProps} className="cursor-grab text-border hover:text-muted-foreground shrink-0 mt-1 transition-colors">
                            <DragIndicator className="w-3.5 h-3.5" />
                          </div>
                          <span className={cn('w-5 h-5 rounded-full text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5', a.bullet)}>{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <input value={item.title} onChange={e => upd('successItems', data.successItems.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} className="block w-full border-b border-border text-[16px] font-bold text-heading leading-tight bg-transparent focus:outline-none mb-0.5" placeholder="Success title..." />
                            <textarea value={item.detail} onChange={e => upd('successItems', data.successItems.map((x, k) => k === i ? { ...x, detail: e.target.value } : x))} rows={2} className="block w-full border border-border rounded p-1 text-[15px] text-muted-foreground leading-relaxed bg-white focus:outline-none resize-none mt-1" placeholder="Detail..." />
                            <button
                              onClick={() => setOpenEditDetailId(`success-${item.id}`)}
                              className="flex items-center gap-1 text-[15px] text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-1.5 py-0.5 mt-1.5 transition-colors"
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
              <Add className="w-3.5 h-3.5" />Add success criterion
            </button>
          </div>
        ) : (
          <CommentableRegion id={rid('success')} label="What success looks like" className="p-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {data.successItems.map((item, i) => (
                <CommentableRegion key={item.id} id={rid(`success-item-${item.id}`)} label={item.title} className="rounded-lg">
                  <div
                    className="flex items-start gap-2 cursor-pointer rounded-lg p-1.5 -mx-1.5 hover:bg-shell/60 transition-colors"
                    onPointerDown={onItemPD}
                    onClick={(e) => { if (isClick(e)) setOpenViewDetailId(`success-${item.id}`); }}
                  >
                    <span className={cn('w-5 h-5 rounded-full text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5', a.bullet)}>{i + 1}</span>
                    <div className="flex-1">
                      <HighlightedText as="p" sectionId={rid('success')} text={item.title} className="text-xs font-bold text-heading leading-tight" />
                      {detailedView && <HighlightedText as="p" sectionId={rid('success')} text={item.detail} className="text-[16px] text-muted-foreground leading-relaxed mt-0.5" />}
                    </div>
                  </div>
                </CommentableRegion>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <CheckCircle className={cn('w-4 h-4 shrink-0', a.text)} />
              <p className={cn('text-[15px] font-semibold', a.text)}>{data.successItems.length} success criteria defined</p>
            </div>
          </CommentableRegion>
        )}
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
      {/* Persona JTBD panel */}
      {openPersonaJTBDPanel && (
        <PersonaJTBDPanel
          accent={a}
          persona={openPersonaJTBDPanel}
          onClose={() => setOpenPersonaJTBDPanel(null)}
        />
      )}
      {/* Solution detail panel */}
      {openSolutionPanel && (
        <SolutionDetailPanel
          accent={a}
          solution={openSolutionPanel}
          pains={data.pains}
          onClose={() => setOpenSolutionPanel(null)}
        />
      )}
    </div>
  );
}

// ─── Solution Detail Panel ────────────────────────────────────────────────────

function SolutionDetailPanel({
  accent,
  solution,
  pains,
  onClose,
}: {
  accent: typeof ACCENT[AccentVariant];
  solution: CanvasSolution;
  pains: CanvasPain[];
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);

  const linkedPains = pains.filter(p => solution.painIds.includes(p.id));

  return createPortal(
    <>
      <div
        className={cn('fixed inset-0 z-[1500] bg-black/10 transition-opacity duration-300', mounted ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div className={cn('fixed right-0 top-0 h-full w-[480px] bg-white shadow-large z-[1501] flex flex-col border-l border-border transition-transform duration-300 ease-out', mounted ? 'translate-x-0' : 'translate-x-full')}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-[15px] font-bold uppercase tracking-widest flex-1', accent.text)}>Pain Reliever</span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-shell transition-colors">
              <Close className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-sm font-bold text-heading leading-snug">{solution.title}</h3>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Description */}
          {solution.description && (
            <div>
              <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</p>
              <p className="text-xs text-foreground leading-relaxed">{solution.description}</p>
            </div>
          )}

          {/* Linked pains */}
          {linkedPains.length > 0 && (
            <div>
              <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Addresses</p>
              <div className="flex flex-wrap gap-1.5">
                {linkedPains.map(pain => (
                  <span key={pain.id} className="text-[15px] font-medium px-2 py-1 rounded-full bg-destructive-faded text-destructive">
                    {pain.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Screenshot placeholder */}
          <div>
            <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Screenshot</p>
            <div className="rounded-lg border border-border bg-shell overflow-hidden">
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <p className="text-[16px]">Feature screenshot placeholder</p>
                <p className="text-[15px] text-muted-foreground/60">1280 × 720</p>
              </div>
            </div>
          </div>

          {/* Link */}
          <div>
            <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Link</p>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-shell px-3 py-2.5">
              <OpenInNew className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-heading truncate">View feature documentation</p>
                <p className="text-[15px] text-muted-foreground truncate">https://docs.example.com/features/{solution.id}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </div>
          </div>

          {/* Video placeholder */}
          <div>
            <p className="text-[15px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Video</p>
            <div className="rounded-lg border border-border bg-black/5 overflow-hidden">
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <PlayCircle className="w-10 h-10 opacity-40" />
                <p className="text-[16px]">Feature walkthrough video</p>
                <p className="text-[15px] text-muted-foreground/60">2:34 · MP4</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── Persona JTBD panel ───────────────────────────────────────────────────────

function PersonaJTBDPanel({
  accent,
  persona,
  onClose,
}: {
  accent: typeof ACCENT[AccentVariant];
  persona: CanvasPersona;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);

  return createPortal(
    <>
      <div
        className={cn('fixed inset-0 z-[1500] bg-black/10 transition-opacity duration-300', mounted ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div className={cn('fixed right-0 top-0 h-full w-[480px] bg-white shadow-large z-[1501] flex flex-col border-l border-border transition-transform duration-300 ease-out', mounted ? 'translate-x-0' : 'translate-x-full')}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2 mb-2">
            {persona.avatarUrl && (
              <img src={persona.avatarUrl} alt={persona.label} className="w-6 h-6 rounded-full object-cover object-top shrink-0" />
            )}
            <span className={cn('text-[15px] font-bold uppercase tracking-widest flex-1', accent.text)}>{persona.label}</span>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-shell transition-colors">
              <Close className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm font-bold text-heading">Jobs to be Done</p>
          <p className="text-[15px] text-muted-foreground mt-0.5">{persona.jtbds.length} job{persona.jtbds.length !== 1 ? 's' : ''} listed · click to expand</p>
        </div>

        {/* Accordion list */}
        <div className="flex-1 overflow-y-auto">
          {persona.jtbds.map((jtbd, i) => {
            const hasDetails = jtbdHasDetails(jtbd);
            const isExpanded = expandedIdx === i;
            return (
              <div key={i} className="border-b border-border last:border-b-0">
                <button
                  onClick={() => hasDetails && setExpandedIdx(isExpanded ? null : i)}
                  className={cn(
                    'w-full flex items-start gap-2.5 px-5 py-3.5 text-left transition-colors',
                    hasDetails ? 'hover:bg-shell cursor-pointer' : 'cursor-default',
                  )}
                >
                  <ChevronRight
                    className={cn(
                      'w-3.5 h-3.5 mt-0.5 shrink-0 transition-transform duration-200',
                      accent.text,
                      isExpanded && 'rotate-90',
                    )}
                  />
                  <span className={cn('text-xs leading-snug flex-1', hasDetails ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                    {jtbdTitle(jtbd)}
                  </span>
                </button>
                {isExpanded && hasDetails && (
                  <div className="px-10 pb-4 flex flex-col gap-4">
                    {(jtbd as CanvasJTBD).institutionalTemplate && (
                      <div>
                        <p className={cn('text-[14px] font-bold uppercase tracking-widest mb-2', accent.text)}>Institutional Template</p>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{(jtbd as CanvasJTBD).institutionalTemplate}</p>
                      </div>
                    )}
                    {(jtbd as CanvasJTBD).cognitiveAutomation && (
                      <div>
                        <p className={cn('text-[14px] font-bold uppercase tracking-widest mb-2', accent.text)}>Cognitive Automation (AI)</p>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{(jtbd as CanvasJTBD).cognitiveAutomation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>,
    document.body,
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
  const canvasCtx = useCommentsCtx();
  const cellPanelOpen = canvasCtx?.panelOpen ?? false;

  const body = commentSectionId ? (
    <CommentableRegion id={commentSectionId} label={commentSectionLabel ?? label} className="p-4 flex flex-col overflow-y-auto min-h-[180px]">
      {children}
    </CommentableRegion>
  ) : (
    <div className="p-4 flex flex-col overflow-y-auto min-h-[180px]">
      {children}
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-shell shrink-0">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-bold uppercase tracking-widest', accent.text)}>{label}</p>
            <p className="text-[16px] text-muted-foreground mt-0.5 italic">{question}</p>
          </div>
          {onEdit && !cellPanelOpen && (
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5" onMouseUp={e => e.stopPropagation()}>
              {editing ? (
                <>
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="px-2 py-1 rounded text-[15px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={onDone}
                    className="flex items-center gap-0.5 px-2 py-1 rounded text-[15px] font-semibold bg-white border border-border text-heading shadow-xsmall hover:bg-shell transition-colors"
                  >
                    <Check className="w-3 h-3" />Done
                  </button>
                </>
              ) : (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-0.5 px-2 py-1 rounded text-[15px] text-muted-foreground hover:text-foreground hover:bg-white/80 transition-colors"
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
