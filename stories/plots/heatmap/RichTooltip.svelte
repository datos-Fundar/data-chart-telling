<script lang="ts">
  import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { makeColorScale } from '$lib/utils/color';
  import { LIFE_EXPECTANCY_BY_PROVINCE_SEX, type ProvinceSexCell } from './data';

  const cfg = getConfiguration();

  const Z_DOMAIN: [number, number] = [70, 85];
  const colorScale = makeColorScale(Z_DOMAIN[0], Z_DOMAIN[1], cfg.continuous.min, cfg.continuous.max);
</script>

{#snippet content({ rows }: { rows: ProvinceSexCell[] })}
  {@const row = rows[0]}
  {#if row}
    <div class="rich-tooltip">
      <div class="rich-tooltip__header">{row.province} — {row.sex}</div>
      <div class="rich-tooltip__body">
        <div class="rich-tooltip__row">
          <span class="rich-tooltip__label">
            <span class="rich-tooltip__swatch" style:background={colorScale(row.value)}></span>
            Life expectancy
          </span>
          <span class="rich-tooltip__value">{row.value.toFixed(1)} yr</span>
        </div>
      </div>
      <div class="rich-tooltip__footer">Life expectancy at birth</div>
    </div>
  {/if}
{/snippet}

<div class="rich-tooltip-demo">
  <HeatmapPlot
    width={950}
    height={420}
    series={[
      { name: 'life_expectancy', x: 'province', y: 'sex', z: 'value', data: LIFE_EXPECTANCY_BY_PROVINCE_SEX },
    ]}
    scales={{ z: { domain: Z_DOMAIN } }}
    tooltip={{
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, sex, value } = row as ProvinceSexCell;
        return `${province} — ${sex}: ${value.toFixed(1)} yr`;
      },
      content,
    }}
  />
</div>

<style>
  .rich-tooltip-demo {
    --dct-tooltip-radius: 0.75rem;
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
