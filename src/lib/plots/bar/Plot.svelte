<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { BarY, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { buildSeries } from '$lib/utils/grouping';
  import { buildGroupedSeries, validateSegments } from '$lib/plots/utils/segments';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import type { AxisScale, Series, SeriesProps, DataProps } from '$lib/types/plots/common';
  import type { BarSegmentStyle, SegmentsMap } from '$lib/types/plots/styles';
  import type { XValue } from '$lib/types/plots/common';
  import type { TooltipRuntime } from '$lib/types/layout/tooltip';

  let {
    width,
    height,
    series,
    data,
    x,
    y,
    z,
    segments = {},
    xScale = {},
    yScale = {},
    tooltip = undefined,
  }: (SeriesProps<TData> | DataProps<TData>) & {
    width: number;
    height: number;
    /** Per-series x-axis ranges with their own fill, keyed by series name. */
    segments?: SegmentsMap<BarSegmentStyle>;
    xScale?: AxisScale;
    yScale?: AxisScale;
    tooltip?: TooltipRuntime<TData>;
  } = $props();

  $effect(() => {
    if (Object.keys(segments).length > 0) validateSegments(segments);
  });

  const cfg = $derived(getConfiguration());
  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));
  const groupedSeries = $derived(
    buildGroupedSeries<Series<TData>, BarSegmentStyle>(resolvedSeries, segments),
  );

  const xAcc = $derived(resolveAccessor(resolvedSeries[0]?.x ?? ((d: TData) => d)));
  const yAcc = $derived(resolveAccessor(resolvedSeries[0]?.y ?? ((d: TData) => d)));
  const flat = $derived(resolvedSeries.flatMap((s) => s.data));
  const hoverPoints = $derived(
    flat.map((d) => ({ x: xAcc(d) as XValue, y: Number(yAcc(d)), row: d, label: String(yAcc(d)) })),
  );
</script>

<PlotLayout
  {width}
  {height}
  x={{ ...xScale, type: 'band', padding: 0.2 }}
  y={yScale}
  data={flat}
  getX={xAcc}
  getY={(d) => Number(yAcc(d))}
  {hoverPoints}
  label={(r) => String(yAcc(r))}
  {tooltip}
>
  <AxisX tickSize={cfg.axis.tickSize} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />
  <AxisY tickSize={0} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />

  {#each groupedSeries as group (group.series.name)}
    {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
      <BarY
        data={seg.data}
        x={resolveAccessor(group.series.x)}
        y={resolveAccessor(group.series.y)}
        fill={seg.style.fill ?? 'currentColor'}
        fillOpacity={seg.style.fillOpacity ?? 1}
      />
    {/each}
  {/each}
</PlotLayout>
