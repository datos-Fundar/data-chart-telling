<script lang="ts" generics="TData extends Record<string, unknown>">
  import { SvelteMap } from 'svelte/reactivity';
  import { Text, usePlot } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { declutter1D, mirrorRanks } from '$lib/plots/utils/declutter';
  import type { Series } from '$lib/types/plots/data/common';
  import type { ValuesStyle } from '$lib/types/plots/styles/common';
  import type { ValueAnchor } from '$lib/types/plots/constants';

  // Elbow-routed leader line geometry (pixels) — a run's top/bottom pair
  // share the shortest lane, its next-in pair the next lane out, and so on
  // (see `mirrorRanks`'s doc comment for why sharing a lane is safe). Each
  // lane is `LANE_STEP` further out than the last; `ELBOW_GAP` is the
  // shortest lane (rank 0, right off the data point); `LABEL_GAP` is the
  // small clearance between the outermost lane and the label text it feeds
  // into.
  const ELBOW_GAP = 10;
  const LANE_STEP = 7;
  const LABEL_GAP = 6;

  // Default connector look — deliberately *not* each series' own colour or
  // stroke weight: a leader line only needs to be traceable back to its
  // label, and matching the data line's own styling reads as if it were
  // more data, which is confusing right where several lines already
  // converge. Neutral, thin, and solid keeps it legible as a leader — the
  // colour and weight are still fully overridable via `values.strokeStyle`.
  const DEFAULT_CONNECTOR_COLOR = '#94a3b8';
  const DEFAULT_CONNECTOR_WIDTH = 0.5;

  /**
   * End-point value labels for `LinePlot` — one label per series at its last
   * data point, with automatic collision resolution whenever several series
   * end up with close last values. Rendered as a proper descendant of
   * svelteplot's `<Plot>` (not just of `LinePlot` itself) so `usePlot()`
   * below resolves the real, live y-scale needed to measure pixel-space
   * overlap.
   */
  let {
    lastPoints,
    values,
  }: {
    lastPoints: { series: Series<TData>; lastRow: TData; seriesIndex: number }[];
    values: ValuesStyle | undefined;
  } = $props();

  const cfg = $derived(getConfiguration());
  const font = $derived(values?.fontStyle);
  const connector = $derived(values?.strokeStyle);
  const fmtVal = $derived(values?.format ?? ((v: number, name: string) => `${name} - ${v}`));
  const valAnchor = $derived<ValueAnchor>(values?.anchor ?? 'start');
  // 'outside' is a per-point escape hatch resolved by HoverMarker; line's own
  // value labels already have their own `anchor: 'outside'` concept above,
  // so treat it as unset here.
  const resolvedTextAnchor = $derived(font?.textAnchor === 'outside' ? undefined : font?.textAnchor);

  const defaultDx = $derived(valAnchor === 'start' ? 6 : valAnchor === 'end' ? -6 : 0);
  const defaultDy = $derived(valAnchor === 'outside' ? -8 : 0);
  const defaultTA = $derived(
    valAnchor === 'start' ? ('start' as const) : valAnchor === 'end' ? ('end' as const) : ('middle' as const),
  );
  const defaultLA = $derived(valAnchor === 'outside' ? ('bottom' as const) : ('middle' as const));

  const plot = usePlot();

  /**
   * Pixel-space collision fix-up for end-point labels: resolves each label's
   * true pixel Y through the plot's own live y-scale, then runs the shared
   * two-pass declutter over those pixels to find how far each one needs to
   * move to clear its neighbours. The result is a pure pixel *offset*
   * (`extraDy`), applied the same way `<Text dy>` already is everywhere else
   * in this file — it never becomes a data-space Y fed back into a mark,
   * which would extend the y-scale's own domain and provoke an infinite
   * autoscale ↔ declutter feedback loop.
   *
   * `inGroup`/`rank`/`depth` come from `mirrorRanks`, fed by `declutter1D`'s
   * own `connected` record rather than re-inferred from positions — see
   * both functions' doc comments for why that's the only reliable source:
   * position-based heuristics either miss a series that only had to move
   * because a neighbour got pushed into it, or wrongly bridge two unrelated
   * clusters that each happened to need decluttering on their own. The
   * elbow connector below turns `rank` into a lane index — mirrored
   * top/bottom pairs share a lane, so a run only ever needs `ceil(depth / 2)`
   * distinct ones. A series with nothing nearby is absent from the map, and
   * its label renders with no extra offset.
   */
  const declutteredOffsets = $derived.by(() => {
    const map = new SvelteMap<string, { extraDy: number; inGroup: boolean; rank: number; depth: number }>();
    if (lastPoints.length < 2) return map;
    const yScale = plot.scales.y?.fn;
    if (!yScale) return map;
    const fontSize = font?.fontSize ?? 12;
    const minGap = Math.max(16, fontSize * 1.4);
    const items = lastPoints.map(({ series: s, lastRow }) => ({
      name: s.name,
      pos: Number(yScale(Number(resolveAccessor(s.y)(lastRow)))),
    }));
    const sorted = [...items].sort((a, b) => a.pos - b.pos);
    const { positions: spread, connected } = declutter1D(items, minGap);
    const spreadByName = new Map(spread.map((d) => [d.name, d.pos]));
    const ranks = mirrorRanks(connected);
    sorted.forEach((item, i) => {
      const final = spreadByName.get(item.name) ?? item.pos;
      map.set(item.name, {
        extraDy: final - item.pos,
        inGroup: ranks[i].depth > 1,
        rank: ranks[i].rank,
        depth: ranks[i].depth,
      });
    });
    return map;
  });
