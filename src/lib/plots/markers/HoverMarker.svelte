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
    ruleStyle?: StrokeStyle;
    dotStyle?: DotStyle;
    fontStyle?: FontStyle;
  }

  let {
    data = [],
    ruleX = null,
    ruleY = null,
    showLabels = true,
    ruleStyle,
    dotStyle,
    fontStyle,
  }: Props = $props();

  const cfg = $derived(getConfiguration());
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
  <DotMarker
    {data}
    x={(d) => d.x}
    y={(d) => d.y}
    style={{ ...cfg.hover.dot, ...dotStyle }}
  />
  {#if showLabels}
    <TextMarker
      {data}
      x={(d) => d.x}
      y={(d) => d.y}
      text={(d) => d.label ?? ''}
      style={{ ...cfg.hover.font, ...fontStyle }}
    />
  {/if}
{/if}
