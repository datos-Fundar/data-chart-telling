<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Cell, Text, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { buildSeries } from '$lib/utils/grouping';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import type { PlotProps } from '$lib/types/plots/props';
  import type { AxisValue } from '$lib/types/plots/common';
  import type { CellSegmentStyle } from '$lib/types/plots/styles';

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
    styles = {},
    segments = [],
    scales = {},
    markers = [],
    tooltip = undefined,
  }: PlotProps<TData, CellSegmentStyle> = $props();

  $effect(() => {
    const scoped = markers.filter(
      (m) => (m.type === 'hover' || m.type === 'component') && m.series,
    );
    if (scoped.length > 0) {
      console.warn(
        'HeatmapPlot: markers scoped to a `series` are ignored — heatmaps have no series concept.',
      );
    }
    if (!Array.isArray(segments) && Object.keys(segments).length > 0) {
      console.warn(
        'HeatmapPlot: `segments` was passed as a record (SeriesAwareSegmentsMap) but heatmaps have no named series — use the array form (Segment[]) instead.',
      );
    }
  });

  const cfg = $derived(getConfiguration());
  const minColor = $derived(styles.colors?.min ?? cfg.continuous.min);
  const maxColor = $derived(styles.colors?.max ?? cfg.continuous.max);
  const showVals = $derived(styles.values?.show ?? true);
  const fmtVal = $derived(styles.values?.format ?? ((v: number) => `${v}`));

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
      label: fmtVal(Number(getZ(d)), ''),
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

  const segList = $derived(Array.isArray(segments) ? segments : []);

  const segStyleMap = $derived.by(() => {
    const map = new Map<string, CellSegmentStyle>();
    if (!segList.length) return map;
    for (const d of flat) {
      const cx = getX(d) as AxisValue;
      const cy = getY(d) as AxisValue;
      const key = `${String(cx)}::${String(cy)}`;
      if (!map.has(key)) {
        let style: CellSegmentStyle = {};
        for (const seg of segList) {
          const areas = seg.areas;
          const matches =
            !areas || areas.length === 0
              ? true
              : areas.some((area) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const xOk = !area.x || ((area.x.from === undefined || (cx as any) >= area.x.from) && (area.x.to === undefined || (cx as any) <= area.x.to));
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const yOk = !area.y || ((area.y.from === undefined || (cy as any) >= area.y.from) && (area.y.to === undefined || (cy as any) <= area.y.to));
                  return xOk && yOk;
                });
          if (matches) style = { ...style, ...seg.style };
        }
        map.set(key, style);
      }
    }
    return map;
  });

  const getCellStyle = $derived(
    (d: TData) => segStyleMap.get(`${String(getX(d))}::${String(getY(d))}`) ?? {},
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
  label={(d) => fmtVal(Number(getZ(d)), '')}
  {tooltip}
  {markers}
  showHoverLabels={false}
>
  <AxisX tickSize={0} tickPadding={4} tickFontSize={cfg.axis.fontSize} titleFontSize={cfg.axis.labelFontSize} />
  <AxisY tickSize={0} tickPadding={4} tickFontSize={cfg.axis.fontSize} titleFontSize={cfg.axis.labelFontSize} />

  <Cell
    data={flat as unknown as Record<string | symbol, never>[]}
    x={getX}
    y={getY}
    fill={(d) => getCellStyle(d as TData).fill ?? colorScale(Number(getZ(d as TData)))}
    fillOpacity={(d) => getCellStyle(d as TData).fillOpacity ?? 1}
    stroke={(d) => getCellStyle(d as TData).stroke}
    strokeWidth={(d) => getCellStyle(d as TData).strokeWidth ?? 0}
    inset={0.5}
  />

  {#if showVals}
    <Text
      data={flat}
      x={getX}
      y={getY}
      text={(d) => fmtVal(Number(getZ(d)), '')}
      fill={cfg.continuous.labelColor}
      fontSize={12}
      fontWeight={600}
      textAnchor={styles.values?.textAnchor ?? 'middle'}
      lineAnchor={styles.values?.lineAnchor ?? 'middle'}
      dx={styles.values?.dx ?? 0}
      dy={styles.values?.dy ?? 0}
      lineHeight={styles.values?.lineHeight}
      rotate={styles.values?.rotate}
      class={styles.values?.class}
      textClass={styles.values?.textClass}
    />
  {/if}
</PlotLayout>
