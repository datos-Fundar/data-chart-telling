<script lang="ts">
  import type { Snippet } from 'svelte';
  import { resolveTooltipPlacement } from './resolveTooltipPlacement';
  import type { TooltipAnchorX, TooltipAnchorY } from '$lib/types/layout/tooltip';

  /**
   * Tooltip at `(x, y)` inside a `position: relative` parent, themed by the
   * `--dct-tooltip-*` variables. It sits at `anchorX`/`anchorY` of the point
   * (default right and below) and moves to the other side when it would
   * overflow `bounds`.
   */
  let {
    x,
    y,
    visible = true,
    background,
    color,
    bounds,
    plain = false,
    anchorX = 'right',
    anchorY = 'bottom',
    children,
  }: {
    x: number;
    y: number;
    visible?: boolean;
    background?: string;
    color?: string;
    /** Box the tooltip must stay within - usually the hosting plot's width/height. */
    bounds?: { width: number; height: number };
    /** Drops the default box so a custom `content` snippet owns its look. */
    plain?: boolean;
    /** Preferred horizontal anchor relative to the cursor. Defaults to `'right'`. */
    anchorX?: TooltipAnchorX;
    /** Preferred vertical anchor relative to the cursor. Defaults to `'bottom'`. */
    anchorY?: TooltipAnchorY;
    children: Snippet;
  } = $props();

  let boxWidth = $state(0);
  let boxHeight = $state(0);

  const placement = $derived(
    resolveTooltipPlacement({ x, y, boxWidth, boxHeight, bounds, anchorX, anchorY }),
  );
</script>

{#if visible}
  <div
    class="dct-tooltip"
    class:dct-tooltip--plain={plain}
    bind:clientWidth={boxWidth}
    bind:clientHeight={boxHeight}
    style:left="{placement.left}px"
    style:top="{placement.top}px"
    style:background={background}
    style:color={color}
  >
    {@render children()}
  </div>
{/if}

<style>
  .dct-tooltip {
    position: absolute;
    z-index: 10;
    pointer-events: none;
    background: var(--dct-tooltip-bg, #111827);
    color: var(--dct-tooltip-color, #fff);
    font-size: var(--dct-tooltip-size, 0.8125rem);
    padding: var(--dct-tooltip-pad, 0.5rem 0.75rem);
    border-radius: var(--dct-tooltip-radius, 0.375rem);
    border: var(--dct-tooltip-border, none);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    white-space: pre-line;
    line-height: 1.35;
  }

  .dct-tooltip--plain {
    background: transparent;
    padding: 0;
    border: none;
  }
</style>
