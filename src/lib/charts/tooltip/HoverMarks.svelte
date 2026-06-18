<script lang="ts">
  import { RuleX, RuleY, Dot, Text } from 'svelteplot';
  import type { XValue } from '$lib/types/plots/common';

  /**
   * In-SVG hover highlight, rendered *inside* a `<Plot>`. Because it positions
   * itself through the host plot's scales, it places the same coordinate
   * correctly in every facet — that is what makes cross-facet sync work without
   * any pixel math. Draws optional x/y crosshair rules plus a dot + value label
   * for each matched point.
   */
  let {
    points,
    ruleX = null,
    ruleY = null,
    color = 'currentColor',
    showLabels = true,
  }: {
    points: { x: XValue; y: XValue | number; label?: string }[];
    ruleX?: XValue | null;
    ruleY?: XValue | number | null;
    color?: string;
    showLabels?: boolean;
  } = $props();
</script>

{#if ruleX != null}
  <RuleX
    data={[{ v: ruleX }]}
    x={(d) => d.v}
    stroke={color}
    strokeOpacity={0.35}
    strokeWidth={1.5}
    strokeDasharray="4 4"
  />
{/if}

{#if ruleY != null}
  <RuleY
    data={[{ v: ruleY }]}
    y={(d) => d.v}
    stroke={color}
    strokeOpacity={0.35}
    strokeWidth={1.5}
    strokeDasharray="4 4"
  />
{/if}

{#if points.length > 0}
  <Dot
    data={points}
    x={(d) => d.x}
    y={(d) => d.y}
    r={4.5}
    fill={color}
    stroke="white"
    strokeWidth={1.5}
  />
  {#if showLabels}
    <Text
      data={points}
      x={(d) => d.x}
      y={(d) => d.y}
      text={(d) => d.label ?? ''}
      fill={color}
      fontSize={12}
      fontWeight={700}
      dy={-10}
      stroke="white"
      strokeWidth={3}
      paintOrder="stroke"
    />
  {/if}
{/if}
