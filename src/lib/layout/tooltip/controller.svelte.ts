import {
  eq,
  matchByStrategy,
  impliesRuleX,
  impliesRuleY,
  filterBySeries,
} from '$lib/layout/tooltip/utils';
import type { HoverStore, HoverPoint } from '$lib/types/layout/tooltip';
import type { AxisValue } from '$lib/types/plots/common';

/**
 * The plot-agnostic hover state machine shared by every plot. Given reactive
 * accessors for the current hover store, this facet's id, and the local points,
 * it produces everything a plot needs to render: the highlight points, the
 * crosshair rule positions, and the floating-tooltip state — plus the event
 * handlers that feed (and broadcast to) the shared store.
 *
 * Kept generic so line / bar / heatmap reuse it unchanged; only the points and
 * accessors they pass in differ.
 */
export function createHoverController<T extends Record<string, unknown>>(args: {
  hover: () => HoverStore;
  facetId: () => string;
  points: () => HoverPoint<T>[];
  getX: () => (d: T) => AxisValue;
  getY: () => (d: T) => AxisValue;
  /** Short label drawn next to the highlight dot (e.g. the value). */
  label: () => (row: T) => string;
  format: () => (row: T) => string;
  /** Named subset of series the tooltip text/content should be limited to. */
  seriesFilter?: () => string[] | undefined;
  /** This facet's own box, used to convert the cursor to/from a sync-broadcast fraction. */
  width: () => number;
  height: () => number;
}) {
  let cursor = $state<{ x: number; y: number } | null>(null);

  // svelteplot's `Pointer` hands back cloned rows (not the original
  // references), so a row's series can't be looked up by identity — find it
  // by value against the locally-known, already-tagged points instead.
  const seriesForRow = (row: T): string | undefined => {
    const x = args.getX()(row);
    const y = args.getY()(row);
    return args.points().find((p) => eq(p.x, x) && eq(p.y, y))?.series;
  };

  // Points matched in THIS facet. Non-source facets only react when sync is
  // enabled. The strategy in the shared store determines how points are found.
  const matched = $derived.by((): HoverPoint<T>[] => {
    const h = args.hover();
    const isSource = h.source === args.facetId();
    if (!isSource && !h.sync) return [];
    return matchByStrategy(args.points(), h);
  });

  const matchedRows = $derived(filterBySeries(matched, args.seriesFilter?.()));

  // Points highlighted in THIS facet for the in-SVG marker — no series
  // filtering, since that's the tooltip text's concern, not the marker's.
  const highlight = $derived(matched.map(({ x, y, label, series, color }) => ({ x, y, label, series, color })));

  // Raw hover position — available whenever there are matched points.
  // PlotLayout gates actual display with impliesRuleX/Y + the marker's ruleX/Y props.
  const ruleX = $derived(matched.length > 0 ? args.hover().activeX : null);
  const ruleY = $derived(matched.length > 0 ? args.hover().activeY : null);

  // Whether the current strategy implies a crosshair rule on each axis by default.
  const _impliesRuleX = $derived(impliesRuleX(args.hover().strategy));
  const _impliesRuleY = $derived(impliesRuleY(args.hover().strategy));

  const showTooltip = $derived.by(() => {
    if (matchedRows.length === 0) return false;
    const h = args.hover();
    if (h.source === args.facetId()) return cursor != null;
    return h.sync;
  });
  const tooltipText = $derived(
    matchedRows.length ? matchedRows.map((p) => args.format()(p.row)).join('\n\n') : '',
  );

  function onPointer(data: T[]) {
    const h = args.hover();
    if (data.length) {
      h.activeX = args.getX()(data[0]);
      h.activeY = args.getY()(data[0]);
      h.activeSeries = seriesForRow(data[0]) ?? null;
      h.source = args.facetId();
    } else if (h.source === args.facetId()) {
      h.activeX = null;
      h.activeY = null;
      h.activeSeries = null;
      h.source = null;
    }
  }

  function onMove(e: PointerEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cursor = { x, y };
    const w = args.width();
    const h = args.height();
    if (w > 0 && h > 0) args.hover().cursorFrac = { x: x / w, y: y / h };
  }

  function onLeave() {
    cursor = null;
    const h = args.hover();
    if (h.source === args.facetId()) {
      h.activeX = null;
      h.activeY = null;
      h.activeSeries = null;
      h.cursorFrac = null;
      h.source = null;
    }
  }

  const tooltipPosition = $derived.by((): { x: number; y: number } | null => {
    if (cursor) return cursor;
    const frac = args.hover().cursorFrac;
    return frac ? { x: frac.x * args.width(), y: frac.y * args.height() } : null;
  });

  return {
    onPointer,
    onMove,
    onLeave,
    get points() {
      return highlight;
    },
    get matchedRows() {
      return matchedRows;
    },
    get ruleX() {
      return ruleX;
    },
    get ruleY() {
      return ruleY;
    },
    get impliesRuleX() {
      return _impliesRuleX;
    },
    get impliesRuleY() {
      return _impliesRuleY;
    },
    get showTooltip() {
      return showTooltip;
    },
    get tooltipText() {
      return tooltipText;
    },
    get tooltipPosition() {
      return tooltipPosition;
    },
    get cursor() {
      return cursor;
    },
  };
}
