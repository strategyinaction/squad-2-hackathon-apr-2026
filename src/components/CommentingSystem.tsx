/**
 * Inline commenting system — Google Docs / Figma style.
 *
 * Usage:
 *   1. Wrap a page with <CommentProvider>
 *   2. Wrap commentable sections with <CommentableRegion id="..." label="...">
 *   3. Replace text nodes with <HighlightedText as="p" text={...} sectionId="..." className="..." />
 *   4. Add <CommentsPanel /> as a sibling to the page content
 *   5. Add <CommentsToggleButton /> in PageHeader actions
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '#/lib/utils';
import { AttachFile, CheckCircle, ChevronRight, Close, ModeComment, ThumbUp } from '#/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommentType = 'idea' | 'feedback' | 'challenge' | 'question';

const COMMENT_TYPES: Array<{ type: CommentType; label: string; activeCls: string }> = [
  { type: 'idea',      label: 'Idea',      activeCls: 'bg-primary text-white border-primary' },
  { type: 'feedback',  label: 'Feedback',  activeCls: 'bg-warning text-white border-warning' },
  { type: 'challenge', label: 'Challenge', activeCls: 'bg-destructive text-white border-destructive' },
  { type: 'question',  label: 'Question',  activeCls: 'bg-muted text-heading border-border' },
];

const TYPE_BADGE: Record<CommentType, { bg: string; text: string }> = {
  idea:      { bg: 'bg-primary-faded',         text: 'text-primary' },
  feedback:  { bg: 'bg-warning-faded',         text: 'text-warning' },
  challenge: { bg: 'bg-destructive-faded',     text: 'text-destructive' },
  question:  { bg: 'bg-muted',                 text: 'text-muted-foreground' },
};

interface Attachment {
  id: string;
  name: string;
  size: string;
}

export interface Comment {
  id: string;
  type: CommentType;
  sectionId: string;
  sectionLabel: string;
  selectedText: string;
  body: string;
  author: string;
  initials: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  resolved: boolean;
  attachments: Attachment[];
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CommentsCtx {
  comments: Comment[];
  addComment: (data: Omit<Comment, 'id' | 'likes' | 'liked' | 'resolved'>) => void;
  editComment: (id: string, body: string) => void;
  likeComment: (id: string) => void;
  resolveComment: (id: string) => void;
  activeHighlight: string | null;
  setActiveHighlight: (t: string | null) => void;
  activeRegionId: string | null;
  setActiveRegionId: (id: string | null) => void;
  panelOpen: boolean;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  typeFilter: CommentType | 'all';
  setTypeFilter: React.Dispatch<React.SetStateAction<CommentType | 'all'>>;
}

const CommentsContext = createContext<CommentsCtx | null>(null);

export function CommentProvider({
  children,
  initialPanelOpen = false,
  initialTypeFilter = 'all',
  initialComments = [],
}: {
  children: React.ReactNode;
  initialPanelOpen?: boolean;
  initialTypeFilter?: CommentType | 'all';
  initialComments?: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(initialPanelOpen);
  const [typeFilter, setTypeFilter] = useState<CommentType | 'all'>(initialTypeFilter);

  const addComment = useCallback((data: Omit<Comment, 'id' | 'likes' | 'liked' | 'resolved'>) => {
    setComments(p => [{ ...data, id: Date.now().toString(), likes: 0, liked: false, resolved: false }, ...p]);
    setPanelOpen(true); // Auto-open panel when a comment is added
  }, []);

  const editComment = useCallback((id: string, body: string) => {
    setComments(p => p.map(c => c.id === id ? { ...c, body } : c));
  }, []);

  const likeComment = useCallback((id: string) => {
    setComments(p => p.map(c => c.id === id ? { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked } : c));
  }, []);

  const resolveComment = useCallback((id: string) => {
    setComments(p => p.map(c => c.id === id ? { ...c, resolved: true } : c));
  }, []);

  return (
    <CommentsContext.Provider value={{ comments, addComment, editComment, likeComment, resolveComment, activeHighlight, setActiveHighlight, activeRegionId, setActiveRegionId, panelOpen, setPanelOpen, typeFilter, setTypeFilter }}>
      {children}
    </CommentsContext.Provider>
  );
}

export function useCommentsCtx() {
  return useContext(CommentsContext);
}

export function useComments(): CommentsCtx {
  const ctx = useContext(CommentsContext);
  if (!ctx) throw new Error('useComments used outside CommentProvider');
  return ctx;
}

// ─── CommentsToggleButton ─────────────────────────────────────────────────────
// Place in PageHeader actions prop — must be inside CommentProvider.

export function CommentsToggleButton() {
  const { comments, panelOpen, setPanelOpen } = useComments();
  const openCount = comments.filter(c => !c.resolved).length;
  return (
    <button
      onClick={() => setPanelOpen(p => !p)}
      className={cn(
        'flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors shrink-0',
        panelOpen
          ? 'bg-primary-faded border-primary/20 text-primary'
          : 'bg-white border-border text-foreground hover:bg-shell',
      )}
    >
      <ModeComment className="w-3.5 h-3.5 text-primary" />
      Comments
      {openCount > 0 && (
        <span className="w-4 h-4 rounded-full bg-primary text-white text-[14px] font-bold flex items-center justify-center leading-none shrink-0">
          {openCount}
        </span>
      )}
    </button>
  );
}

// ─── HighlightedText ──────────────────────────────────────────────────────────
// Drop-in replacement for <p>, <span>, <h3>, etc. — highlights matching comment selections.

type HTag = 'span' | 'p' | 'h3' | 'h4';

export function HighlightedText({
  text,
  sectionId,
  as: Tag = 'span',
  className,
}: {
  text: string;
  sectionId: string;
  as?: HTag;
  className?: string;
}) {
  const ctx = useContext(CommentsContext);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const cls = cn('whitespace-pre-wrap', className);

  if (!ctx) return <Tag className={cls}>{text}</Tag>;

  const { comments, activeHighlight, setActiveHighlight } = ctx;
  const relevant = comments.filter(c => !c.resolved && c.sectionId === sectionId && c.selectedText && text.includes(c.selectedText));
  if (relevant.length === 0) return <Tag className={cls}>{text}</Tag>;

  // Build non-overlapping highlight segments, sorted by first occurrence
  const sorted = relevant
    .map(c => ({ id: c.id, sel: c.selectedText, start: text.indexOf(c.selectedText) }))
    .filter(h => h.start >= 0)
    .sort((a, b) => a.start - b.start);

  type Seg = { text: string; highlight?: { id: string; sel: string } };
  const segs: Seg[] = [];
  let cursor = 0;
  for (const h of sorted) {
    if (h.start < cursor) continue;
    if (h.start > cursor) segs.push({ text: text.slice(cursor, h.start) });
    segs.push({ text: h.sel, highlight: { id: h.id, sel: h.sel } });
    cursor = h.start + h.sel.length;
  }
  if (cursor < text.length) segs.push({ text: text.slice(cursor) });

  const hoveredComment = hoveredId ? comments.find(c => c.id === hoveredId) : null;

  function scheduleHide() {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setHoveredId(null);
      setTooltipRect(null);
      setActiveHighlight(null);
    }, 150);
  }

  function cancelHide() {
    clearTimeout(hideTimer.current);
  }

  const tooltip =
    hoveredComment && tooltipRect
      ? createPortal(
          <CommentTooltip
            comment={hoveredComment}
            rect={tooltipRect}
            onMouseEnter={cancelHide}
            onMouseLeave={scheduleHide}
            onLike={() => ctx.likeComment(hoveredComment.id)}
            onResolve={() => ctx.resolveComment(hoveredComment.id)}
          />,
          document.body,
        )
      : null;

  return (
    <>
      <Tag className={cls}>
        {segs.map((seg, i) => {
          if (!seg.highlight) return <span key={i}>{seg.text}</span>;
          const isActive = activeHighlight === seg.highlight.sel || hoveredId === seg.highlight.id;
          return (
            <mark
              key={i}
              style={{ backgroundColor: isActive ? '#fde68a' : '#fef9c3', borderRadius: '2px', cursor: 'pointer', fontStyle: 'inherit', fontWeight: 'inherit' }}
              onMouseEnter={e => {
                cancelHide();
                setHoveredId(seg.highlight!.id);
                setTooltipRect((e.currentTarget as Element).getBoundingClientRect());
                setActiveHighlight(seg.highlight!.sel);
              }}
              onMouseLeave={scheduleHide}
            >
              {seg.text}
            </mark>
          );
        })}
      </Tag>
      {tooltip}
    </>
  );
}

// ─── CommentTooltip ───────────────────────────────────────────────────────────

function CommentTooltip({
  comment,
  rect,
  onMouseEnter,
  onMouseLeave,
  onLike,
  onResolve,
}: {
  comment: Comment;
  rect: DOMRect;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onLike: () => void;
  onResolve: () => void;
}) {
  const W = 256;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - W - 8));
  const top = rect.bottom + 8;

  return (
    <div
      style={{ position: 'fixed', left, top, width: W, zIndex: 1200 }}
      className="bg-white rounded-xl border border-border shadow-medium p-3 pointer-events-auto"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 rounded-full bg-primary-faded text-primary text-[14px] font-bold flex items-center justify-center shrink-0">
          {comment.initials}
        </div>
        <span className="text-[16px] font-semibold text-heading flex-1 min-w-0 truncate">{comment.author}</span>
        <span className="text-[15px] text-muted-foreground shrink-0">{comment.createdAt}</span>
      </div>
      <p className="text-xs text-foreground leading-relaxed line-clamp-3 mb-2">{comment.body}</p>
      {comment.attachments.length > 0 && (
        <p className="text-[15px] text-muted-foreground mb-2">
          <AttachFile className="w-3 h-3 inline mr-0.5" />{comment.attachments.length} attachment{comment.attachments.length > 1 ? 's' : ''}
        </p>
      )}
      <div className="flex items-center gap-2 pt-1.5 border-t border-border">
        <button
          onClick={onLike}
          className={cn('flex items-center gap-1 text-[15px] font-semibold transition-colors', comment.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary')}
        >
          <ThumbUp className="w-3 h-3" />{comment.likes > 0 ? comment.likes : ''}
        </button>
        <button
          onClick={onResolve}
          className="flex items-center gap-1 text-[15px] font-semibold text-muted-foreground hover:text-success transition-colors ml-auto"
        >
          <CheckCircle className="w-3 h-3" />Resolve
        </button>
      </div>
    </div>
  );
}

// ─── CommentableRegion ────────────────────────────────────────────────────────
// Wrap any content area to enable block-click commenting.
//
// When the Comments panel is open:
//   - Hovering the block shows a subtle highlight ring + a cursor tooltip that
//     follows the mouse: "Leave a comment"
//   - Clicking anywhere on the block (except buttons/inputs) opens the comment
//     popover. Uses onClickCapture so nested child onClick handlers are suppressed.
//   - Nested CommentableRegions take priority: the outer region skips if the
//     click target is inside a more-specific inner region.
//
// When a panel comment is clicked:
//   - The region scrolls into view and flashes a blue highlight for 1.8 s.

export function CommentableRegion({
  id,
  label,
  children,
  className,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(CommentsContext);
  const regionRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [pendingPos, setPendingPos] = useState<{ x: number; y: number } | null>(null);
  const [flashing, setFlashing] = useState(false);
  const panelOpen = ctx?.panelOpen ?? false;
  const activeRegionId = ctx?.activeRegionId ?? null;
  const setActiveRegionId = ctx?.setActiveRegionId;

  // Scroll + flash when this region is navigated to from the panel
  useEffect(() => {
    if (activeRegionId !== id) return;
    const el = regionRef.current;
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setFlashing(true);
    const t = setTimeout(() => { setFlashing(false); setActiveRegionId?.(null); }, 1800);
    return () => clearTimeout(t);
  }, [activeRegionId, id, setActiveRegionId]);

  function handleClickCapture(e: React.MouseEvent) {
    if (!panelOpen) return;
    const tag = (e.target as HTMLElement).tagName;
    if (['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'].includes(tag)) return;
    // If a more-specific nested CommentableRegion contains the target, let it handle the click
    const nearest = (e.target as HTMLElement).closest('[data-commentable-id]') as HTMLElement | null;
    if (nearest && nearest !== regionRef.current) return;
    e.stopPropagation();
    setPendingPos({ x: e.clientX, y: e.clientY });
  }

  const showHover = panelOpen && hovered && !pendingPos;
  const isHighlighted = flashing || showHover;

  return (
    <div
      ref={regionRef}
      data-commentable-id={id}
      className={cn(className, 'relative')}
      onMouseEnter={e => { if (panelOpen) { e.stopPropagation(); setHovered(true); } }}
      onMouseLeave={e => {
        if (panelOpen) { e.stopPropagation(); setHovered(false); setMousePos(null); }
      }}
      onMouseMove={e => {
        if (showHover) setMousePos({ x: e.clientX, y: e.clientY });
      }}
      onClickCapture={handleClickCapture}
    >
      {/* Highlight ring */}
      {isHighlighted && (
        <div
          className={cn(
            'absolute inset-0 rounded-xl pointer-events-none z-10',
            flashing
              ? 'ring-2 ring-primary/50 bg-primary/[0.04]'
              : 'ring-1 ring-primary/25 bg-primary/[0.02]',
          )}
        />
      )}

      {children}

      {/* Cursor-following tooltip */}
      {showHover && mousePos && createPortal(
        <div
          style={{ position: 'fixed', left: mousePos.x + 14, top: mousePos.y - 32, pointerEvents: 'none', zIndex: 2000 }}
          className="flex items-center gap-1.5 bg-heading text-white text-[15px] font-semibold px-2.5 py-1 rounded-lg shadow-medium select-none whitespace-nowrap"
        >
          <ModeComment className="w-3 h-3" />
          Leave a comment
        </div>,
        document.body,
      )}

      {/* Comment popover */}
      {pendingPos && (
        <BlockCommentPopover
          sectionId={id}
          sectionLabel={label}
          x={pendingPos.x}
          y={pendingPos.y}
          onClose={() => { setPendingPos(null); setHovered(false); }}
        />
      )}
    </div>
  );
}

