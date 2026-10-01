<script lang="ts" generics="TData extends Record<string, unknown>">
  import { AxisX, AxisY, GridX, GridY, usePlot } from 'svelteplot';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { tickStep, ticksInRange, naturalTickCount } from '$lib/layout/scales/niceDomain';
  import { DISCRETE_SCALE_TYPES } from '$lib/types/layout/scales';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';

  /**
   * Axis ticks/titles and grid lines for plot kinds with an x/y axis pair
   * (line/bar/heatmap/pyramid). Not used by `GeoPlot` (a map has no x/y axis
   * pair). The scale itself is resolved by `buildScale` and applied via
   * `BasePlotLayout`'s `<Plot x y>` — this only renders the cosmetics.
   */
  let {
    data,
    getX,
    getY,
    width,
    height,
    numericMargins,
    scales,
  }: {
    data: TData[];
    getX: (d: TData) => AxisValue;
    getY: (d: TData) => AxisValue;
    width: number;
    height: number;
    numericMargins: { top: number; right: number; bottom: number; left: number };
    scales?: AxisBasedScalesConfig<TData>;
  } = $props();

  const cfg = $derived(getConfiguration());
  const plot = usePlot();

  const xValues = $derived(data.map(getX));
  const yValues = $derived(data.map(getY));

  /**
   * `[min, max]` of a pinned `scale.domain` (if numeric), else the extent of
   * `values`. Deliberately *not* the live, fully-resolved scale off
   * `usePlot()` (e.g. `plot.scales.x.domain`), even though that would be
   * more accurate for a bar's implicit zero baseline or a stacked series'
   * cumulative total: reading it reactively here — inside a `$derived` that
   * itself feeds back into `<AxisX>`'s rendered tick content, which
   * `BasePlotLayout`'s own auto-margin sizing measures — closes a
   * live-scale ⇄ rendered-axis feedback loop that was observed to perturb
   * margin *settling* (a captured-and-frozen `bind:margins` value gained a
   * stray extra `left` entry it wasn't tracking before). `edgeInclusiveTicks`
   * instead sidesteps needing this axis's own real extent at all, by only
   * running when the *opposite* axis's resolved type says it's safe to.
   */
  function axisExtent(scale: AxisBasedScalesConfig<TData>['x'], values: AxisValue[]): [number, number] | undefined {
    const domainNumbers = scale?.domain?.filter((d): d is number => typeof d === 'number');
    const source = domainNumbers && domainNumbers.length >= 2 ? domainNumbers : values.filter((v): v is number => typeof v === 'number');
    if (source.length < 2) return undefined;
    const lo = Math.min(...source);
    const hi = Math.max(...source);
    return hi > lo ? [lo, hi] : undefined;
  }

  /** An axis paired with a discrete scale plays the "index" role for the pair, so *this* axis is the plain magnitude/value one (see `autoTickCount`, `edgeInclusiveTicks`). */
  const isDiscreteType = (type: string) => (DISCRETE_SCALE_TYPES as readonly string[]).includes(type);

  /**
   * Caps tick count to the axis's distinct value count, never above what
   * fits the pixel span — meaningful for an index-like axis (don't show more
   * ticks than there are actual data points), but not for a magnitude/value
   * one, where "how many bars there are" has nothing to do with how many
   * round numbers should label the axis (and can otherwise stop tick
   * generation short of `nice`'s own widened domain edge — the same
   * "opposite axis is discrete ⇒ this one's a value axis" signal
   * `edgeInclusiveTicks` uses). Skipped once the caller sets tick density
   * directly, or pins the domain.
   */
  function autoTickCount(
    oppositeType: string | undefined,
    scale: AxisBasedScalesConfig<TData>['x'],
    values: AxisValue[],
    span: number,
    spacing: number,
    min: number
  ): number | undefined {
    if (scale?.ticks != null || scale?.tickSpacing != null || scale?.interval != null || scale?.domain != null) return undefined;
    if (oppositeType != null && isDiscreteType(oppositeType)) return undefined;
    const uniqueCount = new Set(values.map(String)).size;
    const natural = naturalTickCount(span, spacing, min);
    return uniqueCount >= 2 && uniqueCount < natural ? uniqueCount : undefined;
  }

  /** Forces a whole-unit tick interval on an integer domain that spans fewer integers than the pixel span would naturally want ticks for. */
  function integerTickInterval(
    scale: AxisBasedScalesConfig<TData>['x'],
    values: AxisValue[],
    span: number,
    spacing: number,
    min: number
  ): number | undefined {
    if (scale?.ticks != null || scale?.tickSpacing != null || scale?.interval != null) return undefined;
    if (scale?.type != null && scale.type !== 'linear' && scale.type !== 'auto') return undefined;
    const extent = axisExtent(scale, values);
    if (!extent) return undefined;
    const [lo, hi] = extent;
    if (!Number.isInteger(lo) || !Number.isInteger(hi)) return undefined;
    return hi - lo < naturalTickCount(span, spacing, min) ? 1 : undefined;
  }

  const xSpan = $derived(Math.max(0, width - numericMargins.left - numericMargins.right));
  const ySpan = $derived(Math.max(0, height - numericMargins.top - numericMargins.bottom));

  const xTickCount = $derived(autoTickCount(plot.scales.y.type, scales?.x, xValues, xSpan, 80, 3));
  const yTickCount = $derived(autoTickCount(plot.scales.x.type, scales?.y, yValues, ySpan, 50, 2));

  const xTickInterval = $derived(integerTickInterval(scales?.x, xValues, xSpan, 80, 3));
  const yTickInterval = $derived(integerTickInterval(scales?.y, yValues, ySpan, 50, 2));

  /**
   * An axis's own natural "nice" ticks, plus the domain's exact endpoints
   * whenever a natural tick doesn't already land on them — so the axis
   * always labels the actual start/end of its real range, not just
   * whichever round numbers happen to fall inside it (which, per
   * `axisExtent`, may extend past the raw data — e.g. a bar's implicit zero
   * baseline).
   *
   * Only meaningful for an axis that plays the "series ran from here to
   * here" role — a time series' x, say — which is exactly the case where the
   * *opposite* axis is itself continuous (both this codebase's line/scatter
   * charts). When the opposite axis is discrete instead (a bar/pyramid's
   * category axis), *this* axis is really the plain magnitude/value one —
   * `84` isn't meaningfully "where the series ends" the way a last year is,
   * so forcing it onto the axis just crowds a round `80`/`90` tick for no
   * benefit. Skipped once the caller sets tick density/domain directly, same
   * guard as `autoTickCount`, or the axis isn't a plain continuous numeric
   * one (`integerTickInterval`'s domain check covers the same ground
   * `axisExtent` needs here).
   */
  function edgeInclusiveTicks(
    oppositeType: string | undefined,
    scale: AxisBasedScalesConfig<TData>['x'],
    values: AxisValue[],
    span: number,
    spacing: number,
    min: number
  ): number[] | undefined {
    if (scale?.ticks != null || scale?.tickSpacing != null || scale?.interval != null || scale?.domain != null) return undefined;
    if (oppositeType != null && isDiscreteType(oppositeType)) return undefined;
    if (scale?.type != null && scale.type !== 'linear' && scale.type !== 'auto') return undefined;
    const extent = axisExtent(scale, values);
    if (!extent) return undefined;
    const [lo, hi] = extent;
    const count = naturalTickCount(span, spacing, min);
    const step = tickStep(lo, hi, count);
    const base = ticksInRange(lo, hi, step);
    const eps = step * 1e-6;
    const withLo = base.length === 0 || base[0] - lo > eps ? [lo, ...base] : base;
    return withLo.length === 0 || hi - withLo[withLo.length - 1] > eps ? [...withLo, hi] : withLo;
  }

  const xTicksExplicit = $derived(edgeInclusiveTicks(plot.scales.y.type, scales?.x, xValues, xSpan, 80, 3));

  /** Vertical Y-axis title placement, when `scales.y.labelOrientation === 'vertical'`. */
  const verticalYLabel = $derived.by(() => {
    if (!scales?.y?.label || scales.y.labelOrientation !== 'vertical') return null;
    const position = scales.y.labelPosition ?? 'middle';
    const x = 14;
    const top = numericMargins.top;
    const bottom = height - numericMargins.bottom;
    const y = position === 'top' ? top : (top + bottom) / 2;
    return { text: scales.y.label, x, y, anchor: position === 'top' ? ('end' as const) : ('middle' as const) };
  });
