<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { Line } from 'svelteplot';
  import DotMarker from './DotMarker.svelte';
  import TextMarker from './TextMarker.svelte';
  import { resolveXDeltas, resolveYDeltas } from '$lib/utils/delta';
  import type { Series } from '$lib/types/plots/data/common';
  import type { DeltaMarkerConfig } from '$lib/types/markers/line';

  let { marker, data = [] }: { marker: DeltaMarkerConfig; data?: Series<TData>[] } = $props();

  const resolved = $derived.by(() => {
    const [d] = marker.axis === 'x' ? resolveXDeltas(data, [marker]) : resolveYDeltas(data, [marker]);
    return d;
  });

  const clampRange = $derived.by((): [number, number] | undefined => {
    const domain = marker.axis === 'x' ? marker.yDomain : marker.xDomain;
    if (!domain || domain.length < 2) return undefined;
    const lo = Number(domain[0]);
    const hi = Number(domain[domain.length - 1]);
    return isNaN(lo) || isNaN(hi) ? undefined : [Math.min(lo, hi), Math.max(lo, hi)];
  });

  function clamp(v: number): number {
    return clampRange ? Math.max(clampRange[0], Math.min(clampRange[1], v)) : v;
  }

  function pt(fixed: number, varying: number) {
    return marker.axis === 'x' ? { x: fixed, y: varying } : { x: varying, y: fixed };
  }

  function textVaryCoord(fromVis: number, toVis: number) {
    const anchor = marker.fontStyle?.lineAnchor ?? 'middle';
    return anchor === 'top'
      ? Math.max(fromVis, toVis)
      : anchor === 'bottom'
      ? Math.min(fromVis, toVis)
      : (fromVis + toVis) / 2;
  }

  // Pre-derive all coordinates as script-level signals so prop getters read safe
  // values during Svelte 5 teardown, before the {#if} guard finishes unmounting.
  const coords = $derived.by(() => {
    if (!resolved) return null;
    const fromVis = clamp(resolved.from ?? 0);
    const toVis = clamp(resolved.to ?? 0);
    const at = resolved.at ?? 0;
    return {
      fromPt: pt(at, fromVis),
      toPt: pt(at, toVis),
      textPt: pt(at, textVaryCoord(fromVis, toVis)),
      lineData: [pt(at, fromVis), pt(at, toVis)],
      diff: resolved.diff ?? 0,
    };
  });
</script>

{#if coords}
  <Line
    data={coords.lineData}
    x={(p) => p.x}
    y={(p) => p.y}
    stroke={marker.strokeStyle?.stroke ?? 'currentColor'}
    strokeWidth={marker.strokeStyle?.strokeWidth ?? 2}
    strokeOpacity={marker.strokeStyle?.strokeOpacity ?? 0.8}
    strokeDasharray={marker.strokeStyle?.strokeDasharray ?? '6 6'}
    strokeLinecap={marker.strokeStyle?.strokeLinecap ?? 'round'}
  />
  <DotMarker
    x={coords?.fromPt?.x ?? 0}
    y={coords?.fromPt?.y ?? 0}
    style={{
      dotRadius: 4,
      dotFill: marker.strokeStyle?.stroke,
      dotStroke: marker.strokeStyle?.stroke,
      dotStrokeWidth: 2,
      ...marker.dotStyle,
    }}
  />
  <DotMarker
    x={coords?.toPt?.x ?? 0}
    y={coords?.toPt?.y ?? 0}
    style={{
      dotRadius: 4,
      dotFill: marker.strokeStyle?.stroke,
      dotStroke: marker.strokeStyle?.stroke,
      dotStrokeWidth: 2,
      ...marker.dotStyle,
    }}
  />
  <TextMarker
    x={coords?.textPt?.x ?? 0}
    y={coords?.textPt?.y ?? 0}
    text={(marker.formatDiff ?? ((v: number) => v.toFixed(1)))(coords?.diff ?? 0)}
    style={{
      fontWeight: 'bold',
      fontSize: 14,
      textAnchor: 'middle',
      fill: marker.strokeStyle?.stroke ?? 'currentColor',
      ...marker.fontStyle,
      dx: marker.fontStyle?.dx ?? (marker.axis === 'x' ? 12 : 0),
      dy: marker.fontStyle?.dy ?? (marker.axis === 'x' ? 0 : -10),
      lineAnchor: marker.axis === 'x' ? (marker.fontStyle?.lineAnchor ?? 'middle') : 'bottom',
    }}
  />
{/if}