// ─── BlockCommentPopover ──────────────────────────────────────────────────────
// Click-triggered comment popover. Anchored to the click position.

function BlockCommentPopover({
  sectionId,
  sectionLabel,
  x,
  y,
  onClose,
}: {
  sectionId: string;
  sectionLabel: string;
  x: number;
  y: number;
  onClose: () => void;
}) {
  const { addComment } = useComments();
  const [commentType, setCommentType] = useState<CommentType>('idea');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const W = 300;
  const left = Math.max(8, Math.min(x - W / 2, window.innerWidth - W - 8));
  const top = Math.min(y + 12, window.innerHeight - 260);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  function submit() {
    if (!body.trim()) return;
    addComment({
      sectionId,
      sectionLabel,
      selectedText: '',
      body: body.trim(),
      type: commentType,
      author: 'You',
      initials: 'YO',
      createdAt: 'just now',
      attachments,
    });
    onClose();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setAttachments(p => [
      ...p,
      ...files.map(f => ({
        id: `${Date.now()}-${f.name}`,
        name: f.name,
        size: f.size < 1024 ? `${f.size} B` : f.size < 1048576 ? `${(f.size / 1024).toFixed(1)} KB` : `${(f.size / 1048576).toFixed(1)} MB`,
      })),
    ]);
    e.target.value = '';
  }

  return createPortal(
    <div
      ref={ref}
      style={{ position: 'fixed', left, top, width: W, zIndex: 1000 }}
      className="bg-white rounded-xl border border-border shadow-medium p-3"
    >
      {/* Context label */}
      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border">
        <ModeComment className="w-3 h-3 text-primary shrink-0" />
        <span className="text-[15px] font-semibold text-muted-foreground truncate">{sectionLabel}</span>
      </div>

      {/* Type selector */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {COMMENT_TYPES.map(({ type, label, activeCls }) => (
          <button
            key={type}
            onClick={() => setCommentType(type)}
            className={cn(
              'px-1.5 py-0.5 rounded-full text-[15px] font-semibold border capitalize transition-all',
              commentType === type ? activeCls : 'bg-white border-border text-muted-foreground hover:border-primary/30',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Comment input */}
      <textarea
        autoFocus
        value={body}
        onChange={e => setBody(e.target.value)}
        onKeyDown={e => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
          if (e.key === 'Escape') onClose();
        }}
        placeholder="Add a comment..."
        rows={3}
        className="w-full text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none leading-relaxed"
      />

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5 mb-1">
          {attachments.map(a => (
            <div key={a.id} className="flex items-center gap-1 bg-shell rounded px-1.5 py-0.5 border border-border text-[15px]">
              <AttachFile className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="truncate max-w-[100px]">{a.name}</span>
              <button onClick={() => setAttachments(p => p.filter(x => x.id !== a.id))} className="text-muted-foreground hover:text-destructive ml-0.5">
                <Close className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border">
        <label className="flex items-center gap-1 text-[16px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
          <AttachFile className="w-3.5 h-3.5" />Attach
          <input type="file" multiple className="hidden" onChange={onFileChange} />
        </label>
        <div className="flex items-center gap-1.5">
          <button onClick={onClose} className="text-[16px] text-muted-foreground hover:text-foreground px-2 py-1 transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!body.trim()}
            className="text-[16px] font-semibold bg-primary text-white hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground px-3 py-1 rounded-lg transition-colors"
          >
            Comment
          </button>
        </div>
      </div>
      <p className="text-[14px] text-muted-foreground/50 text-right mt-1">⌘↵ to submit · Esc to cancel</p>
    </div>,
    document.body,
  );
}

// ─── CommentsPanel ────────────────────────────────────────────────────────────
// Renders nothing when closed — toggle is in the page header via CommentsToggleButton.

export function CommentsPanel() {
  const { comments, likeComment, resolveComment, editComment, activeHighlight, setActiveHighlight, setActiveRegionId, panelOpen, setPanelOpen, typeFilter, setTypeFilter } = useComments();
  const [tab, setTab] = useState<'open' | 'resolved'>('open');
  const listRef = useRef<HTMLDivElement>(null);

  const open = comments.filter(c => !c.resolved);
  const resolved = comments.filter(c => c.resolved);
  const displayed = (tab === 'open' ? open : resolved).filter(c => typeFilter === 'all' || c.type === typeFilter);

  // Scroll highlighted comment into view in the panel
  useEffect(() => {
    if (!activeHighlight || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-comment-sel="${CSS.escape(activeHighlight)}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeHighlight]);

  if (!panelOpen) return null;

  return (
    <div className="w-80 shrink-0">
      <div className="sticky top-6">
        <div className="rounded-xl border border-border bg-white shadow-xsmall overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-shell flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ModeComment className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-heading">Comments</span>
              {open.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[15px] font-bold flex items-center justify-center leading-none">
                  {open.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
              title="Close panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-3 py-2 border-b border-border flex gap-1.5">
            {(['open', 'resolved'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[15px] font-semibold border transition-all',
                  tab === t
                    ? t === 'resolved' ? 'bg-success text-white border-success' : 'bg-primary text-white border-primary'
                    : 'bg-white text-muted-foreground border-border hover:border-primary/40',
                )}
              >
                {t === 'open' ? `Open (${open.length})` : `Resolved (${resolved.length})`}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="px-3 py-2 border-b border-border flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setTypeFilter('all')}
              className={cn('px-2 py-0.5 rounded-full text-[15px] font-semibold border transition-all', typeFilter === 'all' ? 'bg-heading text-white border-heading' : 'bg-white text-muted-foreground border-border hover:border-primary/30')}
            >
              All
            </button>
            {COMMENT_TYPES.map(({ type, label, activeCls }) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={cn('px-2 py-0.5 rounded-full text-[15px] font-semibold border capitalize transition-all', typeFilter === type ? activeCls : 'bg-white text-muted-foreground border-border hover:border-primary/30')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Comment list */}
          <div ref={listRef} className="flex flex-col divide-y divide-border max-h-[520px] overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="p-6 text-center">
                <ModeComment className="w-5 h-5 text-muted/40 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  {tab === 'open'
                    ? 'No comments yet. Hover over any content block to add one.'
                    : 'No resolved comments.'}
                </p>
              </div>
            ) : (
              displayed.map(c => (
                <CommentCard
                  key={c.id}
                  comment={c}
                  highlighted={activeHighlight === c.selectedText}
                  onHoverEnter={() => setActiveHighlight(c.selectedText)}
                  onHoverLeave={() => setActiveHighlight(null)}
                  onJumpTo={() => setActiveRegionId(c.sectionId)}
                  onLike={() => likeComment(c.id)}
                  onResolve={() => resolveComment(c.id)}
                  onEdit={body => editComment(c.id, body)}
                />
              ))
            )}
          </div>

          {/* Footer hint */}
          {tab === 'open' && (
            <div className="px-4 py-2 border-t border-border bg-shell">
              <p className="text-[15px] text-muted-foreground text-center">Click any content block to comment · Click a comment to jump to its block</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CommentCard ──────────────────────────────────────────────────────────────

function CommentCard({
  comment,
  highlighted,
  onHoverEnter,
  onHoverLeave,
  onJumpTo,
  onLike,
  onResolve,
  onEdit,
}: {
  comment: Comment;
  highlighted: boolean;
  onHoverEnter: () => void;
  onHoverLeave: () => void;
  onJumpTo: () => void;
  onLike: () => void;
  onResolve: () => void;
  onEdit: (body: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);

  return (
    <div
      data-comment-sel={comment.selectedText}
      className={cn('p-3 transition-colors cursor-pointer group', highlighted ? 'bg-amber-50' : 'hover:bg-shell/50')}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      onClick={e => { if (!(e.target as HTMLElement).closest('button')) onJumpTo(); }}
      title="Click to jump to this block"
    >
      {/* Section badge + type badge */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <p className="text-[15px] font-semibold text-muted-foreground bg-shell border border-border rounded px-1.5 py-0.5 group-hover:border-primary/30 group-hover:text-primary transition-colors flex items-center gap-1">
          <ModeComment className="w-2.5 h-2.5" />
          {comment.sectionLabel}
        </p>
        {comment.type && (
          <span className={cn('text-[15px] font-semibold rounded px-1.5 py-0.5 capitalize', TYPE_BADGE[comment.type].bg, TYPE_BADGE[comment.type].text)}>
            {comment.type}
          </span>
        )}
      </div>

      {/* Quoted selection */}
      {comment.selectedText && (
        <div className="flex gap-1.5 mb-2">
          <div className="w-0.5 self-stretch rounded bg-amber-400/70 shrink-0" />
          <p className="text-[15px] text-muted-foreground italic leading-relaxed line-clamp-2">"{comment.selectedText}"</p>
        </div>
      )}

      {/* Author + time */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-primary-faded text-primary text-[14px] font-bold flex items-center justify-center shrink-0">
          {comment.initials}
        </div>
        <span className="text-[16px] font-semibold text-heading">{comment.author}</span>
        <span className="text-[15px] text-muted-foreground ml-auto">{comment.createdAt}</span>
      </div>

      {/* Body — inline edit for own comments */}
      {isEditing ? (
        <div className="mb-2">
          <textarea
            value={editBody}
            onChange={e => setEditBody(e.target.value)}
            rows={3}
            autoFocus
            className="w-full text-xs border border-border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground"
          />
          <div className="flex gap-1.5 mt-1.5">
            <button
              onClick={() => { onEdit(editBody); setIsEditing(false); }}
              className="text-[16px] font-semibold bg-primary text-white px-2.5 py-1 rounded-lg hover:bg-primary/90 transition-colors"
            >Save</button>
            <button
              onClick={() => { setEditBody(comment.body); setIsEditing(false); }}
              className="text-[16px] text-muted-foreground px-2 py-1 hover:text-foreground transition-colors"
            >Cancel</button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-foreground leading-relaxed mb-2">{comment.body}</p>
      )}

      {/* Attachments */}
      {comment.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {comment.attachments.map(a => (
            <div key={a.id} className="flex items-center gap-1 bg-shell rounded px-1.5 py-0.5 border border-border text-[15px]">
              <AttachFile className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="truncate max-w-[90px]">{a.name}</span>
              <span className="text-muted-foreground shrink-0">· {a.size}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {comment.resolved ? (
        <div className="flex items-center gap-1 text-[15px] text-success font-semibold">
          <CheckCircle className="w-3 h-3" />Resolved
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            onClick={onLike}
            className={cn('flex items-center gap-1 text-[15px] font-semibold transition-colors', comment.liked ? 'text-primary' : 'text-muted-foreground hover:text-primary')}
          >
            <ThumbUp className="w-3 h-3" />{comment.likes > 0 ? comment.likes : ''}
          </button>
          {comment.author === 'You' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[15px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >Edit</button>
          )}
          <button
            onClick={onResolve}
            className="flex items-center gap-1 text-[15px] font-semibold text-muted-foreground hover:text-success transition-colors ml-auto"
          >
            <CheckCircle className="w-3 h-3" />Resolve
          </button>
        </div>
      )}
    </div>
  );
}
