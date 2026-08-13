<script lang="ts" generics="TRow extends Record<string, unknown>">
  import type { Snippet } from 'svelte';
  import Tooltip from './Tooltip.svelte';
  import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';

  /**
   * The "resolve + render" step every hoverable plot repeats verbatim:
   * given the matched row(s) for the current hover and the author's
   * `format`/`content` config, decide what goes inside the floating
   * `Tooltip` — its own custom snippet (`content`, given every matched row)
   * or the newline-joined `format` text (the default). Shared by
   * `BasePlotLayout` (fed by the shared hover controller, used by every plot
   * kind including `GeoPlot`) and `InsetMarker` (which matches hover locally,
   * independent of that controller) so neither re-implements this branch.
   */
  let {
    visible,
    x,
    y,
    bounds,
    rows,
    format,
    content,
    anchorX,
    anchorY,
  }: {
    visible: boolean;
    x: number;
    y: number;
    /** Box the tooltip must stay within — see `Tooltip`'s own `bounds` doc. */
    bounds: { width: number; height: number };
    /** Every row the current hover matched — passed to `content` as-is; joined via `format` otherwise. */
    rows: TRow[];
    format: (row: TRow) => string;
    /** Custom tooltip body; replaces the joined `format` text when given. */
    content?: Snippet<[{ rows: TRow[] }]>;
    /** Preferred anchor — forwarded to `Tooltip` as-is; `undefined` falls through to its own system default. */
    anchorX?: TooltipAnchorX;
    anchorY?: TooltipAnchorY;
  } = $props();
</script>

{#if visible}
  <Tooltip {x} {y} {bounds} plain={!!content} {anchorX} {anchorY}>
    {#if content}
      {@render content({ rows })}
    {:else}
      {rows.map(format).join('\n')}
    {/if}
  </Tooltip>
{/if}
