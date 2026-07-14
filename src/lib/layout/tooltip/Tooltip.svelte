<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Presentational tooltip positioned at `(x, y)` within a `position: relative`
   * parent. It is styled entirely from the `--dct-tooltip-*` variables that
   * {@link ChartContainer} stamps from the config, so it themes for free. Plots
   * that implement hovering can render this with their own content snippet.
   *
   * Placement is boundary-aware: it prefers sitting centered above the point,
   * but flips below when it would overflow the top and shifts horizontally
   * when it would overflow the left/right, so it always stays clear of the
   * `bounds` box (typically the plot's own width/height).
   */
  let {
    x,
    y,
    visible = true,
    background,
    color,
    bounds,
    plain = false,
    children,
  }: {
    x: number;
    y: number;
    visible?: boolean;
    background?: string;
    color?: string;
    /** Box the tooltip must stay within — usually the hosting plot's width/height. */
    bounds?: { width: number; height: number };
    /**
     * Drops the default dark box (background/padding/border) so a custom
     * `content` snippet fully owns its own look. Set whenever the caller
     * supplies `content` — the drop shadow and border radius still apply,
     * so a custom card can match its own corners via `--dct-tooltip-radius`.
     */
    plain?: boolean;
    children: Snippet;
  } = $props();

  const GAP = 10;
  const EDGE_MARGIN = 6;

  let boxWidth = $state(0);
  let boxHeight = $state(0);

  const placement = $derived.by(() => {
    const boundsWidth = bounds?.width ?? Infinity;
    const boundsHeight = bounds?.height ?? Infinity;

    let top = y - GAP - boxHeight;
    if (top < EDGE_MARGIN) top = y + GAP;
    top = Math.min(Math.max(top, EDGE_MARGIN), Math.max(EDGE_MARGIN, boundsHeight - boxHeight - EDGE_MARGIN));

    let left = x - boxWidth / 2;
    left = Math.min(Math.max(left, EDGE_MARGIN), Math.max(EDGE_MARGIN, boundsWidth - boxWidth - EDGE_MARGIN));

    return { left, top };
  });
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
