<script lang="ts" generics="TData extends Record<string, unknown>">
  import { getContext } from 'svelte';
  import { get } from 'svelte/store';
  import { SvelteMap } from 'svelte/reactivity';
  import type { Writable } from 'svelte/store';
  import { Text, usePlot } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { declutter1D, laneAssignment } from '$lib/plots/utils/declutter';
  import type { Series } from '$lib/types/plots/data/common';
  import type { ValuesStyle } from '$lib/types/plots/styles/common';
  import type { ValueAnchor } from '$lib/types/plots/constants';

  // svelteplot's own type for this context isn't part of its public export
  // surface, but the context itself (keyed by this fixed string, set by its
  // `<Plot>`) is — every axis mark already reads/writes it this way to
  // auto-size margins around what it actually renders. Mirroring that here
  // is what lets `margins.right: 'auto'` (the default) grow to fit these
  // labels on its own, instead of the caller having to guess a fixed
  // `margins.right` up front.
  type AutoMarginStores = {
    autoMarginTop: Writable<Map<string, number>>;
    autoMarginLeft: Writable<Map<string, number>>;
    autoMarginRight: Writable<Map<string, number>>;
    autoMarginBottom: Writable<Map<string, number>>;
  };

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

  // Elbow-routed leader line geometry (pixels), configurable project-wide
  // via `setConfiguration({ line: { valueLabels: {...} } })` — each lane a
  // run's members get spread across (see `laneAssignment`'s doc comment for
  // how lanes are picked without crossing) is `laneStep` further out than
  // the last; `elbowGap` is the shortest lane (rank 0, right off the data
  // point); `labelGap` is the small clearance between the outermost lane and
  // the label text it feeds into. `connectorColor`/`connectorWidth` are the
  // leader line's own default look — deliberately *not* each series' own
  // colour or stroke weight (matching the data line reads as more data, not
  // as a leader, right where several lines are already converging) — both
  // still overridable per-plot via `values.strokeStyle`.
  const elbowGap = $derived(cfg.line.valueLabels.elbowGap);
  const laneStep = $derived(cfg.line.valueLabels.laneStep);
  const labelGap = $derived(cfg.line.valueLabels.labelGap);
  const defaultConnectorColor = $derived(cfg.line.valueLabels.connectorColor);
  const defaultConnectorWidth = $derived(cfg.line.valueLabels.connectorWidth);

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

  // ── Auto margin ──────────────────────────────────────────────────────────
  // Registers how far these labels (+ their leader lines) actually extend
  // past the plot's own content box, on whichever side they grow toward, so
  // `margins.{left,right}: 'auto'` (the default) sizes itself to fit them —
  // the same mechanism svelteplot's own axis labels use, rather than a
  // fixed margin the caller has to guess and hard-code up front.
  const autoMargins = getContext<AutoMarginStores | undefined>('svelteplot/autoMargins');
  const marginId = `line-value-labels-${Math.random().toString(36).slice(2)}`;
  let groupEl: SVGGElement | undefined = $state();

  $effect(() => {
    // Depend on whatever actually changes the rendered label layout —
    // getBBox() below is a plain DOM read, not itself tracked, so without
    // this the effect would only ever measure once.
    void lastPoints;
    void values;
    const el = groupEl;
    if (!autoMargins || !el) return;
    const xRange = plot.scales.x?.fn?.range?.()?.map(Number);
    if (!xRange) return;
    const plotLeft = Math.min(xRange[0], xRange[1]);
    const plotRight = Math.max(xRange[0], xRange[1]);
    // getBBox() is in the <svg>'s own user-space coordinates — the same
    // pixel space `plot.scales.*.fn()` already produces everywhere else in
    // this file, so no viewport/DOM conversion is needed here.
    let box: { x: number; width: number };
    try {
      box = el.getBBox();
    } catch {
      return;
    }
    const overflowRight = Math.ceil(Math.max(0, box.x + box.width - plotRight));
    const overflowLeft = Math.ceil(Math.max(0, plotLeft - box.x));
    const rightMargins = get(autoMargins.autoMarginRight);
    const leftMargins = get(autoMargins.autoMarginLeft);
    if (rightMargins.get(marginId) !== overflowRight) rightMargins.set(marginId, overflowRight);
    if (leftMargins.get(marginId) !== overflowLeft) leftMargins.set(marginId, overflowLeft);
  });

  $effect(() => {
    return () => {
      if (!autoMargins) return;
      get(autoMargins.autoMarginRight).delete(marginId);
      get(autoMargins.autoMarginLeft).delete(marginId);
    };
  });

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
   * `inGroup`/`rank`/`lanesUsed` come from `laneAssignment`, fed by
   * `declutter1D`'s own `connected` record rather than re-inferred from
   * positions — see both functions' doc comments for why that's the only
   * reliable source: position-based heuristics either miss a series that
   * only had to move because a neighbour got pushed into it, or wrongly
   * bridge two unrelated clusters that each happened to need decluttering
   * on their own. The elbow connector below turns `rank` into a lane index.
   * A series with nothing nearby is absent from the map, and its label
   * renders with no extra offset.
   */
  const declutteredOffsets = $derived.by(() => {
    const map = new SvelteMap<string, { extraDy: number; inGroup: boolean; rank: number; lanesUsed: number }>();
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
    const range = yScale.range?.().map(Number);
    const bounds: [number, number] | undefined = range
      ? [Math.min(range[0], range[1]), Math.max(range[0], range[1])]
      : undefined;
    const { positions: spread, connected } = declutter1D(items, minGap, bounds);
    const spreadByName = new Map(spread.map((d) => [d.name, d.pos]));
    const originals = sorted.map((item) => item.pos);
    const finals = sorted.map((item) => spreadByName.get(item.name) ?? item.pos);
    const ranks = laneAssignment(originals, finals, connected);
    sorted.forEach((item, i) => {
      map.set(item.name, {
        extraDy: finals[i] - originals[i],
        inGroup: ranks[i].runSize > 1,
        rank: ranks[i].rank,
        lanesUsed: ranks[i].lanesUsed,
      });
    });
    return map;
  });
</script>

<g bind:this={groupEl}>
{#each lastPoints as { series: s, lastRow, seriesIndex } (s.name)}
  {@const xFn = resolveAccessor(s.x)}
  {@const yFn = resolveAccessor(s.y)}
  {@const seriesColor = paletteColor(seriesIndex, cfg.palette)}
  {@const offset = declutteredOffsets.get(s.name)}
  {@const extraDy = offset?.inGroup ? offset.extraDy : 0}
  {@const baseDx = font?.dx ?? defaultDx}
  {@const dir = Math.sign(baseDx) || 1}
  {@const numLanes = offset?.inGroup ? offset.lanesUsed : 0}
  {@const labelDx = offset?.inGroup
    ? dir * (elbowGap + (numLanes - 1) * laneStep + labelGap)
    : baseDx}
  {#if offset?.inGroup && plot.scales.x?.fn && plot.scales.y?.fn}
    {@const px = Number(plot.scales.x.fn(xFn(lastRow)))}
    {@const py = Number(plot.scales.y.fn(Number(yFn(lastRow))))}
    {@const laneX = px + dir * (elbowGap + offset.rank * laneStep)}
    {@const targetY = py + extraDy}
    <path
      d={`M ${px} ${py} H ${laneX} V ${targetY} H ${px + labelDx}`}
      fill="none"
      stroke={connector?.stroke ?? defaultConnectorColor}
      stroke-width={connector?.strokeWidth ?? defaultConnectorWidth}
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
</g>
