<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ChartBoxSnippet } from '$lib/types/charts/common';
  import { getConfiguration, configToCssVars, cssVarsStyle } from '$lib/configuration/config.svelte';

  /**
   * The outermost chart frame. It owns the fixed footprint (`width`/`height`),
   * lays out the header, optional legend and caption, and measures whatever
   * space is left for the plot. The actual drawing is delegated to the `plot`
   * snippet, which receives that measured box — so this component knows nothing
   * about what kind of plot it wraps.
   */
  let {
    width,
    height,
    title,
    subtitle,
    caption,
    legend,
    plot,
  }: {
    width: number;
    height: number;
    title?: string;
    subtitle?: string;
    caption?: string;
    legend?: Snippet;
    plot: ChartBoxSnippet;
  } = $props();

  let bodyWidth = $state(0);
  let bodyHeight = $state(0);

  // Stamp every `--dct-*` custom property on the root so the scoped styles below
  // (and any nested plot/legend/timeline) resolve them from the live config.
  const themeStyle = $derived(cssVarsStyle(configToCssVars(getConfiguration())));
</script>

<div class="dct-chart" style={themeStyle} style:width="{width}px" style:height="{height}px">
  {#if title || subtitle}
    <div class="dct-chart__header">
      {#if title}<h3 class="dct-chart__title">{title}</h3>{/if}
      {#if subtitle}<span class="dct-chart__subtitle">{subtitle}</span>{/if}
    </div>
  {/if}

  {#if legend}
    <div class="dct-chart__legend">{@render legend()}</div>
  {/if}

  <div
    class="dct-chart__body"
    bind:clientWidth={bodyWidth}
    bind:clientHeight={bodyHeight}
  >
    {#if bodyWidth > 0 && bodyHeight > 0}
      {@render plot({ width: bodyWidth, height: bodyHeight })}
    {/if}
  </div>

  {#if caption}
    <div class="dct-chart__caption">
      <span>{caption}</span>
    </div>
  {/if}
</div>

<style>
  .dct-chart {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
    color: var(--dct-fg, currentColor);
    background: var(--dct-bg, transparent);
    font-family: var(--dct-font, inherit);
  }

  .dct-chart__header {
    flex: 0 0 auto;
    padding: var(--dct-header-pad, 0.75rem 0 1rem);
    border-bottom: 1px solid var(--dct-border, color-mix(in srgb, currentColor 15%, transparent));
  }

  .dct-chart__title {
    margin: 0 0 0.4rem;
    font-family: var(--dct-title-font, inherit);
    font-size: var(--dct-title-size, 1.5rem);
    font-weight: var(--dct-title-weight, 500);
    line-height: var(--dct-title-leading, 1.2);
    letter-spacing: var(--dct-title-spacing, normal);
    color: var(--dct-title-color, inherit);
  }

  .dct-chart__subtitle {
    font-family: var(--dct-subtitle-font, inherit);
    font-size: var(--dct-subtitle-size, 1rem);
    font-weight: var(--dct-subtitle-weight, 400);
    line-height: var(--dct-subtitle-leading, 1.3);
    letter-spacing: var(--dct-subtitle-spacing, normal);
    color: var(--dct-subtitle-color, inherit);
  }

  .dct-chart__legend {
    flex: 0 0 auto;
    padding: var(--dct-legend-pad, 0.75rem 0);
  }

  .dct-chart__body {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
  }

  .dct-chart__caption {
    flex: 0 0 auto;
    padding: var(--dct-caption-pad, 0.5rem 0);
    font-family: var(--dct-caption-font, inherit);
    font-size: var(--dct-caption-size, 0.75rem);
    font-weight: var(--dct-caption-weight, 400);
    line-height: var(--dct-caption-leading, 1.3);
    letter-spacing: var(--dct-caption-spacing, normal);
    color: var(--dct-caption-color, inherit);
    white-space: pre-line;
  }
</style>
