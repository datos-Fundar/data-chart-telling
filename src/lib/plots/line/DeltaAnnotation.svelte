<script lang="ts">
  import { Line, Dot, Text } from 'svelteplot';
  import type { ResolvedDelta } from '$lib/plots/line/delta';

  let { delta: d, axis, xDomain, yDomain }: {
    delta: ResolvedDelta;
    axis: 'x' | 'y';
    xDomain?: (number | string | Date)[];
    yDomain?: (number | string | Date)[];
  } = $props();

  // X delta varies on Y → clamp to Y domain.
  // Y delta varies on X → clamp to X domain.
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

  // For 'x': fixed = X (vertical line), varying = Y values.
  // For 'y': fixed = Y (horizontal line), varying = X values.
  function pt(fixed: number, varying: number) {
    return axis === 'x' ? { x: fixed, y: varying } : { x: varying, y: fixed };
  }

  const fromVis = $derived(clamp(d.from.value));
  const toVis   = $derived(clamp(d.to.value));

  const strokeStyle = $derived(d.cfg.stroke);
  const anchor = $derived(d.cfg.lineAnchor ?? 'middle');

  const textVaryCoord = $derived(
    anchor === 'top'
      ? Math.max(fromVis, toVis)
      : anchor === 'bottom'
      ? Math.min(fromVis, toVis)
      : (fromVis + toVis) / 2
  );
</script>

<Line
  data={[pt(d.at, fromVis), pt(d.at, toVis)]}
  x={(p) => p.x}
  y={(p) => p.y}
  stroke={strokeStyle?.stroke ?? 'currentColor'}
  strokeWidth={strokeStyle?.strokeWidth ?? 2}
  strokeOpacity={strokeStyle?.strokeOpacity ?? 0.8}
  strokeDasharray={strokeStyle?.strokeDasharray ?? '6 6'}
  strokeLinecap="round"
/>
<Dot
  data={[pt(d.at, fromVis)]}
  x={(p) => p.x}
  y={(p) => p.y}
  r={4}
  fill={d.from.strokeColor}
  stroke={d.from.strokeColor}
  symbol="circle"
  strokeWidth={2}
/>
<Dot
  data={[pt(d.at, toVis)]}
  x={(p) => p.x}
  y={(p) => p.y}
  r={4}
  fill={d.to.strokeColor}
  stroke={d.to.strokeColor}
  symbol="circle"
  strokeWidth={2}
/>
<Text
  data={[pt(d.at, textVaryCoord)]}
  x={(p) => p.x}
  y={(p) => p.y}
  text={() => (d.cfg.formatDiff ?? ((v: number) => v.toFixed(1)))(d.diff)}
  fill={strokeStyle?.stroke ?? 'currentColor'}
  fontWeight="bold"
  fontSize={14}
  dx={d.cfg.dx ?? (axis === 'x' ? 12 : 0)}
  dy={d.cfg.dy ?? (axis === 'x' ? 0 : -10)}
  lineAnchor={axis === 'x' ? anchor : 'bottom'}
/>
