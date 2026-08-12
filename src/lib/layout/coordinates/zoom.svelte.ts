import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, type D3ZoomEvent } from 'd3-zoom';
import type { GeoZoomConfig } from '$lib/types/layout/coordinates';

export type GeoZoomTransform = { x: number; y: number; k: number };

/**
 * Wires drag-pan + scroll-zoom onto a DOM node via d3-zoom, exposing the
 * resulting transform as reactive Svelte state. The caller applies it as an
 * SVG `<g transform="translate(x,y) scale(k)">` wrapper — cheap, since the
 * underlying `d3-geo` projection is computed once by svelteplot and never
 * recomputed per zoom tick.
 *
 * Known v1 limitation: svelteplot's own `<Pointer>` hit-tests in the plot's
 * pre-zoom projected coordinate space, so hover/tooltip matching does not
 * compensate for an active pan/zoom transform — it still works, but targets
 * a shape's un-zoomed position rather than its currently-visible one.
 */
export function createGeoZoom(args: {
  enabled: () => boolean;
  config: () => GeoZoomConfig | undefined;
  node: () => HTMLElement | null;
  /**
   * When true, drag/touch gestures are left for something else to handle
   * (see `createGeoRotate`) — only wheel/pinch scaling stays wired to this
   * behavior. Checked per-event, so toggling it doesn't need to tear down
   * and recreate the underlying d3-zoom behavior.
   */
  disableDrag?: () => boolean;
}) {
  let transform = $state<GeoZoomTransform>({ x: 0, y: 0, k: 1 });

  $effect(() => {
    const el = args.node();
    if (!args.enabled() || !el) return;
    const cfg = args.config();

    const behavior = d3zoom<HTMLElement, unknown>()
      .scaleExtent([cfg?.min ?? 1, cfg?.max ?? 8])
      .filter((event: Event) => {
        if (args.disableDrag?.() && event.type !== 'wheel') return false;
        // d3-zoom's own default filter, minus the part this replaces.
        return (!(event as MouseEvent).ctrlKey || event.type === 'wheel') && !(event as MouseEvent).button;
      })
      .on('zoom', (event: D3ZoomEvent<HTMLElement, unknown>) => {
        transform = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
      });

    const selection = select(el).call(behavior);

    const initial = cfg?.initial;
    if (initial) {
      behavior.transform(selection, zoomIdentity.translate(initial.x ?? 0, initial.y ?? 0).scale(initial.k ?? 1));
    } else {
      transform = { x: 0, y: 0, k: 1 };
    }

    return () => {
      selection.on('.zoom', null);
    };
  });

  return {
    get transform() {
      return transform;
    },
  };
}
