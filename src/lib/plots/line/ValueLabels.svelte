<script lang="ts" generics="TData extends Record<string, unknown>">
  import { SvelteMap } from 'svelte/reactivity';
  import { Text, usePlot } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { declutter1D, laneAssignment } from '$lib/plots/utils/declutter';
  import { disabledFillOverride, disabledStrokeOverride } from '$lib/plots/utils/legendDisabled';
  import { watchLabelOverflow } from '$lib/plots/utils/labelOverflow.svelte';
  import type { Series } from '$lib/types/plots/data/common';
  import type { ValuesStyle } from '$lib/types/layout/styles';
  import type { ValueAnchor } from '$lib/types/plots/constants';
  import type { LegendDisabledStyle } from '$lib/types/layout/legend';
  import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

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
    onOverflow,
    disabledFor,
    onHoverSeries,
    onHoverEnd,
  }: {
    lastPoints: { series: Series<TData>; lastRow: TData; seriesIndex: number }[];
    values: ValuesStyle | undefined;
    /** Reports how far the rendered labels overflow the plot's own content box, in pixels, on each side (0 = no overflow). */
    onOverflow?: (overflow: MarginOverflow) => void;
    /** Resolved legend/hover-isolate dimming style for a series, if any. */
    disabledFor?: (name: string) => LegendDisabledStyle | undefined;
    /** Fired when the pointer enters a label — only wired when hover-isolate is enabled. */
    onHoverSeries?: (name: string) => void;
    onHoverEnd?: () => void;
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
  const formatValue = $derived(values?.format ?? ((v: number, name: string) => `${name} - ${v}`));
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
  const fontSize = $derived(typeof font?.fontSize === 'number' ? font.fontSize : 12);

  const plot = usePlot();

  // ── Overflow measurement ─────────────────────────────────────────────────
  // Measures how far the rendered labels extend past the plot's own content
  // box and reports it to the caller (`Plot.svelte`), which grows its own
  // local margin state to fit — see `labelOverflow.svelte.ts` for the actual
  // `getBBox()` measurement. Reporting through a plain callback instead of
  // registering directly into svelteplot's *shared* margin-auto-sizing
  // context keeps this entirely local to one `<Plot>` instance: nothing here
  // is shared across instances, which is what made that old approach spike
  // CPU/memory into unresponsiveness when many instances mounted/unmounted
  // together (e.g. a multi-story docs page → single story).
  let groupEl: SVGGElement | undefined = $state();

  watchLabelOverflow({
    el: () => groupEl,
    bounds: () => {
      // getBBox() inside isn't itself tracked — depend on whatever actually
      // changes the rendered label layout so this re-measures.
      void lastPoints;
      void values;
      const xRange = plot.scales.x?.fn?.range?.()?.map(Number);
      const yRange = plot.scales.y?.fn?.range?.()?.map(Number);
      if (!xRange || !yRange) return undefined;
      return {
        left: Math.min(xRange[0], xRange[1]),
        right: Math.max(xRange[0], xRange[1]),
        top: Math.min(yRange[0], yRange[1]),
        bottom: Math.max(yRange[0], yRange[1]),
      };
    },
    onOverflow: (overflow) => onOverflow?.(overflow),
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
  {@const text = formatValue(Number(yFn(lastRow)), s.name)}
  {@const preferredTA = resolvedTextAnchor ?? defaultTA}
  {@const preferredLA = font?.lineAnchor ?? defaultLA}
  {@const disabled = disabledFor?.(s.name)}
  {@const disabledStroke = disabledStrokeOverride(disabled)}
  {@const disabledFill = disabledFillOverride(disabled)}
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
      stroke-opacity={connector?.strokeOpacity ?? disabledStroke?.strokeOpacity ?? 1}
      stroke-dasharray={connector?.strokeDasharray}
      stroke-linecap={connector?.strokeLinecap ?? 'square'}
      stroke-linejoin={connector?.strokeLinejoin ?? 'miter'}
    />
  {/if}
  <!-- svelteplot's Text mark never wires pointer handlers to its DOM node,
       despite declaring them in its types — a wrapping <g> catches the
       boundary crossing instead (pointerenter/leave fire on every ancestor). -->
  <g
    role="presentation"
    onpointerenter={onHoverSeries && (() => onHoverSeries(s.name))}
    onpointerleave={onHoverEnd}
  >
    <Text
      data={[lastRow]}
      x={xFn}
      y={yFn}
      text={() => text}
      dx={labelDx}
      dy={(font?.dy ?? defaultDy) + extraDy}
      textAnchor={preferredTA}
      lineAnchor={preferredLA}
      lineHeight={font?.lineHeight}
      rotate={font?.rotate}
      class={font?.class}
      textClass={font?.textClass}
      fill={font?.fill ?? seriesColor}
      fillOpacity={disabledFill?.fillOpacity}
      {fontSize}
      fontWeight={font?.fontWeight}
      fontStyle={font?.fontStyle}
      stroke={font?.stroke}
      strokeWidth={font?.strokeWidth}
      paintOrder={font?.paintOrder}
    />
  </g>
{/each}
</g>
