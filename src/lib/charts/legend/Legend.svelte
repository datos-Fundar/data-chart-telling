<script lang="ts">
  import type { LegendSection } from '$lib/types/charts/legend';
  import DiscreteSection from '$lib/charts/legend/DiscreteSection.svelte';
  import ContinuousSection from '$lib/charts/legend/ContinuousSection.svelte';

  /**
   * Renders one or more legend sections side by side, dispatching each to the
   * matching section renderer. Discrete and continuous sections can be mixed.
   */
  let { sections }: { sections: LegendSection[] } = $props();
</script>

<div class="dct-legend">
  {#each sections as section, i (section.title ?? i)}
    <div class="dct-legend__section">
      {#if section.title}
        <div class="dct-legend__title">{section.title}</div>
      {/if}
      {#if section.type === 'discrete'}
        <DiscreteSection {section} />
      {:else if section.type === 'continuous'}
        <ContinuousSection {section} />
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
