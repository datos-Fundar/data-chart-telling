<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import { buildLineSeries } from '$lib/charts/utils/group';
  import { colorResolver } from '$lib/charts/utils/legend';
  import { getConfiguration } from '$lib/charts/config.svelte';
  import { resolveAccessor } from '$lib/plots/utils';
  import { resolveTooltip, type TooltipProp } from '$lib/types/charts/tooltip';
  import type {
    Accessor,
    FacetConfig,
    TimelineConfig,
  } from '$lib/types/charts/common';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { SegmentsMap, DeltaConfig } from '$lib/types/plots/lines';
  import type { Marker } from '$lib/types/plots/markers';
  import type { XValue, YValue } from '$lib/types/plots/common';

  type AxisScale = { domain?: (number | string | Date)[]; nice?: boolean; reverse?: boolean };

  /**
   * High-level line chart. It takes flat rows plus `x`/`y`/`z` encodings, groups
   * by `z` into one line per group, and hands the result to {@link LinePlot}.
   * Everything chrome-related (title, legend, timeline, facets) is delegated to
   * {@link Chart}; this component only owns the flat-data → line-series adaption.
   */
  let {
    width,
    height,
    title,
    subtitle,
    caption,
    legend,
    data,
    x,
    y,
    z,
    segments,
    colors,
    markers = [],
    delta = {},
    xScale = {},
    yScale = {},
    facet,
    timeline,
    tooltip,
  }: {
    width: number;
    height: number;
    title?: string;
    subtitle?: string;
    caption?: string;
    legend?: LegendSection[];
    data: TRow[];
    x: Accessor<TRow, XValue>;
    y: Accessor<TRow, YValue>;
    /** Grouping dimension: one line per distinct value. */
    z?: Accessor<TRow, unknown>;
    /** Per-group range styling, keyed by the group (`z`) value. */
    segments?: SegmentsMap;
    /** Convenience group→colour map used when `segments` is not supplied. */
    colors?: Record<string, string>;
    markers?: Marker[];
    delta?: { x?: DeltaConfig[]; y?: DeltaConfig[] };
    xScale?: AxisScale;
    yScale?: AxisScale;
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    /** Enable hover tooltips. `true` for defaults, or `{ sync, format }`. */
    tooltip?: TooltipProp<TRow>;
  } = $props();

  const cfg = $derived(getConfiguration());
  const resolveColor = $derived(colorResolver(colors, cfg.palette));

  /** Derive a stroke-only segments map from `colors` when none is given. */
  function segmentsFor(names: string[]): SegmentsMap {
    if (segments) return segments;
    const map: SegmentsMap = {};
    names.forEach((name, i) => {
      map[name] = [{ style: { stroke: { stroke: resolveColor(name, i), strokeWidth: cfg.line.strokeWidth } } }];
    });
    return map;
  }

  // Default tooltip text: "<group>\n<x>: <y>". `sync: 'x'` suits time series.
  const tip = $derived(resolveTooltip(tooltip, 'x'));
  const getX = $derived(resolveAccessor<TRow>(x));
  const getY = $derived(resolveAccessor<TRow>(y));
  const getZ = $derived(z ? resolveAccessor<TRow>(z) : null);
  const fmtX = (v: unknown) => (v instanceof Date ? v.toLocaleDateString() : String(v));
  const defaultFormat = $derived((row: TRow) => {
    const group = getZ ? `${getZ(row)}\n` : '';
    return `${group}${fmtX(getX(row))}: ${getY(row)}`;
  });
</script>

<Chart
  {width}
  {height}
  {title}
  {subtitle}
  {caption}
  {legend}
  {data}
  {facet}
  {timeline}
  tooltip={tip.enabled ? { sync: tip.sync } : undefined}
>
  {#snippet plot({ data: rows, width: w, height: h, facetValue })}
    {@const series = buildLineSeries(rows, x, y, z)}
    <LinePlot
      width={w}
      height={h}
      {series}
      segments={segmentsFor(series.map((s) => s.name))}
      {markers}
      {delta}
      x={xScale}
      y={yScale}
      tooltip={tip.enabled
        ? { format: tip.format ?? defaultFormat, facetId: facetValue ?? '', sync: tip.sync }
        : undefined}
    />
  {/snippet}
</Chart>
