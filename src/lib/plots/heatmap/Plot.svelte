<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Cell, Text } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { validateSegments } from '$lib/plots/utils/segments';
  import { buildSeries } from '$lib/utils/grouping';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
  import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
  import AxisLayout from '$lib/layout/plot/AxisLayout.svelte';
  import GridLayout from '$lib/layout/plot/GridLayout.svelte';
  import RuleLayout from '$lib/layout/plot/RuleLayout.svelte';
  import { hasHoverMarker, resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
  import type { BasePlotProps } from '$lib/types/plots/props';
  import type { AxisValue } from '$lib/types/plots/axis';
  import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
  import type { AxisBasedScalesConfig } from '$lib/types/plots/props';
  import type { BasePlotStyles } from '$lib/types/plots/styles/common';
  import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
  import type { Marker } from '$lib/types/markers/common';

  /**
   * A categorical grid of value-coloured cells. Accepts either a pre-built
   * `series` array (each {@link Series} may carry `z` as the colour accessor) or
   * flat `data/x/y/z` props — mirrors the line/bar plot contract so the
   * chart-level container/timeline/facet/legend wrap it unchanged.
   *
   * The colour domain is read from `scales.z.domain`; when absent it is derived
   * from the visible slice of data.
   */
  type Props = BasePlotProps<
    SeriesProps<TData> | DataProps<TData>,
    TData,
    BasePlotStyles,
    CellSegmentStyle,
    Marker,
    AxisBasedScalesConfig<TData>
  >;

  let {
    width,
    height,
    series,
    data,
    x,
    y,
    z,
    styles = {},
    segments = {},
    scales = {},
    margins,
    markers = [],
    tooltip = undefined,
  }: Props = $props();

  $effect(() => {
    validateSegments(segments);
    const scoped = markers.filter(
      (m) => (m.type === 'hover' || m.type === 'component') && m.series,
    );
    if (scoped.length > 0) {
      console.warn(
        'HeatmapPlot: markers scoped to a `series` are ignored — heatmaps have no series concept.',
      );
    }
    const seriesKeys = Object.keys(segments).filter((k) => k !== 'default');
    if (seriesKeys.length > 0) {
      console.warn(
        `HeatmapPlot: segment groups have series-specific keys (${seriesKeys.join(', ')}) — heatmaps have no named series. Use the 'default' key instead.`,
      );
    }
  });

  const cfg = $derived(getConfiguration());
  const minColor = $derived(styles.colors?.min ?? cfg.continuous.min);
  const maxColor = $derived(styles.colors?.max ?? cfg.continuous.max);
  const showVals = $derived(styles.values?.show ?? true);
  const fmtVal = $derived(styles.values?.format ?? ((v: number) => `${v}`));
  // 'outside' is a per-point escape hatch resolved by HoverMarker; heatmaps
  // have no signed axis to resolve it against, so treat it as unset.
  const resolvedTextAnchor = $derived(styles.values?.textAnchor === 'outside' ? undefined : styles.values?.textAnchor);

  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, undefined));
  const flat = $derived(resolvedSeries.flatMap((s) => s.data));

  const getX = $derived(resolveAccessor<TData>(resolvedSeries[0]?.x ?? x!));
  const getY = $derived(resolveAccessor<TData>(resolvedSeries[0]?.y ?? y!));
  const getZ = $derived(resolveAccessor<TData>(resolvedSeries[0]?.z ?? z!));

  const xDomain = $derived([...new Set(flat.map((d) => getX(d) as AxisValue))]);
  const yDomain = $derived([...new Set(flat.map((d) => getY(d) as AxisValue))]);

  const valueDomain = $derived.by((): [number, number] => {
    if (scales.z?.domain && scales.z.domain.length >= 2) {
      return [Number(scales.z.domain[0]), Number(scales.z.domain[1])];
    }
    const vals = flat.map((d) => Number(getZ(d)));
    return vals.length ? [Math.min(...vals, 0), Math.max(...vals)] : [0, 1];
  });

  // ── Legend-driven range filter ────────────────────────────────────────────
  const legendInteraction = $derived(getLegendInteraction());
  const range = $derived(legendInteraction?.continuousRange);
  // 'rescale' reprojects the ramp onto the narrowed range; 'filter' (and no
  // active range) keeps the original domain — only which cells are hidden
  // changes.
  const effectiveDomain = $derived.by((): [number, number] =>
    range && range.mode === 'rescale' ? [range.min, range.max] : valueDomain,
  );

  function rangeFilteredStyle(base: CellSegmentStyle, value: number): CellSegmentStyle {
    const r = range;
    if (r == null || (value >= r.min && value <= r.max)) return base;
    return { ...base, ...disabledFillOverride(r.disabledStyle) };
  }

  const colorScale = $derived(
    makeColorScale(effectiveDomain[0], effectiveDomain[1], minColor, maxColor),
  );

  // A cell outside the active range is dimmed in place, but never surfaces
  // in hover/tooltip — it's simply absent from the candidate list.
  const hoverPoints = $derived(
    flat
      .filter((d) => {
        const r = range;
        if (r == null) return true;
        const v = Number(getZ(d));
        return v >= r.min && v <= r.max;
      })
      .map((d) => ({
        x: getX(d) as AxisValue,
        y: getY(d) as AxisValue,
        row: d,
        label: fmtVal(Number(getZ(d)), ''),
      })),
  );

  const segList = $derived(segments.default ?? []);

  /**
   * A catch-all (no `areas`) always matches, so evaluating segments in plain
   * array order and merging every match — as this used to do — makes a
   * catch-all listed *after* an area-specific one (the documented, and only
   * demonstrated, convention: baseline first, highlight second) overwrite it
   * on every cell, since it's applied last unconditionally. Area-specific
   * segments must always win over the catch-all regardless of list order —
   * so the catch-all is applied once as the baseline, and only
   * area-specific segments can override it on top, mirroring the same
   * catch-all/area-specific priority every other plot kind's segments
   * already follow (see `resolveSeriesSegments` in `utils/segments.ts`).
   */
  const segStyleMap = $derived.by(() => {
    const map = new Map<string, CellSegmentStyle>();
    if (!segList.length) return map;
    const catchAll = segList.find((s) => !s.areas || s.areas.length === 0);
    const areaSegs = segList.filter((s) => s.areas && s.areas.length > 0);
    for (const d of flat) {
      const cx = getX(d) as AxisValue;
      const cy = getY(d) as AxisValue;
      const key = `${String(cx)}::${String(cy)}`;
      if (!map.has(key)) {
        let style: CellSegmentStyle = catchAll?.style ? { ...catchAll.style } : {};
        for (const seg of areaSegs) {
          const matches = seg.areas!.some((area) => {
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
    (d: TData) =>
      rangeFilteredStyle(
        segStyleMap.get(`${String(getX(d))}::${String(getY(d))}`) ?? {},
        Number(getZ(d)),
      ),
  );

  /**
   * One `<Cell>` call per *distinct resolved style*, not one call for the
   * whole dataset. svelteplot registers `fillOpacity`/`strokeWidth` under
   * its shared "opacity"/numeric scale machinery — passed as a per-row
   * accessor that genuinely varies within a single mark instance, that
   * scale collapses every row to the same (wrong) value instead of the
   * literal numbers set on each segment. A literal, per-call constant (one
   * call per style bucket) bypasses that entirely, which is exactly how
   * bar/line avoid the same trap (one mark per visual segment). `fill`
   * stays a per-cell accessor within each group — unlike fillOpacity, it
   * must keep varying continuously with the underlying value wherever a
   * segment doesn't explicitly override it.
   */
  type StyleGroup = { style: CellSegmentStyle; data: TData[] };
  const styleGroups = $derived.by((): StyleGroup[] => {
    const groups = new Map<string, StyleGroup>();
    for (const d of flat) {
      const style = getCellStyle(d);
      const key = JSON.stringify(style);
      let group = groups.get(key);
      if (!group) {
        group = { style, data: [] };
        groups.set(key, group);
      }
      group.data.push(d);
    }
    return [...groups.values()];
  });

  // The single, fully-resolved scales object BasePlotLayout reads for
  // everything (ticks, grid, sort, and the real svelteplot scale) — avoids
  // keeping a second, separately-defaulted copy of `scales.x`/`scales.y`
  // (our own band-scale + domain defaults) out of sync with the one
  // actually forwarded.
  const resolvedScales = $derived<AxisBasedScalesConfig<TData>>({
    ...scales,
    x: { type: 'band', labelAnchor: 'right', domain: xDomain, ...(scales.x ?? {}) },
    y: { type: 'band', domain: yDomain, ...(scales.y ?? {}) },
  });

  const hoverActive = $derived(tooltip != null || hasHoverMarker(markers));
  const hoverStrategy = $derived(resolveHoverStrategy(tooltip?.strategy, markers, 'punctual'));
  const hoverSync = $derived(resolveHoverSync(tooltip?.sync, markers));
</script>

<BasePlotLayout
  {width}
  {height}
  data={flat}
  {getX}
  {getY}
  {hoverPoints}
  label={(d) => fmtVal(Number(getZ(d)), '')}
  {tooltip}
  {hoverActive}
  {hoverStrategy}
  {hoverSync}
  scales={resolvedScales}
  {margins}
>
  {#snippet children({ matchedPoints, ruleX, ruleY, impliesRuleX, impliesRuleY, numericMargins })}
  <AxisLayout data={flat} {getX} {getY} {width} {height} {numericMargins} scales={resolvedScales} />
  <GridLayout scales={resolvedScales} />
  <RuleLayout {markers} seriesData={resolvedSeries} {matchedPoints} {ruleX} {ruleY} {impliesRuleX} {impliesRuleY} showHoverLabels={false}>
  {#each styleGroups as group, i (i)}
    <Cell
      data={group.data as unknown as Record<string | symbol, never>[]}
      x={getX}
      y={getY}
      fill={(d) => group.style.fill ?? colorScale(Number(getZ(d as TData)))}
      fillOpacity={group.style.fillOpacity ?? 1}
      stroke={group.style.stroke}
      strokeWidth={group.style.strokeWidth ?? 0}
      inset={0.5}
    />
  {/each}

  {#if showVals}
    <Text
      data={flat}
      x={getX}
      y={getY}
      text={(d) => fmtVal(Number(getZ(d)), '')}
      fill={styles.values?.fill ?? cfg.continuous.labelColor}
      fontSize={styles.values?.fontSize ?? 12}
      fontWeight={styles.values?.fontWeight ?? 600}
      fontStyle={styles.values?.fontStyle}
      textAnchor={resolvedTextAnchor ?? 'middle'}
      lineAnchor={styles.values?.lineAnchor ?? 'middle'}
      dx={styles.values?.dx ?? 0}
      dy={styles.values?.dy ?? 0}
      lineHeight={styles.values?.lineHeight}
      rotate={styles.values?.rotate}
      stroke={styles.values?.stroke}
      strokeWidth={styles.values?.strokeWidth}
      paintOrder={styles.values?.paintOrder}
      class={styles.values?.class}
      textClass={styles.values?.textClass}
    />
  {/if}
  </RuleLayout>
  {/snippet}
</BasePlotLayout>
