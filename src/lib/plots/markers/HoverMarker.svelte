<script lang="ts">
  import { RuleX, RuleY } from 'svelteplot';
  import DotMarker from './DotMarker.svelte';
  import TextMarker from './TextMarker.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { MarkerProps } from '$lib/types/plots/markers';
  import type { AxisValue } from '$lib/types/plots/common';
  import type { DotStyle, FontStyle, StrokeStyle } from '$lib/types/plots/styles';
  import type { HoverDisplayPoint } from '$lib/types/layout/tooltip';

  /**
   * In-SVG hover highlight, rendered *inside* a `<Plot>`. Because it positions
   * itself through the host plot's scales, it places the same coordinate
   * correctly in every facet — that is what makes cross-facet sync work without
   * any pixel math. Draws optional x/y crosshair rules plus a dot + value label
   * for each matched point.
   */
  interface Props extends MarkerProps<HoverDisplayPoint> {
    ruleX?: AxisValue | null;
    ruleY?: AxisValue | null;
    showLabels?: boolean;
    format?: (point: HoverDisplayPoint) => string;
    ruleStyle?: StrokeStyle;
    dotStyle?: DotStyle;
    fontStyle?: FontStyle;
  }

  let {
    data = [],
    ruleX = null,
    ruleY = null,
    showLabels = true,
    format,
    ruleStyle,
    dotStyle,
    fontStyle,
    seriesColor,
  }: Props = $props();

  const cfg = $derived(getConfiguration());

  /** Explicit style wins; otherwise fall back to the series color, then the point's own resolved color. */
  const resolveColor = (explicit: string | undefined, point: HoverDisplayPoint) =>
    explicit ?? seriesColor ?? point.color;

  // Horizontal gap between the dot's edge and an 'outside'-anchored label —
  // scales with the dot's own resolved radius so the label clears it.
  const dotRadius = $derived(dotStyle?.dotRadius ?? cfg.hover.dot.dotRadius ?? 5);

  /**
   * Resolves `fontStyle.textAnchor: 'outside'` into a per-point anchor +
   * offset, mirroring the value-label `'outside'` anchor's own left/right
   * split (see pyramid/bar's own `ValueAnchor` handling): a positive `x`
   * anchors `'start'` and nudges right, a negative `x` anchors `'end'` and
   * nudges left — so a diverging mark's label sits on the side of the dot
   * away from zero, on whichever side that dot itself landed. Only
   * meaningful when the point's `x` is numeric (e.g. pyramid's magnitude
   * axis); anything else falls through to the plain `fontStyle` unchanged.
   *
   * Also overrides `cfg.hover.font`'s default `dy: -18` (meant for a label
   * floating *above* the dot) back to vertically centered, and clears the
   * dot's own radius horizontally instead of the flat default nudge, so the
   * label doesn't collide with the dot it's labeling.
   */
  function resolveFontStyle(point: HoverDisplayPoint) {
    if (fontStyle?.textAnchor !== 'outside' || typeof point.x !== 'number') {
      return { ...cfg.hover.font, ...fontStyle, fill: resolveColor(fontStyle?.fill, point) };
    }
    const outward = point.x >= 0;
    const gap = dotRadius + 5;
    return {
      ...cfg.hover.font,
      ...fontStyle,
      fill: resolveColor(fontStyle?.fill, point),
      textAnchor: outward ? ('start' as const) : ('end' as const),
      lineAnchor: fontStyle?.lineAnchor ?? ('middle' as const),
      dx: fontStyle?.dx ?? (outward ? gap : -gap),
      dy: fontStyle?.dy ?? 0,
    };
  }
</script>

{#if ruleX != null}
  <RuleX
    data={[{ v: ruleX }]}
    x={(d) => d.v}
    stroke={ruleStyle?.stroke ?? cfg.hover.rule.stroke}
    strokeOpacity={ruleStyle?.strokeOpacity ?? cfg.hover.rule.strokeOpacity}
    strokeWidth={ruleStyle?.strokeWidth ?? cfg.hover.rule.strokeWidth}
    strokeDasharray={ruleStyle?.strokeDasharray ?? cfg.hover.rule.strokeDasharray}
  />
{/if}

{#if ruleY != null}
  <RuleY
    data={[{ v: ruleY }]}
    y={(d) => d.v}
    stroke={ruleStyle?.stroke ?? cfg.hover.rule.stroke}
    strokeOpacity={ruleStyle?.strokeOpacity ?? cfg.hover.rule.strokeOpacity}
    strokeWidth={ruleStyle?.strokeWidth ?? cfg.hover.rule.strokeWidth}
    strokeDasharray={ruleStyle?.strokeDasharray ?? cfg.hover.rule.strokeDasharray}
  />
{/if}

{#if data.length > 0}
  {#each data as point (point.series ?? `${point.x}_${point.y}`)}
    <!-- Pixel nudge for plot kinds whose series position isn't fully captured
         by x/y alone (e.g. BarPlot's 'grouped' layout) — see HoverDisplayPoint.dx/dy. -->
    <g transform="translate({point.dx ?? 0}, {point.dy ?? 0})">
      <DotMarker
        data={[point]}
        x={(d) => d.x}
        y={(d) => d.y}
        style={{
          ...cfg.hover.dot,
          ...dotStyle,
          dotFill: resolveColor(dotStyle?.dotFill, point),
          dotStroke: resolveColor(dotStyle?.dotStroke, point),
        }}
      />
    </g>
  {/each}
  {#if showLabels}
    {#each data as point (point.series ?? `${point.x}_${point.y}`)}
      <g transform="translate({point.dx ?? 0}, {point.dy ?? 0})">
        <TextMarker
          data={[point]}
          x={(d) => d.x}
          y={(d) => d.y}
          text={(d) => format ? format(d) : (d.label ?? '')}
          style={resolveFontStyle(point)}
        />
      </g>
    {/each}
  {/if}
{/if}
