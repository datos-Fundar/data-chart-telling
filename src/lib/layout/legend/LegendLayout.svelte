<script lang="ts">
  import type { LegendItemsLayout, LegendSection } from '$lib/types/layout/legend';
  import DiscreteSection from '$lib/layout/legend/DiscreteSection.svelte';
  import ContinuousSection from '$lib/layout/legend/ContinuousSection.svelte';
  import SizeSection from '$lib/layout/legend/SizeSection.svelte';
  import SymbolSection from '$lib/layout/legend/SymbolSection.svelte';

  /**
   * Renders one or more legend sections side by side, dispatching each to the
   * matching section renderer. Discrete, continuous, size and symbol sections can be mixed.
   * A lone discrete section's items default to horizontal flow; vertical once
   * a second section joins. A section's own `layout` always wins.
   */
  let { sections }: { sections: LegendSection[] } = $props();
  const defaultItemsLayout = $derived<LegendItemsLayout>(
    sections.length === 1 ? { type: 'horizontal' } : { type: 'vertical' }
  );
</script>

<div class="dct-legend">
  {#each sections as section, i (section.title ?? i)}
    <div class="dct-legend__section">
      {#if section.title}
        <div class="dct-legend__title">{section.title}</div>
      {/if}
      {#if section.type === 'discrete'}
        <DiscreteSection {section} {defaultItemsLayout} />
      {:else if section.type === 'continuous'}
        <ContinuousSection {section} />
      {:else if section.type === 'size'}
        <SizeSection {section} />
      {:else if section.type === 'symbol'}
        <SymbolSection {section} {defaultItemsLayout} />
      {/if}
    </div>
  {/each}
</div>

<style>
  .dct-legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--dct-legend-gap, 0.5rem 2rem);
    align-items: flex-start;
    font-family: var(--dct-legend-font, inherit);
    color: var(--dct-legend-color, inherit);
  }
  .dct-legend__section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }
  .dct-legend__title {
    font-size: var(--dct-legend-title-size, 0.875rem);
    font-weight: var(--dct-legend-title-weight, 500);
  }
</style>