</script>

{#each lastPoints as { series: s, lastRow, seriesIndex } (s.name)}
  {@const xFn = resolveAccessor(s.x)}
  {@const yFn = resolveAccessor(s.y)}
  {@const seriesColor = paletteColor(seriesIndex, cfg.palette)}
  {@const offset = declutteredOffsets.get(s.name)}
  {@const extraDy = offset?.inGroup ? offset.extraDy : 0}
  {@const baseDx = font?.dx ?? defaultDx}
  {@const dir = Math.sign(baseDx) || 1}
  {@const numLanes = offset?.inGroup ? Math.ceil(offset.depth / 2) : 0}
  {@const labelDx = offset?.inGroup
    ? dir * (ELBOW_GAP + (numLanes - 1) * LANE_STEP + LABEL_GAP)
    : baseDx}
  {#if offset?.inGroup && plot.scales.x?.fn && plot.scales.y?.fn}
    {@const px = Number(plot.scales.x.fn(xFn(lastRow)))}
    {@const py = Number(plot.scales.y.fn(Number(yFn(lastRow))))}
    {@const laneX = px + dir * (ELBOW_GAP + offset.rank * LANE_STEP)}
    {@const targetY = py + extraDy}
    <path
      d={`M ${px} ${py} H ${laneX} V ${targetY} H ${px + labelDx}`}
      fill="none"
      stroke={connector?.stroke ?? DEFAULT_CONNECTOR_COLOR}
      stroke-width={connector?.strokeWidth ?? DEFAULT_CONNECTOR_WIDTH}
      stroke-opacity={connector?.strokeOpacity ?? 1}
      stroke-dasharray={connector?.strokeDasharray}
      stroke-linecap={connector?.strokeLinecap ?? 'square'}
      stroke-linejoin={connector?.strokeLinejoin ?? 'miter'}
    />
  {/if}
  <Text
    data={[lastRow]}
    x={xFn}
    y={yFn}
    text={() => fmtVal(Number(yFn(lastRow)), s.name)}
    dx={labelDx}
    dy={(font?.dy ?? defaultDy) + extraDy}
    textAnchor={resolvedTextAnchor ?? defaultTA}
    lineAnchor={font?.lineAnchor ?? defaultLA}
    lineHeight={font?.lineHeight}
    rotate={font?.rotate}
    class={font?.class}
    textClass={font?.textClass}
    fill={font?.fill ?? seriesColor}
    fontSize={font?.fontSize ?? 12}
    fontWeight={font?.fontWeight}
    fontStyle={font?.fontStyle}
    stroke={font?.stroke}
    strokeWidth={font?.strokeWidth}
    paintOrder={font?.paintOrder}
  />
{/each}
