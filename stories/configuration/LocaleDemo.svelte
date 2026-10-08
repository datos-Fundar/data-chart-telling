<script lang="ts">
  import { untrack } from 'svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
  import type { Series } from '$lib/types/plots/data/common';
  import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';

  type Point = { region: string; value: number };

  let {
    data,
    ticks = undefined,
    compactDisplay = 'long',
  }: {
    data: Point[];
    /** Pins the Y axis to exactly these values, instead of letting it pick its own. */
    ticks?: number[];
    /** Fixed for this story - `axis.compactDisplay` only applies at mount time, so it can't be switched live like `axis.locale` can. */
    compactDisplay?: 'short' | 'long';
  } = $props();

  const series = $derived([
    { name: 'amount', x: 'region', y: 'value', data } satisfies Series<Point>,
  ]);
  const scales = $derived(
    ticks ? ({ y: { ticks } } satisfies AxisBasedScalesConfig<Point>) : undefined,
  );

  const LOCALES = [
    { key: 'es-AR', label: 'es-AR (default)' },
    { key: 'en-US', label: 'en-US' },
  ] as const;

  let active = $state<(typeof LOCALES)[number]['key']>('es-AR');

  // Plain (non-effect) statement, so it runs synchronously during this
  // component's own init - *before* its `<BarPlot>` child mounts and takes
  // its own one-time read of `axis.compactDisplay` (see `BasePlotLayout`).
  // An `$effect` here would fire only after that child has already mounted,
  // leaving `compactDisplay` stuck on whatever config was left over from
  // the previously-mounted story.
  resetConfiguration();
  setConfiguration({ axis: { locale: active, compactDisplay } });

  // Only `locale` needs to react to the button after that initial mount -
  // `setConfiguration` itself reads+writes the global config, so it must
  // stay out of this effect's own dependency tracking or every call would
  // re-trigger itself.
  $effect(() => {
    const locale = active;
    untrack(() => setConfiguration({ axis: { locale } }));
    return () => untrack(() => resetConfiguration());
  });
</script>

<div class="demo">
  <div class="demo__controls">
    <span class="demo__label">axis.locale:</span>
    {#each LOCALES as locale (locale.key)}
      <button class:active={active === locale.key} onclick={() => (active = locale.key)}>
        {locale.label}
      </button>
    {/each}
  </div>

  <p class="demo__hint">axis.compactDisplay: <code>{compactDisplay}</code></p>

  <BarPlot width={640} height={420} series={series} {scales} />
</div>

<style>
  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }
  .demo__controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .demo__label {
    font-family: ui-monospace, monospace;
    font-size: 0.8rem;
    opacity: 0.7;
  }
  .demo__controls button {
    padding: 0.3rem 0.8rem;
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    border-radius: 0.375rem;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
  .demo__controls button.active {
    background: #111827;
    color: white;
    border-color: #111827;
  }
  .demo__hint {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.75;
    font-family: ui-monospace, monospace;
  }
</style>
