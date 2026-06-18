import {
  matchPoints,
  showsRuleX,
  showsRuleY,
  type HoverPoint,
} from '$lib/charts/utils/tooltip';
import type { HoverStore } from '$lib/charts/hover.svelte';
import type { XValue } from '$lib/types/plots/common';

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
  getX: () => (d: T) => XValue;
  getY: () => (d: T) => XValue | number;
  /** Short label drawn next to the highlight dot (e.g. the value). */
  label: () => (row: T) => string;
  format: () => (row: T) => string;
}) {
  let hoveredRows = $state<T[]>([]);
  let cursor = $state<{ x: number; y: number } | null>(null);

  const toPoint = (row: T) => ({
    x: args.getX()(row),
    y: args.getY()(row),
    label: args.label()(row),
  });

  // Points highlighted in THIS facet. `none` mirrors only the locally hovered
  // rows; the synced modes resolve matches against the shared active value.
  const highlight = $derived.by(() => {
    const h = args.hover();
    if (h.sync === 'none') {
      return h.source === args.facetId() ? hoveredRows.map(toPoint) : [];
    }
    return matchPoints(args.points(), h).map(({ x, y, label }) => ({ x, y, label }));
  });

  const ruleX = $derived.by(() => (showsRuleX(args.hover().sync) ? args.hover().activeX : null));
  const ruleY = $derived.by(() => (showsRuleY(args.hover().sync) ? args.hover().activeY : null));

  // The floating HTML tooltip belongs to the facet that owns the cursor.
  const showTooltip = $derived(
    cursor != null && args.hover().source === args.facetId() && hoveredRows.length > 0,
  );
  const tooltipText = $derived(hoveredRows.length ? args.format()(hoveredRows[0]) : '');

  function onPointer(data: T[]) {
    hoveredRows = data;
    const h = args.hover();
    if (data.length) {
      h.activeX = args.getX()(data[0]);
      h.activeY = args.getY()(data[0]);
      h.source = args.facetId();
    } else if (h.source === args.facetId()) {
      h.activeX = null;
      h.activeY = null;
      h.source = null;
    }
  }

  function onMove(e: PointerEvent) {
    // Relative to the wrapper (currentTarget), not whatever SVG node was hit.
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onLeave() {
    cursor = null;
    hoveredRows = [];
    const h = args.hover();
    if (h.source === args.facetId()) {
      h.activeX = null;
      h.activeY = null;
      h.source = null;
    }
  }

  return {
    onPointer,
    onMove,
    onLeave,
    get points() {
      return highlight;
    },
    get ruleX() {
      return ruleX;
    },
    get ruleY() {
      return ruleY;
    },
    get showTooltip() {
      return showTooltip;
    },
    get tooltipText() {
      return tooltipText;
    },
    get cursor() {
      return cursor;
    },
  };
}
