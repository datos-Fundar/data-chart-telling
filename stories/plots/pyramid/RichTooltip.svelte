<script lang="ts">
  import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../data/population-pyramid';

  const cfg = getConfiguration();
  const DATA = POPULATION_PYRAMID.filter((d) => d.year === 2022);

  // Series are sorted alphabetically inside PyramidPlot ('Mujeres' < 'Varones'),
  // which is also what drives left/right placement and colour assignment —
  // kept in lockstep here since `content` only gets the raw rows back, not
  // their resolved side/colour.
  const SERIES_COLORS: Record<string, string> = {
    Mujeres: paletteColor(0, cfg.palette),
    Varones: paletteColor(1, cfg.palette),
  };
</script>

{#snippet content({ rows }: { rows: PopulationRow[] })}
  {@const ageGroup = rows[0]?.ageGroup}
  {@const entries = rows
    .map((row) => ({ label: row.sex, color: SERIES_COLORS[row.sex], value: row.pct }))
    .sort((a, b) => b.value - a.value)}
  <div class="rich-tooltip">
    <div class="rich-tooltip__header">{ageGroup}</div>
    <div class="rich-tooltip__body">
      {#each entries as entry (entry.label)}
        <div class="rich-tooltip__row">
          <span class="rich-tooltip__label">
            <span class="rich-tooltip__swatch" style:background={entry.color}></span>
            {entry.label}
          </span>
          <span class="rich-tooltip__value">{entry.value.toFixed(1)}%</span>
        </div>
      {/each}
    </div>
    <div class="rich-tooltip__footer">Share of total population</div>
  </div>
{/snippet}

<div class="rich-tooltip-demo">
  <PyramidPlot
    width={950}
    height={520}
    data={DATA}
    x="pct"
    y="ageGroup"
    z="sex"
    scales={{ y: { domain: AGE_GROUPS } }}
    tooltip={{
      facetId: '',
      sync: false,
      format: (row) => {
        const { sex, ageGroup, pct } = row as PopulationRow;
        return `${sex} - ${ageGroup}: ${pct.toFixed(1)}%`;
      },
      content,
    }}
  />
</div>

<style>
  .rich-tooltip {
    min-width: 200px;
    background: #fff;
    color: #1f2937;
    border-radius: 0.75rem;
    overflow: hidden;
    font-family: ui-sans-serif, system-ui, sans-serif;
  }

  .rich-tooltip__header {
    padding: 0.6rem 0.9rem;
    font-weight: 700;
    font-size: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .rich-tooltip__body {
    padding: 0.2rem 0.9rem;
  }

  .rich-tooltip__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.35rem 0;
    font-size: 0.85rem;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
  }

  .rich-tooltip__row:last-child {
    border-bottom: none;
  }

  .rich-tooltip__label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }

  .rich-tooltip__swatch {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .rich-tooltip__value {
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .rich-tooltip__footer {
    padding: 0.45rem 0.9rem;
    font-size: 0.7rem;
    font-style: italic;
    color: rgba(0, 0, 0, 0.5);
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(0, 0, 0, 0.02);
  }
</style>
