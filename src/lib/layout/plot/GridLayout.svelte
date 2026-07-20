<script lang="ts" generics="TData extends Record<string, unknown>">
  import { GridX, GridY } from 'svelteplot';
  import type { AxisBasedScalesConfig } from '$lib/types/plots/props';

  /**
   * Grid lines for the plot kinds that have an x/y axis pair — opt-in via
   * `scales.x.grid`/`scales.y.grid` (svelteplot's own implicit grid is a
   * fixed, unstyled default, so this is drawn instead of that, not on top of
   * it — see `BasePlotLayout`'s `finalizeScale`, which strips `grid` from what
   * actually reaches `<Plot x y>`).
   */
  let { scales }: { scales?: AxisBasedScalesConfig<TData> } = $props();
</script>

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
