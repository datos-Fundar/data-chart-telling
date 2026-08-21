<script lang="ts" generics="TData extends Record<string, unknown>">
  import { SvelteMap } from 'svelte/reactivity';
  import { Text, usePlot } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { declutter1D, laneAssignment } from '$lib/plots/utils/declutter';
  import { disabledFillOverride, disabledStrokeOverride } from '$lib/plots/utils/legendDisabled';
  import { watchLabelOverflow } from '$lib/plots/utils/labelOverflow.svelte';
  import type { Series } from '$lib/types/plots/data/common';
  import type { ValuesStyle } from '$lib/types/layout/styles';
  import type { ValueAnchor } from '$lib/types/plots/constants';
  import type { LegendDisabledStyle } from '$lib/types/layout/legend';
  import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

  /**
   * End-of-line value labels for `LinePlot`, with automatic collision
   * resolution and shared horizontal alignment across labels.
   */
  let {
    lastPoints,
    values,
    width,
    height,
    numericMargins,
    onOverflow,
    disabledFor,
    onHoverSeries,
    onHoverEnd,
  }: {
    lastPoints: { series: Series<TData>; lastRow: TData; color: string }[];
    values: ValuesStyle | undefined;
    /** Plot pixel size, used with `numericMargins` to compute the content box. */
    width: number;
    height: number;
    /** `BasePlotLayout`'s resolved margins, already numeric on every side. */
    numericMargins: { top: number; right: number; bottom: number; left: number };
    /** Reports how far the rendered labels overflow the plot's own content box, in pixels, on each side (0 = no overflow). */
    onOverflow?: (overflow: MarginOverflow) => void;
    /** Resolved legend/hover-isolate dimming style for a series, if any. */
    disabledFor?: (name: string) => LegendDisabledStyle | undefined;
    /** Fired when the pointer enters a label — only wired when hover-isolate is enabled. */
    onHoverSeries?: (name: string) => void;
    onHoverEnd?: () => void;
  } = $props();

  const cfg = $derived(getConfiguration());

  // Elbow-routed leader line geometry (pixels), configurable via
  // `setConfiguration({ line: { valueLabels: {...} } })`. `connectorColor`/
  // `connectorWidth` default to a neutral look rather than each series' own
  // colour, overridable per-plot via `values.strokeStyle`.
  const elbowGap = $derived(cfg.line.valueLabels.elbowGap);
  const laneStep = $derived(cfg.line.valueLabels.laneStep);
  const labelGap = $derived(cfg.line.valueLabels.labelGap);
  const defaultConnectorColor = $derived(cfg.line.valueLabels.connectorColor);
  const defaultConnectorWidth = $derived(cfg.line.valueLabels.connectorWidth);

  const font = $derived(values?.fontStyle);
  const connector = $derived(values?.strokeStyle);
  const formatValue = $derived(values?.format ?? ((v: number, name: string) => `${name} - ${v}`));
  const valAnchor = $derived<ValueAnchor>(values?.anchor ?? 'start');
  // 'outside' is handled separately by HoverMarker, so it's treated as unset here.
  const resolvedTextAnchor = $derived(font?.textAnchor === 'outside' ? undefined : font?.textAnchor);

  const defaultDx = $derived(valAnchor === 'start' ? 6 : valAnchor === 'end' ? -6 : 0);
  const baseDx = $derived(font?.dx ?? defaultDx);
  const dir = $derived(Math.sign(baseDx) || 1);
  const defaultDy = $derived(valAnchor === 'outside' ? -8 : 0);
  const defaultTA = $derived(
    valAnchor === 'start' ? ('start' as const) : valAnchor === 'end' ? ('end' as const) : ('middle' as const),
  );
  const defaultLA = $derived(valAnchor === 'outside' ? ('bottom' as const) : ('middle' as const));
  const fontSize = $derived(typeof font?.fontSize === 'number' ? font.fontSize : 12);

  const plot = usePlot();

  // Measures how far the rendered labels extend past the plot's content box
  // and reports it to the caller (`Plot.svelte`), which grows its own local
  // margin state to fit. Reported via a plain callback rather than
  // svelteplot's shared margin context, to keep it local per `<Plot>`
  // instance.
  let groupEl: SVGGElement | undefined = $state();

  watchLabelOverflow({
    el: () => groupEl,
    // Built from `width`/`height`/`numericMargins` rather than the live
    // scale's own `.range()`, which doesn't reconcile with an explicitly
    // sized `<Plot>`.
    bounds: () => {
      // getBBox() isn't tracked reactively — depend on whatever changes the
      // label layout so this re-measures.
      void lastPoints;
      void values;
      return {
        left: numericMargins.left,
        right: width - numericMargins.right,
        top: numericMargins.top,
        bottom: height - numericMargins.bottom,
      };
    },
    onOverflow: (overflow) => onOverflow?.(overflow),
  });

  /**
   * Pixel-space collision fix-up for end-point labels: resolves each
   * label's pixel Y through the live y-scale, then declutters those pixels
   * to find how far each needs to move to clear its neighbours (`extraDy`).
   * `rank`/`lanesUsed`/`runSize` come from `laneAssignment`, which turns the
   * decluttered runs into lane assignments.
   *
   * Every label reaches out to the same shared lane column (`reach`/
   * `laneReach`), not just the ones in its own cluster, so the whole set of
   * end-of-line labels lines up on one horizontal line. A label that didn't
   * need to move for collision avoidance still gets a connector to cover
   * the resulting gap — see the `aligned` gate in the markup below.
   */
  const declutteredOffsets = $derived.by(() => {
    const map = new SvelteMap<string, { extraDy: number; aligned: boolean; rank: number; reach: number; laneReach: number }>();
    if (lastPoints.length < 2) return map;
    const yScale = plot.scales.y?.fn;
    if (!yScale) return map;
    const minGap = Math.max(16, fontSize * 1.4);
    const items = lastPoints.map(({ series: s, lastRow }) => ({
      name: s.name,
      pos: Number(yScale(Number(resolveAccessor(s.y)(lastRow)))),
    }));
    const sorted = [...items].sort((a, b) => a.pos - b.pos);
    // Same content-box source as `watchLabelOverflow`'s `bounds()` above.
    const bounds: [number, number] = [numericMargins.top, height - numericMargins.bottom];
    const { positions: spread, connected } = declutter1D(items, minGap, bounds);
    const spreadByName = new Map(spread.map((d) => [d.name, d.pos]));
    const originals = sorted.map((item) => item.pos);
    const finals = sorted.map((item) => spreadByName.get(item.name) ?? item.pos);
    const ranks = laneAssignment(originals, finals, connected);

    const anyGrouped = ranks.some((r) => r.runSize > 1);
    const globalLanes = anyGrouped ? Math.max(...ranks.map((r) => r.lanesUsed)) : 1;
    const reach = elbowGap + (globalLanes - 1) * laneStep + labelGap;

    sorted.forEach((item, i) => {
      map.set(item.name, {
        extraDy: finals[i] - originals[i],
        aligned: anyGrouped,
        rank: ranks[i].rank,
        reach,
        laneReach: elbowGap + ranks[i].rank * laneStep,
      });
    });
    return map;
  });
