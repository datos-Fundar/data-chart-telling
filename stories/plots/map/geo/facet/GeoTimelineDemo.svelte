<script lang="ts">
	import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
	import Scrubber from '../../../../common/Scrubber.svelte';
	import { ARGENTINA_PROVINCES } from '../data';
	import type { GeoFeature } from '$lib/types/plots/data/geo';
	import { provincePopulation } from '../channels';
	import { WEATHER_STATIONS } from '$datasets';

	const YEARS = [2010, 2015, 2020, 2025];

	// Long format: each province's geometry repeated once per year, with that
	// year's (illustrative) population growth in its properties.
	const PROVINCES_BY_YEAR = YEARS.flatMap((year, i) =>
		ARGENTINA_PROVINCES.map((f) => ({
			...f,
			properties: {
				...f.properties!,
				year,
				population: Math.round(
					f.properties!.population * (0.85 + 0.05 * i + 0.01 * (f.properties!.nombre.length % 5))
				)
			}
		}))
	) as GeoFeature<Record<string, unknown>>[];

	// Mercator can't draw the Antarctic sector of Tierra del Fuego - drop it, as the other Argentina stories do.
	const TIERRA_DEL_FUEGO = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';
	function isAntarcticPart(
		part: { centroid: [number, number] },
		feature: { __id: string }
	): boolean {
		return feature.__id === TIERRA_DEL_FUEGO && (part.centroid[1] < -60 || part.centroid[0] > -50);
	}

	// Each station's reading per year - a marker's own rows slice by the same field.
	const READINGS = YEARS.flatMap((year, i) =>
		WEATHER_STATIONS.map((s, j) => ({ ...s, year, tempC: s.tempC + ((i + j) % 4) - 1 }))
	);
</script>

<Scrubber initial={0}>
	{#snippet children({ progress })}
		<GeoPlot
			width={560}
			height={640}
			title="Population and temperature, year by year"
			subtitle="One timeline slices the provinces and the stations' readings"
			data={PROVINCES_BY_YEAR}
			featureId={(f) => String(f.properties?.nombre)}
			color={provincePopulation}
			excludeParts={isAntarcticPart}
			scales={{ color: { scheme: 'blues' } }}
			coordinates={{ projection: { type: 'mercator', domain: 'data' } }}
			markers={[
				{
					type: 'dot',
					data: READINGS.filter((d) => d.lon > -75 && d.lat < -20),
					x: 'lon',
					y: 'lat',
					r: (d) => (d as { tempC: number }).tempC / 4,
					styles: { dotFill: '#dc2626' }
				}
			]}
			timeline={{ accessor: 'year', type: 'rule', progress, orientation: 'horizontal' }}
		/>
	{/snippet}
</Scrubber>
