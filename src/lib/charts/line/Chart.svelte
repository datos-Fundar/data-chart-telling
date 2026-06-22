<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import { groupBy } from '$lib/utils/grouping';
  import { colorResolver } from '$lib/layout/legend/utils';
  import { resolveTooltip } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { TooltipProp } from '$lib/types/layout/tooltip';
  import type {
    FacetConfig,
    TimelineConfig,
  } from '$lib/types/charts/common';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { SegmentsMap } from '$lib/types/plots/styles';
  import type { Marker } from '$lib/types/plots/markers';
  import type { AxisScale, XValue, YValue, Accessor } from '$lib/types/plots/common';

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
    xScale?: AxisScale;
    yScale?: AxisScale;
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    /** Enable hover tooltips. `true` for defaults, or `{ sync, format }`. */
    tooltip?: TooltipProp<TRow>;
  } = $props();

  const cfg = $derived(getConfiguration());
  const resolveColor = $derived(colorResolver(colors, cfg.palette));

  // A line should grow into its full extent over time, not snap to a single
  // year's point — so default to a cumulative reveal unless the caller wants
  // the bar/heatmap-style exact-step snapshot instead.
  const timelineConfig = $derived(
    timeline ? { ...timeline, filterMode: timeline.filterMode ?? 'upTo' } : undefined,
  );

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
  timeline={timelineConfig}
  tooltip={tip.enabled ? { sync: tip.sync } : undefined}
>
  {#snippet plot({ data: rows, width: w, height: h, facetValue })}
    {@const names = z ? [...groupBy(rows, z).keys()] : ['series']}
    <LinePlot
      width={w}
      height={h}
      data={rows}
      {x}
      {y}
      {z}
      segments={segmentsFor(names)}
      {markers}
      {xScale}
      {yScale}
      tooltip={tip.enabled
        ? { format: tip.format ?? defaultFormat, facetId: facetValue ?? '', sync: tip.sync }
        : undefined}
    />
  {/snippet}
</Chart>
