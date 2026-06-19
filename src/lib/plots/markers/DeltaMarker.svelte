<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { Line } from 'svelteplot';
  import DotMarker from './DotMarker.svelte';
  import TextMarker from './TextMarker.svelte';
  import { resolveXDeltas, resolveYDeltas } from '$lib/plots/utils/delta';
  import type { MarkerProps } from '$lib/types/plots/markers';
  import type { Series } from '$lib/types/plots/common';
  import type { DeltaConfig } from '$lib/types/plots/delta';

  interface Props extends MarkerProps<Series<TData>>, DeltaConfig {
    xDomain?: (number | string | Date)[];
    yDomain?: (number | string | Date)[];
  }

  let {
    data = [],
    axis,
    at,
    from,
    to,
    formatDiff,
    strokeStyle,
    fontStyle,
    dotStyle,
    xDomain,
    yDomain,
  }: Props = $props();

  const resolved = $derived.by(() => {
    const cfg: DeltaConfig = { axis, at, from, to, formatDiff, strokeStyle, fontStyle, dotStyle };
    const [d] = axis === 'x' ? resolveXDeltas(data, [cfg]) : resolveYDeltas(data, [cfg]);
    return d;
  });

  const clampRange = $derived.by((): [number, number] | undefined => {
    const domain = axis === 'x' ? yDomain : xDomain;
    if (!domain || domain.length < 2) return undefined;
    const lo = Number(domain[0]);
    const hi = Number(domain[domain.length - 1]);
    return isNaN(lo) || isNaN(hi) ? undefined : [Math.min(lo, hi), Math.max(lo, hi)];
  });

  function clamp(v: number): number {
    return clampRange ? Math.max(clampRange[0], Math.min(clampRange[1], v)) : v;
  }

  function pt(fixed: number, varying: number) {
    return axis === 'x' ? { x: fixed, y: varying } : { x: varying, y: fixed };
  }

  function textVaryCoord(fromVis: number, toVis: number) {
    const anchor = fontStyle?.lineAnchor ?? 'middle';
    return anchor === 'top'
      ? Math.max(fromVis, toVis)
      : anchor === 'bottom'
      ? Math.min(fromVis, toVis)
      : (fromVis + toVis) / 2;
  }
</script>

{#if resolved}
  {@const fromVis = clamp(resolved.from)}
  {@const toVis = clamp(resolved.to)}
  {@const textPt = pt(resolved.at, textVaryCoord(fromVis, toVis))}

  <Line
    data={[pt(resolved.at, fromVis), pt(resolved.at, toVis)]}
    x={(p) => p.x}
    y={(p) => p.y}
    stroke={strokeStyle?.stroke ?? 'currentColor'}
    strokeWidth={strokeStyle?.strokeWidth ?? 2}
    strokeOpacity={strokeStyle?.strokeOpacity ?? 0.8}
    strokeDasharray={strokeStyle?.strokeDasharray ?? '6 6'}
    strokeLinecap={strokeStyle?.strokeLinecap ?? 'round'}
  />
  <DotMarker
    x={pt(resolved.at, fromVis).x}
    y={pt(resolved.at, fromVis).y}
    style={{ dotRadius: 4, dotFill: strokeStyle?.stroke, dotStroke: strokeStyle?.stroke, dotStrokeWidth: 2, ...dotStyle }}
  />
  <DotMarker
    x={pt(resolved.at, toVis).x}
    y={pt(resolved.at, toVis).y}
    style={{ dotRadius: 4, dotFill: strokeStyle?.stroke, dotStroke: strokeStyle?.stroke, dotStrokeWidth: 2, ...dotStyle }}
  />
  <TextMarker
    x={textPt.x}
    y={textPt.y}
    text={(formatDiff ?? ((v: number) => v.toFixed(1)))(resolved.diff)}
    style={{
      fontWeight: 'bold',
      fontSize: 14,
      textAnchor: 'middle',
      fill: strokeStyle?.stroke ?? 'currentColor',
      ...fontStyle,
      dx: fontStyle?.dx ?? (axis === 'x' ? 12 : 0),
      dy: fontStyle?.dy ?? (axis === 'x' ? 0 : -10),
      lineAnchor: axis === 'x' ? (fontStyle?.lineAnchor ?? 'middle') : 'bottom',
    }}
  />
{/if}
