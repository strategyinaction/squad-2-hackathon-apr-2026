import { cn } from '#/lib/utils';
import { toPng } from 'html-to-image';
import { useState } from 'react';

/**
 * Icon-only button that exports the page <main> element as a transparent PNG.
 * Place alongside CommentsToggleButton in PageHeader actions.
 */
export function ExportButton() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    const main = document.querySelector('main');
    if (!main || exporting) return;
    setExporting(true);
    try {
      main.scrollTo({ top: 0 });
      await new Promise(r => setTimeout(r, 80));

      const slug = window.location.pathname.replace(/\//g, '-').replace(/^-/, '') || 'page';
      const dataUrl = await toPng(main, {
        backgroundColor: undefined,
        pixelRatio: 2,
        width: main.scrollWidth,
        height: main.scrollHeight,
        style: { overflow: 'visible', height: `${main.scrollHeight}px` },
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${slug}.png`;
      a.click();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="relative group shrink-0">
      <button
        onClick={handleExport}
        disabled={exporting}
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-lg border transition-colors',
          'border-border bg-white text-muted-foreground hover:bg-shell hover:text-foreground',
          exporting && 'opacity-50 cursor-not-allowed',
        )}
      >
        {exporting ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a1 1 0 00.553.894l2.447-2.447-2.447-2.447A1 1 0 008 4V0a10 10 0 100 20v-4a1 1 0 00-.553-.894L5 12.553l2.447 2.447A1 1 0 008 16v4a8 8 0 01-8-8z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
        )}
      </button>
      {/* Tooltip */}
      <span className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-heading px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-small transition-opacity group-hover:opacity-100">
        Export PNG
      </span>
    </div>
  );
}
