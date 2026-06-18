<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Presentational tooltip positioned at `(x, y)` within a `position: relative`
   * parent. It is styled entirely from the `--dct-tooltip-*` variables that
   * {@link ChartContainer} stamps from the config, so it themes for free. Plots
   * that implement hovering can render this with their own content snippet.
   */
  let {
    x,
    y,
    visible = true,
    background,
    color,
    children,
  }: {
    x: number;
    y: number;
    visible?: boolean;
    /** Optional per-instance overrides (e.g. a heatmap cell colour). */
    background?: string;
    color?: string;
    children: Snippet;
  } = $props();
</script>

{#if visible}
  <div
    class="dct-tooltip"
    style:left="{x}px"
    style:top="{y}px"
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
    transform: translate(-50%, -110%);
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
</style>
