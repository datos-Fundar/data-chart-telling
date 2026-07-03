<script lang="ts">
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY, type YearPoint } from './data';

  const cfg = getConfiguration();

  // Series order matches the `series` array below, which is what drives
  // colour assignment inside LinePlot — kept in lockstep here since `content`
  // only gets the raw rows back, not their series name/colour.
  const SERIES_LABELS = ['Female', 'Male'];
  const SERIES_COLORS = [paletteColor(0, cfg.palette), paletteColor(1, cfg.palette)];
</script>

{#snippet content({ rows }: { rows: YearPoint[] })}
  {@const year = rows[0]?.year}
  {@const entries = rows
    .map((row, i) => ({ label: SERIES_LABELS[i], color: SERIES_COLORS[i], value: row.value }))
    .sort((a, b) => b.value - a.value)}
  <div class="rich-tooltip">
    <div class="rich-tooltip__header">{year}</div>
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
  <LinePlot
    width={950}
    height={400}
    series={[
      { name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
      { name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY },
    ]}
    tooltip={{
      facetId: '',
      sync: false,
      format: (row) => {
        const { year, value } = row as YearPoint;
        return `${year}: ${value.toFixed(1)} yr`;
      },
      content,
    }}
  />
</div>

<style>
  /* The library's default tooltip chrome (dark box + padding) is switched off
     via its CSS vars so `content` fully owns the look — only the drop shadow
     and radius are kept, matched to the card below. */
  .rich-tooltip-demo {
    --dct-tooltip-bg: transparent;
    --dct-tooltip-pad: 0;
    --dct-tooltip-radius: 0.75rem;
    --dct-tooltip-border: none;
  }

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
