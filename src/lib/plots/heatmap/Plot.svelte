<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Cell, Text, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import type { HeatmapSeries } from '$lib/types/plots/heatmap';
  import type { ScalesConfig, XValue } from '$lib/types/plots/common';
  import type { Marker } from '$lib/types/plots/markers';
  import type { TooltipRuntime } from '$lib/types/layout/tooltip';

  /**
   * A categorical grid of value-coloured cells. Mirrors the line/bar plot
   * contract: it takes a single `series` plus styling and draws into the given
   * box — so the chart-level container/timeline/facet/legend wrap it unchanged.
   */
  let {
    width,
    height,
    series,
    colorMin,
    colorMax,
    domain,
    scales = {},
    showValues = true,
    formatValue = (v: number) => `${v}`,
    markers = [],
    tooltip = undefined,
  }: {
    width: number;
    height: number;
    series: HeatmapSeries<TData>;
    colorMin?: string;
    colorMax?: string;
    /** Value (colour) domain — distinct from `scales.x`/`scales.y`, which place the grid's categories. */
    domain?: [number, number];
    scales?: ScalesConfig;
    showValues?: boolean;
    formatValue?: (v: number) => string;
    /** Heatmap has no series concept — only unscoped markers (`ruleX`/`ruleY`/`hover`) apply. */
    markers?: Marker[];
    tooltip?: TooltipRuntime<TData>;
  } = $props();

  $effect(() => {
    const scoped = markers.filter(
      (m) => (m.type === 'hover' || m.type === 'component') && m.series,
    );
    if (scoped.length > 0) {
      console.warn(
        'HeatmapPlot: markers scoped to a `series` are ignored — heatmaps have no series concept.',
      );
    }
  });

  const cfg = $derived(getConfiguration());
  const minColor = $derived(colorMin ?? cfg.continuous.min);
  const maxColor = $derived(colorMax ?? cfg.continuous.max);

  const getX = $derived(resolveAccessor<TData>(series.x));
  const getY = $derived(resolveAccessor<TData>(series.y));
  const getValue = $derived(resolveAccessor<TData>(series.value));

  const hoverPoints = $derived(
    series.data.map((d) => ({
      x: getX(d) as XValue,
      y: getY(d) as XValue,
      row: d,
      label: formatValue(Number(getValue(d))),
    })),
  );

  const xDomain = $derived([...new Set(series.data.map((d) => getX(d) as XValue))]);
  const yDomain = $derived([...new Set(series.data.map((d) => getY(d) as XValue))]);

  const valueDomain = $derived.by((): [number, number] => {
    if (domain) return domain;
    const vals = series.data.map((d) => Number(getValue(d)));
    return vals.length ? [Math.min(...vals, 0), Math.max(...vals)] : [0, 1];
  });

  const colorScale = $derived(
    makeColorScale(valueDomain[0], valueDomain[1], minColor, maxColor),
  );
</script>

<PlotLayout
  {width}
  {height}
  x={{ type: 'band', labelAnchor: 'right', domain: xDomain, ...(scales.x ?? {}) }}
  y={{ type: 'band', domain: yDomain, ...(scales.y ?? {}) }}
  data={series.data}
  {getX}
  {getY}
  matchY={getY}
  {hoverPoints}
  label={(d) => formatValue(Number(getValue(d)))}
  {tooltip}
  {markers}
  showHoverLabels={false}
>
  <AxisX tickSize={0} tickPadding={4} tickFontSize={cfg.axis.fontSize} titleFontSize={cfg.axis.labelFontSize} />
  <AxisY tickSize={0} tickPadding={4} tickFontSize={cfg.axis.fontSize} titleFontSize={cfg.axis.labelFontSize} />

  <Cell
    data={series.data}
    x={getX}
    y={getY}
    fill={(d) => colorScale(Number(getValue(d)))}
    inset={0.5}
  />

  {#if showValues}
    <Text
      data={series.data}
      x={getX}
      y={getY}
      text={(d) => formatValue(Number(getValue(d)))}
      fill={cfg.continuous.labelColor}
      fontSize={12}
      fontWeight={600}
      textAnchor="middle"
    />
  {/if}
</PlotLayout>