</script>

<AxisX
  ticks={xTicksExplicit}
  tickCount={xTickCount}
  interval={xTickInterval}
  tickSize={scales?.x?.tickSize ?? cfg.axis.xTickSize}
  tickPadding={scales?.x?.tickPadding ?? cfg.axis.xTickPadding}
  tickFontSize={cfg.axis.fontSize}
  titleFontSize={scales?.x?.titleFontSize ?? cfg.axis.titleFontSize}
/>
<AxisY
  tickCount={yTickCount}
  interval={yTickInterval}
  tickSize={scales?.y?.tickSize ?? cfg.axis.yTickSize}
  tickPadding={scales?.y?.tickPadding ?? cfg.axis.yTickPadding}
  tickFontSize={cfg.axis.fontSize}
  titleFontSize={scales?.y?.titleFontSize ?? cfg.axis.titleFontSize}
/>
{#if verticalYLabel}
  <text
    x={verticalYLabel.x}
    y={verticalYLabel.y}
    transform="rotate(-90, {verticalYLabel.x}, {verticalYLabel.y})"
    text-anchor={verticalYLabel.anchor}
    font-size={scales?.y?.titleFontSize ?? cfg.axis.titleFontSize}
    fill={cfg.axis.color}
    opacity="0.8"
  >{verticalYLabel.text}</text>
{/if}
{#if scales?.x?.grid}
  <GridX
    stroke={typeof scales.x.grid === 'object' ? scales.x.grid.stroke : undefined}
    strokeWidth={typeof scales.x.grid === 'object' ? scales.x.grid.strokeWidth : undefined}
    strokeOpacity={typeof scales.x.grid === 'object' ? scales.x.grid.strokeOpacity : undefined}
    strokeDasharray={typeof scales.x.grid === 'object' ? scales.x.grid.strokeDasharray : undefined}
  />
{/if}
{#if scales?.y?.grid}
  <GridY
    stroke={typeof scales.y.grid === 'object' ? scales.y.grid.stroke : undefined}
    strokeWidth={typeof scales.y.grid === 'object' ? scales.y.grid.strokeWidth : undefined}
    strokeOpacity={typeof scales.y.grid === 'object' ? scales.y.grid.strokeOpacity : undefined}
    strokeDasharray={typeof scales.y.grid === 'object' ? scales.y.grid.strokeDasharray : undefined}
  />
{/if}
