<script lang="ts">
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import {
    FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
    MALE_LIFE_EXPECTANCY_BY_PROVINCE,
    type ProvincePoint,
  } from './data';

  const cfg = getConfiguration();

  // Series order matches the `series` array below, which is what drives
  // colour assignment inside BarPlot — kept in lockstep here since `content`
  // only gets the raw rows back, not their series name/colour.
  const SERIES_LABELS = ['Female', 'Male'];
  const SERIES_COLORS = [paletteColor(0, cfg.palette), paletteColor(1, cfg.palette)];
</script>

{#snippet content({ rows }: { rows: ProvincePoint[] })}
  {@const province = rows[0]?.province}
  {@const entries = rows
    .map((row, i) => ({ label: SERIES_LABELS[i], color: SERIES_COLORS[i], value: row.value }))
    .sort((a, b) => b.value - a.value)}
  <div class="rich-tooltip">
    <div class="rich-tooltip__header">{province}</div>
    <div class="rich-tooltip__body">
      {#each entries as entry (entry.label)}
        <div class="rich-tooltip__row">
          <span class="rich-tooltip__label">
            <span class="rich-tooltip__swatch" style:background={entry.color}></span>
            {entry.label}
          </span>
          <span class="rich-tooltip__value">{entry.value.toFixed(1)} yr</span>
        </div>
      {/each}
    </div>
    <div class="rich-tooltip__footer">Life expectancy at birth</div>
  </div>
{/snippet}

<div class="rich-tooltip-demo">
  <BarPlot
    width={950}
    height={500}
    series={[
      { name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE },
      { name: 'male', x: 'province', y: 'value', data: MALE_LIFE_EXPECTANCY_BY_PROVINCE },
    ]}
    tooltip={{
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, value } = row as ProvincePoint;
        return `${province}: ${value.toFixed(1)} yr`;
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
