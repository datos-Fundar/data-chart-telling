<script lang="ts">
  import DotMarker from './DotMarker.svelte';
  import TextMarker from './TextMarker.svelte';
  import RuleMarker from './RuleMarker.svelte';
  import BarMarker from './BarMarker.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { MarkerProps } from '$lib/types/markers/props';
  import type { HoverMarkerConfig } from '$lib/types/markers/common';
  import type { HoverDisplayPoint } from '$lib/types/layout/tooltip';

  /**
   * In-SVG hover highlight, rendered *inside* a `<Plot>`. Because it positions
   * itself through the host plot's scales, it places the same coordinate
   * correctly in every facet — that is what makes cross-facet sync work without
   * any pixel math. Draws optional x/y crosshair rules plus a dot + value label
   * for each matched point.
   *
   * Takes the raw `marker` config plus the couple of things it can't know on
   * its own — `activePoint` (the specific matched point actually under the
   * cursor, for the crosshair position; see `controller.svelte.ts`'s own doc
   * comment) and whether the active hover strategy implies a crosshair on
   * each axis by default — the same "component owns its own rendering"
   * pattern `BarMarker`/`RuleMarker` follow. `activePoint`/
   * `impliesCrosshairX`/`impliesCrosshairY` are all optional and default to
   * "no crosshair".
   *
   * `areaX`/`areaY` are a separate, always-explicit opt-in (no implied
   * default) for a thickened area highlight in place of the thin crosshair —
   * see `HoverMarkerConfig`'s own doc comment. Rendered via `BarMarker`'s
   * `role: 'highlight'`, so it renders nothing on an axis without a band
   * scale (e.g. a line/scatter plot's continuous axis).
   */
  interface Props extends MarkerProps<HoverDisplayPoint> {
    /** Narrowed to just the fields this component reads — `HoverMarkerConfig` also carries routing/scoping fields (`series`/`scope`/`strategy`/`sync`) it has no use for. */
    marker: Pick<
      HoverMarkerConfig,
      'ruleX' | 'ruleY' | 'areaX' | 'areaY' | 'showLabels' | 'format' | 'ruleStyle' | 'areaStyle' | 'dotStyle' | 'fontStyle'
    >;
    activePoint?: HoverDisplayPoint | null;
    impliesCrosshairX?: boolean;
    impliesCrosshairY?: boolean;
  }

  let {
    data = [],
    marker,
    activePoint = null,
    impliesCrosshairX = false,
    impliesCrosshairY = false,
    seriesColor,
  }: Props = $props();

  const cfg = $derived(getConfiguration());

  const showCrosshairX = $derived(marker.ruleX !== false && (impliesCrosshairX || marker.ruleX === true));
  const showCrosshairY = $derived(marker.ruleY !== false && (impliesCrosshairY || marker.ruleY === true));
  const ruleX = $derived(showCrosshairX ? (activePoint?.x ?? null) : null);
  const ruleY = $derived(showCrosshairY ? (activePoint?.y ?? null) : null);
  // areaX/areaY have no implied default — always off unless explicitly set.
  const areaX = $derived(marker.areaX === true ? (activePoint?.x ?? null) : null);
  const areaY = $derived(marker.areaY === true ? (activePoint?.y ?? null) : null);
  const showLabels = $derived(marker.showLabels ?? true);
  const format = $derived(marker.format);
  const ruleStyle = $derived(marker.ruleStyle);
  const areaStyle = $derived({ ...cfg.hover.area, ...marker.areaStyle });
  const dotStyle = $derived(marker.dotStyle);
  const fontStyle = $derived(marker.fontStyle);

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

{#if areaX != null}
  <BarMarker
    marker={{
      type: 'bar',
      role: 'highlight',
      isHorizontal: false,
      data: [],
      category: areaX,
      style: areaStyle,
    }}
  />
{/if}

{#if areaY != null}
  <BarMarker
    marker={{
      type: 'bar',
      role: 'highlight',
      isHorizontal: true,
      data: [],
      category: areaY,
      style: areaStyle,
    }}
  />
{/if}

{#if ruleX != null}
  <RuleMarker axis="x" value={ruleX} style={{ ...cfg.hover.rule, ...ruleStyle }} />
{/if}

{#if ruleY != null}
  <RuleMarker axis="y" value={ruleY} style={{ ...cfg.hover.rule, ...ruleStyle }} />
{/if}

{#if data.length > 0}
  {#each data as point (`${point.series ?? ''}_${point.x}_${point.y}`)}
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
    {#each data as point (`${point.series ?? ''}_${point.x}_${point.y}`)}
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
