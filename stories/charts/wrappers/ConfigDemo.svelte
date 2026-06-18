<script lang="ts">
  import { untrack } from 'svelte';
  import LineChart from '$lib/charts/kinds/LineChart.svelte';
  import HeatmapChart from '$lib/charts/kinds/HeatmapChart.svelte';
  import {
    setConfiguration,
    resetConfiguration,
    getConfiguration,
    type ChartConfigInput,
  } from '$lib/charts/config.svelte';
  import { TIME_SERIES, HEAT_CELLS, type SeriesPoint, type HeatCell } from '../data';
  import type { LegendSection } from '$lib/types/charts/legend';

  // ── Themes ────────────────────────────────────────────────────────────────────
  // Each is a partial config deep-merged over the defaults by `setConfiguration`.
  const THEMES: Record<string, ChartConfigInput> = {
    Default: {},
    Editorial: {
      font: 'Georgia, "Times New Roman", serif',
      color: '#2b2118',
      border: 'color-mix(in srgb, #2b2118 20%, transparent)',
      title: { size: '1.9rem', weight: 700, leading: '1.1', spacing: '-0.01em' },
      subtitle: { color: '#8a6d3b', size: '1.05rem' },
      caption: { color: '#8a6d3b' },
      palette: ['#9b2226', '#bb3e03', '#ca6702', '#ee9b00', '#005f73'],
      continuous: { min: '#fff3e0', max: '#bb3e03', labelColor: '#2b2118' },
      axis: { color: '#8a6d3b', fontSize: 13, tickSize: 6 },
      line: { strokeWidth: 4, dotRadius: 5 },
      timeline: { activeColor: '#bb3e03', axisColor: '#8a6d3b', thickness: 60 },
    },
    Dark: {
      font: 'ui-sans-serif, system-ui, sans-serif',
      color: '#e5e7eb',
      background: '#0f172a',
      border: 'color-mix(in srgb, #e5e7eb 18%, transparent)',
      title: { size: '1.6rem', weight: 600 },
      subtitle: { color: '#94a3b8' },
      caption: { color: '#94a3b8' },
      legend: { gap: '0.5rem 1.5rem', swatchSize: '1rem' },
      palette: ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc'],
      continuous: { min: '#1e293b', max: '#38bdf8', labelColor: '#e5e7eb' },
      axis: { color: '#94a3b8', fontSize: 13 },
      tooltip: { background: '#e5e7eb', color: '#0f172a' },
      line: { strokeWidth: 3, dotRadius: 4 },
      timeline: { activeColor: '#38bdf8', axisColor: '#94a3b8', thickness: 60 },
    },
    Compact: {
      title: { size: '1.1rem', weight: 600 },
      subtitle: { size: '0.85rem' },
      legend: { size: '0.75rem', swatchSize: '0.9rem', gap: '0.25rem 1rem' },
      axis: { fontSize: 11, tickSize: 3, tickPadding: 6 },
      margins: { top: 12, right: 12, bottom: 22, left: 30 },
      line: { strokeWidth: 2, dotRadius: 3 },
    },
  };

  let active = $state<keyof typeof THEMES>('Default');

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

  const cfg = $derived(getConfiguration());

  // Legends are built from the *live* config so the palette/gradient track theme.
  const lineLegend = $derived<LegendSection[]>([
    {
      type: 'discrete',
      title: 'Indicador',
      columns: 2,
      items: [
        { name: 'PBI', label: 'PBI', color: cfg.palette[0], symbol: 'line' },
        { name: 'Empleo', label: 'Empleo', color: cfg.palette[1], symbol: 'line' },
      ],
    },
  ]);

  const maxPct = Math.max(...HEAT_CELLS.map((d) => d.pct));
  const heatLegend = $derived<LegendSection[]>([
    {
      type: 'continuous',
      title: 'Porcentaje',
      min: 0,
      max: maxPct,
      colorMin: cfg.continuous.min,
      colorMax: cfg.continuous.max,
      ticks: [Math.round(maxPct * 0.5 * 1000) / 1000],
      format: (v) => `${(v * 100).toFixed(0)}%`,
      width: 180,
    },
  ]);

  const lineData = TIME_SERIES.filter((d) => d.region === 'Norte');
  const heatData = HEAT_CELLS.filter((d) => d.scenario === 'Base' && d.year === 2022);
</script>

<div class="demo">
  <div class="demo__controls">
    <span class="demo__label">setConfiguration:</span>
    {#each Object.keys(THEMES) as name (name)}
      <button class:active={active === name} onclick={() => (active = name as keyof typeof THEMES)}>
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
      legend={lineLegend}
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
      value={'pct' as keyof HeatCell}
      xLabel="Ambientes"
      yLabel="Personas"
      legend={heatLegend}
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
