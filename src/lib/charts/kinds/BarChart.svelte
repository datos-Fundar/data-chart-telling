<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { buildBarSeries } from '$lib/charts/utils/group';
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
  import type { XValue, YValue } from '$lib/types/plots/common';

  /**
   * High-level bar chart. Groups flat rows by `z` into one fill-coloured bar
   * series per group and delegates all chrome to {@link Chart}.
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
    colors,
    fillOpacity,
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
    z?: Accessor<TRow, unknown>;
    colors?: Record<string, string>;
    fillOpacity?: number;
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    /** Enable hover tooltips. `true` for defaults, or `{ sync, format }`. */
    tooltip?: TooltipProp<TRow>;
  } = $props();

  const cfg = $derived(getConfiguration());
  const resolveColor = $derived(colorResolver(colors, cfg.palette));

  const tip = $derived(resolveTooltip(tooltip, 'x'));
  const getX = $derived(resolveAccessor<TRow>(x));
  const getY = $derived(resolveAccessor<TRow>(y));
  const defaultFormat = $derived((row: TRow) => `${String(getX(row))}: ${getY(row)}`);
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
    {@const series = buildBarSeries(rows, x, y, z, resolveColor).map((s) => ({
      ...s,
      fillOpacity,
    }))}
    <BarPlot
      width={w}
      height={h}
      {series}
      tooltip={tip.enabled
        ? { format: tip.format ?? defaultFormat, facetId: facetValue ?? '', sync: tip.sync }
        : undefined}
    />
  {/snippet}
</Chart>
