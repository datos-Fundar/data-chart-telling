<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Cell, Text, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { buildSeries } from '$lib/utils/grouping';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import type { ScalesConfig, AxisValue, SeriesProps, DataProps } from '$lib/types/plots/common';
  import type { Marker } from '$lib/types/plots/markers';
  import type { TooltipRuntime } from '$lib/types/layout/tooltip';

  /**
   * A categorical grid of value-coloured cells. Accepts either a pre-built
   * `series` array (each {@link Series} may carry `z` as the colour accessor) or
   * flat `data/x/y/z` props — mirrors the line/bar plot contract so the
   * chart-level container/timeline/facet/legend wrap it unchanged.
   *
   * The colour domain is read from `scales.z.domain`; when absent it is derived
   * from the visible slice of data.
   */
  let {
    width,
    height,
    series,
    data,
    x,
    y,
    z,
    colorMin,
    colorMax,
    scales = {},
    showValues = true,
    formatValue = (v: number) => `${v}`,
    markers = [],
    tooltip = undefined,
  }: (SeriesProps<TData> | DataProps<TData>) & {
    width: number;
    height: number;
    colorMin?: string;
    colorMax?: string;
    scales?: ScalesConfig;
    showValues?: boolean;
    formatValue?: (v: number) => string;
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

  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, undefined));
  const flat = $derived(resolvedSeries.flatMap((s) => s.data));

  const getX = $derived(resolveAccessor<TData>(resolvedSeries[0]?.x ?? x!));
  const getY = $derived(resolveAccessor<TData>(resolvedSeries[0]?.y ?? y!));
  const getZ = $derived(resolveAccessor<TData>(resolvedSeries[0]?.z ?? z!));

  const hoverPoints = $derived(
    flat.map((d) => ({
      x: getX(d) as AxisValue,
      y: getY(d) as AxisValue,
      row: d,
      label: formatValue(Number(getZ(d))),
    })),
  );

  const xDomain = $derived([...new Set(flat.map((d) => getX(d) as AxisValue))]);
  const yDomain = $derived([...new Set(flat.map((d) => getY(d) as AxisValue))]);

  const valueDomain = $derived.by((): [number, number] => {
    if (scales.z?.domain && scales.z.domain.length >= 2) {
      return [Number(scales.z.domain[0]), Number(scales.z.domain[1])];
    }
    const vals = flat.map((d) => Number(getZ(d)));
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
  data={flat}
  {getX}
  {getY}
  matchY={getY}
  {hoverPoints}
  label={(d) => formatValue(Number(getZ(d)))}
  {tooltip}
  {markers}
  showHoverLabels={false}
>
  <AxisX tickSize={0} tickPadding={4} tickFontSize={cfg.axis.fontSize} titleFontSize={cfg.axis.labelFontSize} />
  <AxisY tickSize={0} tickPadding={4} tickFontSize={cfg.axis.fontSize} titleFontSize={cfg.axis.labelFontSize} />

  <Cell
    data={flat}
    x={getX}
    y={getY}
    fill={(d) => colorScale(Number(getZ(d)))}
    inset={0.5}
  />

  {#if showValues}
    <Text
      data={flat}
      x={getX}
      y={getY}
      text={(d) => formatValue(Number(getZ(d)))}
      fill={cfg.continuous.labelColor}
      fontSize={12}
      fontWeight={600}
      textAnchor="middle"
    />
  {/if}
</PlotLayout>
