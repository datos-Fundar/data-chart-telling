<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Plot, Cell, Text, AxisX, AxisY, Pointer } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils';
  import { makeColorScale } from '$lib/charts/utils/color';
  import { getConfiguration } from '$lib/charts/config.svelte';
  import { getHover, createHover } from '$lib/charts/hover.svelte';
  import { createHoverController } from '$lib/charts/tooltip/controller.svelte';
  import HoverMarks from '$lib/charts/tooltip/HoverMarks.svelte';
  import Tooltip from '$lib/charts/tooltip/Tooltip.svelte';
  import type { HeatmapSeries } from '$lib/types/plots/heatmap';
  import type { XValue } from '$lib/types/plots/common';
  import type { TooltipRuntime } from '$lib/types/charts/tooltip';

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
    xLabel = '',
    yLabel = '',
    showValues = true,
    formatValue = (v: number) => `${v}`,
    tooltip = undefined,
  }: {
    width: number;
    height: number;
    series: HeatmapSeries<TData>;
    /** Gradient start; defaults to the configured continuous palette. */
    colorMin?: string;
    /** Gradient end; defaults to the configured continuous palette. */
    colorMax?: string;
    /** Value range for the colour scale; inferred from the data when omitted. */
    domain?: [number, number];
    xLabel?: string;
    yLabel?: string;
    showValues?: boolean;
    formatValue?: (v: number) => string;
    tooltip?: TooltipRuntime<TData>;
  } = $props();

  const cfg = $derived(getConfiguration());
  const minColor = $derived(colorMin ?? cfg.continuous.min);
  const maxColor = $derived(colorMax ?? cfg.continuous.max);

  const getX = $derived(resolveAccessor<TData>(series.x));
  const getY = $derived(resolveAccessor<TData>(series.y));
  const getValue = $derived(resolveAccessor<TData>(series.value));

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  const sharedHover = getHover();
  const localHover = createHover();
  const hover = $derived(sharedHover ?? localHover);
  $effect(() => {
    if (!sharedHover && tooltip) localHover.sync = tooltip.sync;
  });

  const hoverPoints = $derived(
    series.data.map((d) => ({
      x: getX(d) as XValue,
      y: getY(d) as XValue,
      row: d,
      label: formatValue(Number(getValue(d))),
    })),
  );

  const ctrl = createHoverController<TData>({
    hover: () => hover,
    facetId: () => tooltip?.facetId ?? '',
    points: () => hoverPoints,
    getX: () => (d) => getX(d) as XValue,
    getY: () => (d) => getY(d) as XValue,
    label: () => (r) => formatValue(Number(getValue(r))),
    format: () => tooltip?.format ?? ((r) => formatValue(Number(getValue(r)))),
  });

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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-plot"
  style:color={cfg.axis.color}
  onpointermove={tooltip ? ctrl.onMove : undefined}
  onpointerleave={tooltip ? ctrl.onLeave : undefined}
>
<Plot
  {width}
  {height}
  margin={cfg.margins}
  x={{ label: xLabel, domain: xDomain, type: 'band', labelAnchor: 'right' }}
  y={{ label: yLabel, domain: yDomain, type: 'band' }}
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

  {#if tooltip}
    <Pointer data={series.data} x={getX} y={getY} maxDistance={400} onupdate={ctrl.onPointer} />
    <HoverMarks points={ctrl.points} ruleX={ctrl.ruleX} ruleY={ctrl.ruleY} color={cfg.timeline.activeColor} showLabels={false} />
  {/if}
</Plot>

{#if tooltip && ctrl.showTooltip && ctrl.cursor}
  <Tooltip x={ctrl.cursor.x} y={ctrl.cursor.y}>{ctrl.tooltipText}</Tooltip>
{/if}
</div>

<style>
  .dct-plot {
    position: relative;
    line-height: 0;
  }
</style>
