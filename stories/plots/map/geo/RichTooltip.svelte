<script lang="ts">
	import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { makeColorScale } from '$lib/utils/color';
	import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
	import TooltipCard from '../../../common/TooltipCard.svelte';
	import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from '$datasets/argentina-provinces';
	import type { GeoFeature } from '$lib/types/plots/data/geo';
	import { provincePopulation } from './channels';

	const cfg = getConfiguration();

	const VALUE_DOMAIN: [number, number] = [190_000, 17_600_000];
	const colorScale = makeColorScale(
		VALUE_DOMAIN[0],
		VALUE_DOMAIN[1],
		cfg.continuous.min,
		cfg.continuous.max
	);
</script>

{#snippet content({ rows }: { rows: GeoFeature<ArgentinaProvinceProps>[] })}
	{@const feature = rows[0]}
	{#if feature}
		<TooltipCard
			heading={feature.properties!.nombre}
			entries={[
				{
					label: 'Population',
					color: colorScale(feature.properties!.population),
					value: feature.properties!.population,
					display: feature.properties!.population.toLocaleString()
				}
			]}
			footer="Approximate 2022 census (INDEC) figures"
		/>
	{/if}
{/snippet}

<div class="rich-tooltip-demo">
	<GeoPlot
		width={950}
		height={500}
		data={ARGENTINA_PROVINCES}
		featureId={(f) => f.properties!.nombre}
		color={provincePopulation}
		scales={{ color: { domain: VALUE_DOMAIN } }}
		coordinates={{ projection: { type: argentinaBicontinental } }}
		tooltip={{
			sync: false,
			format: (f) => `${f.properties!.nombre}: ${f.properties!.population.toLocaleString()}`,
			content
		}}
	/>
</div>

<style>
	.rich-tooltip-demo {
		--dct-tooltip-radius: 0.75rem;
	}
</style>