</script>

<g bind:this={groupEl}>
{#each lastPoints as { series: s, lastRow, color: seriesColor } (s.name)}
  {@const xFn = resolveAccessor(s.x)}
  {@const yFn = resolveAccessor(s.y)}
  {@const offset = declutteredOffsets.get(s.name)}
  {@const extraDy = offset?.aligned ? offset.extraDy : 0}
  {@const labelDx = offset?.aligned ? dir * offset.reach : baseDx}
  {@const text = formatValue(Number(yFn(lastRow)), s.name)}
  {@const preferredTA = resolvedTextAnchor ?? defaultTA}
  {@const preferredLA = font?.lineAnchor ?? defaultLA}
  {@const disabled = disabledFor?.(s.name)}
  {@const disabledStroke = disabledStrokeOverride(disabled)}
  {@const disabledFill = disabledFillOverride(disabled)}
  {#if offset?.aligned && plot.scales.x?.fn && plot.scales.y?.fn}
    {@const px = Number(plot.scales.x.fn(xFn(lastRow)))}
    {@const py = Number(plot.scales.y.fn(Number(yFn(lastRow))))}
    {@const laneX = px + dir * offset.laneReach}
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
  <!-- Text marks don't wire pointer handlers; a wrapping <g> catches them instead. -->
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
