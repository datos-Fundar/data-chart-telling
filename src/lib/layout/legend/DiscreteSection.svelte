<script lang="ts">
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import type { DiscreteLegendSection } from '$lib/types/charts/legend';
  import type { LineStyle } from '$lib/types/plots/constants';

  let { section }: { section: DiscreteLegendSection } = $props();

  const cfg = $derived(getConfiguration());
  const columns = $derived(section.columns ?? 1);

  function dashArray(style?: LineStyle): string | undefined {
    switch (style) {
      case 'dashed':
        return '2,5';
      case 'dotted':
        return '1,4';
      case 'dashdot':
        return '5,3,1,3';
      default:
        return undefined;
    }
  }
</script>

<div class="dct-discrete" style:grid-template-columns="repeat({columns}, max-content)">
  {#each section.items as item, i (item.name)}
    {@const color = item.color ?? paletteColor(i, cfg.palette)}
    <div class="dct-discrete__item" style:opacity={item.opacity ?? 1}>
      <svg class="dct-discrete__swatch" viewBox="0 0 15 10">
        {#if item.symbol === 'circle'}
          <circle cx="5" cy="5" r="4" fill={color} />
        {:else if item.symbol === 'square'}
          <rect x="1" y="1" width="8" height="8" rx="2" fill={color} />
        {:else if item.symbol === 'triangle'}
          <path
            d="M 6 2 L 9 7.5 A 1.5 1.5 0 0 1 7.8 10 L 2.2 10 A 1.5 1.5 0 0 1 1 7.5 L 4 2 A 1.5 1.5 0 0 1 6 2"
            fill={color}
            transform="translate(0,-1)"
          />
        {:else if item.symbol === 'line'}
          <line
            x1="2"
            y1="5"
            x2="13"
            y2="5"
            stroke={color}
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray={dashArray(item.lineStyle)}
          />
        {:else}
          <rect x="1" y="1" width="8" height="8" fill={color} />
        {/if}
      </svg>
      <span class="dct-discrete__label">{item.label || item.name}</span>
    </div>
  {/each}
</div>

<style>
  .dct-discrete {
    display: grid;
    column-gap: 1.25rem;
    row-gap: 0.4rem;
    max-width: 100%;
  }
  .dct-discrete__item {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  }
  .dct-discrete__swatch {
    width: var(--dct-legend-swatch, 1.25rem);
    height: var(--dct-legend-swatch, 1.25rem);
    flex-shrink: 0;
  }
  .dct-discrete__label {
    font-size: var(--dct-legend-size, 0.875rem);
    font-weight: var(--dct-legend-weight, 400);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
</style>
