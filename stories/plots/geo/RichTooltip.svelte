<script lang="ts">
  import GeoPlot from '$lib/plots/geo/Plot.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { makeColorScale } from '$lib/utils/color';
  import { argentinaBicontinental } from '$lib/plots/geo/projections/argentina';
  import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from './data';
  import type { GeoFeature } from '$lib/types/plots/geo/common';

  const cfg = getConfiguration();

  const VALUE_DOMAIN: [number, number] = [190_000, 17_600_000];
  const colorScale = makeColorScale(VALUE_DOMAIN[0], VALUE_DOMAIN[1], cfg.continuous.min, cfg.continuous.max);
</script>

{#snippet content({ rows }: { rows: GeoFeature<ArgentinaProvinceProps>[] })}
  {@const feature = rows[0]}
  {#if feature}
    <div class="rich-tooltip">
      <div class="rich-tooltip__header">{feature.properties!.nombre}</div>
      <div class="rich-tooltip__body">
        <div class="rich-tooltip__row">
          <span class="rich-tooltip__label">
            <span class="rich-tooltip__swatch" style:background={colorScale(feature.properties!.population)}></span>
            Population
          </span>
          <span class="rich-tooltip__value">{feature.properties!.population.toLocaleString()}</span>
        </div>
      </div>
      <div class="rich-tooltip__footer">Approximate 2022 census (INDEC) figures</div>
    </div>
  {/if}
{/snippet}

<div class="rich-tooltip-demo">
  <GeoPlot
    width={950}
    height={500}
    data={ARGENTINA_PROVINCES}
    featureId={(f) => f.properties!.nombre}
    value={(f) => f.properties!.population}
    scales={{ projection: { type: argentinaBicontinental }, color: { domain: VALUE_DOMAIN } }}
    tooltip={{
      facetId: '',
      sync: false,
      format: (f) => `${f.properties!.nombre}: ${f.properties!.population.toLocaleString()}`,
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
    text-transform: capitalize;
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
