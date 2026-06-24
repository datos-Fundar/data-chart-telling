<script lang="ts">
  import { untrack } from 'svelte';
  import LineChart from '$lib/charts/line/Chart.svelte';
  import HeatmapChart from '$lib/charts/heatmap/Chart.svelte';
  import {
    setConfiguration,
    resetConfiguration,
  } from '$lib/configuration/config.svelte';
  import { THEMES, type ThemeName } from '$lib/configuration/themes';
  import { TIME_SERIES, type SeriesPoint } from '../data/time-series';
  import { HEAT_CELLS, type HeatCell } from '../data/heat-cells';

  let active = $state<ThemeName>('Default');

  // Apply the active theme. We track ONLY `active`; the config read/write is
  // untracked, otherwise `setConfiguration` (which reads `current` to merge and
  // then writes it) would make this effect depend on the very state it sets —
  // an infinite loop. Cleanup restores defaults (the config is a global
  // singleton) before each re-run and on unmount.
  $effect(() => {
    const theme = active;
    untrack(() => {
      resetConfiguration();
      setConfiguration(THEMES[theme]);
    });
    return () => untrack(() => resetConfiguration());
  });

  const maxPct = Math.max(...HEAT_CELLS.map((d) => d.pct));
  const lineData = TIME_SERIES.filter((d) => d.region === 'Norte');
  const heatData = HEAT_CELLS.filter((d) => d.scenario === 'Base' && d.year === 2022);
</script>

<div class="demo">
  <div class="demo__controls">
    <span class="demo__label">setConfiguration:</span>
    {#each Object.keys(THEMES) as name (name)}
      <button class:active={active === name} onclick={() => (active = name as ThemeName)}>
        {name}
      </button>
    {/each}
  </div>

  <p class="demo__hint">
    One call — <code>setConfiguration(theme)</code> — restyles font, colours, palette,
    axis, spacing, legend and timeline across every chart at once.
  </p>

  <div class="demo__grid">
    <LineChart
      width={460}
      height={360}
      title="PBI vs. Empleo"
      subtitle="Tema: {active}"
      caption="La configuración es global y reactiva."
      data={lineData}
      x="year"
      y="value"
      z={'metric' as keyof SeriesPoint}
      legend={[
        {
          type: 'discrete',
          title: 'Indicador',
          columns: 2,
          items: [
            { name: 'PBI', label: 'PBI', symbol: 'line' },
            { name: 'Empleo', label: 'Empleo', symbol: 'line' },
          ],
        },
      ]}
    />
    <HeatmapChart
      width={460}
      height={360}
      title="Hogares por ambientes"
      subtitle="Tema: {active}"
      caption="Mismo sistema de configuración."
      data={heatData}
      x={'rooms' as keyof HeatCell}
      y={'people' as keyof HeatCell}
      z={'pct' as keyof HeatCell}
      scales={{ x: { label: 'Ambientes' }, y: { label: 'Personas' } }}
      legend={[
        {
          type: 'continuous',
          title: 'Porcentaje',
          min: 0,
          max: maxPct,
          ticks: [Math.round(maxPct * 0.5 * 1000) / 1000],
          format: (v) => `${(v * 100).toFixed(0)}%`,
          width: 180,
        },
      ]}
      formatValue={(v) => `${(v * 100).toFixed(0)}%`}
    />
  </div>
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
  }
  .demo__hint code {
    font-family: ui-monospace, monospace;
  }
  .demo__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }
</style>
