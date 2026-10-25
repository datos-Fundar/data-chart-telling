<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { GeoMarkersConfig } from '$lib/types/markers/geo';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import { WORLD_COUNTRIES } from '$datasets/world-countries';
	import { NAPOLEONS_RIVERS } from '$datasets/napoleons-rivers';
	import {
		NAPOLEONS_CITIES,
		NAPOLEONS_SIZE_LABELS,
		NAPOLEONS_LABEL_ROWS,
		NAPOLEONS_ARMY
	} from '$datasets';
	import {
		MINARD_STEPS,
		MINARD_STEP_VALUES,
		MINARD_PROJECTION,
		MINARD_TEMPERATURES,
		MINARD_LON_EXTENT,
		MINARD_LEGEND
	} from './minard';

	/**
	 * Minard's whole figure again - the map of the march and, under it, the
	 * table of temperature - but with this package's own plots and markers
	 * only: a `GeoPlot` for the map and a `LinePlot` for the cold, in one
	 * `PlotComposer`. No svelteplot `<Plot>` is assembled by hand; compare it
	 * with `MinardPlot`, which is.
	 *
	 * The army is two `trail` markers (advance and retreat) whose width follows
	 * the soldiers left; rivers are a `line` marker per river; cities and army
	 * sizes are `dot` and `text` markers; a single player `timeline` on the composer
	 * (steps = rows of the march) scrubs both plots.
	 */
	const SHOWN_COUNTRIES = new Set([
		'Russia',
		'Poland',
		'Belarus',
		'Estonia',
		'Latvia',
		'Lithuania'
	]);
	const countries = WORLD_COUNTRIES.filter((country) =>
		SHOWN_COUNTRIES.has(String(country.properties.name))
	);

	const COUNTRY_LABELS = [
		{ name: 'Russia', lon: 33.4, lat: 56 },
		{ name: 'Belarus', lon: 28.9534, lat: 53.7098 },
		{ name: 'Estonia', lon: 25.0136, lat: 58.5953 },
		{ name: 'Latvia', lon: 25.2, lat: 56.8796 },
		{ name: 'Lithuania', lon: 24.5, lat: 55.9 }
	];

	/** Every vertex of every river, one `river` key per line. */
	const riverVertices = NAPOLEONS_RIVERS.features.flatMap((feature, river) => {
		const lines =
			feature.geometry.type === 'MultiLineString'
				? feature.geometry.coordinates
				: [feature.geometry.coordinates];
		return lines.flatMap((line, part) =>
			line.map(([lon, lat]) => ({ river: `${river}-${part}`, lon, lat }))
		);
	});

	const maxSurvivors = Math.max(...NAPOLEONS_ARMY.map((row) => row.size));

	// Each army size is printed once the march reaches the row it is set to.
	const sizeLabels = NAPOLEONS_SIZE_LABELS.map((label, index) => {
		const row = MINARD_STEPS[NAPOLEONS_LABEL_ROWS[index]];
		return {
			...label,
			step: row.step,
			direction: row.direction,
			text: label.size.toLocaleString('en-US')
		};
	}).sort((a, b) => a.step - b.step);

	const START_PROGRESS = 1;
	/** The step the march is at, from the composer's timeline. */
	let step = $state(
		MINARD_STEP_VALUES[Math.round(START_PROGRESS * (MINARD_STEP_VALUES.length - 1))]
	);
	/** Only the size label the march has just passed: the older ones would collide with it. */
	const latestLabel = $derived(sizeLabels.filter((label) => label.step <= step).at(-1));

	const mapMarkers = $derived([
		{
			type: 'graticule',
			step: 1,
			behind: true,
			styles: { stroke: 'currentColor', strokeOpacity: 0.2, strokeDasharray: '2,2' }
		},
		{
			type: 'text',
			data: COUNTRY_LABELS,
			x: 'lon',
			y: 'lat',
			text: 'name',
			legend: false,
			styles: { fontSize: 16, fill: 'currentColor', textAnchor: 'middle', dy: -4 },
			fillOpacity: 0.3
		},
		{
			type: 'line',
			data: riverVertices,
			x: 'lon',
			y: 'lat',
			grouping: 'river',
			legend: false,
			styles: { stroke: '#38bdf8', strokeOpacity: 0.6 }
		},
		{
			type: 'dot',
			data: NAPOLEONS_CITIES,
			x: 'lon',
			y: 'lat',
			legend: false,
			styles: { dotRadius: 2, dotFill: 'currentColor', dotFillOpacity: 0.6, dotStroke: 'none' }
		},
		{
			type: 'text',
			data: NAPOLEONS_CITIES,
			x: 'lon',
			y: 'lat',
			text: 'city',
			dx: 6,
			legend: false,
			styles: { fontSize: 10, fill: 'currentColor', textAnchor: 'start' },
			fillOpacity: 0.6
		},
		{
			type: 'trail',
			data: MINARD_STEPS,
			x: 'lon',
			y: 'lat',
			r: 'size',
			cap: 'butt',
			grouping: (row: { division: number; direction: string }) =>
				`${row.division}-${row.direction}`,
			color: 'direction',
			scales: { color: { scheme: { A: '#1f2937', R: '#b91c1c' } } },
			legend: false,
			styles: { fillOpacity: 0.6 }
		},
		{
			type: 'text',
			data: latestLabel ? [latestLabel] : [],
			x: 'lon',
			y: 'lat',
			text: 'text',
			dy: (label: { direction: string }) => (label.direction === 'A' ? -18 : 18),
			legend: false,
			styles: {
				fontSize: 12,
				fontWeight: 'bold',
				textAnchor: 'middle',
				stroke: 'white',
				strokeWidth: 3,
				paintOrder: 'stroke'
			}
		}
	]) as unknown as GeoMarkersConfig[];

	/** Each reading's date, by longitude: the x axis names a reading by when it was taken. */
	const dateAt = new Map(
		MINARD_TEMPERATURES.map((reading) => [reading.lon, reading.date.replace(/ 1812$/, '')])
	);

	const coldMarkers = [
		{
			type: 'rule',
			axis: 'x',
			data: MINARD_TEMPERATURES,
			value: 'lon',
			legend: false,
			styles: { stroke: 'currentColor', strokeOpacity: 0.3, strokeDasharray: '2,3' }
		},
		{
			type: 'dot',
			x: 'lon',
			y: 'temp',
			color: 'temp',
			legend: false,
			scales: { color: { scheme: 'blues', schemeRange: [0.8, 0] } },
			styles: { dotRadius: 3 }
		},
		{
			type: 'text',
			x: 'lon',
			y: 'temp',
			text: (reading: { temp?: number }) => (reading.temp === undefined ? '' : `${reading.temp}°`),
			legend: false,
			styles: { fontSize: 10, fill: 'currentColor', textAnchor: 'middle', dy: -12 }
		}
	] as unknown as AxisBasedMarkersConfig[];
</script>

<PlotComposer
	width={900}
	height={760}
	title="Napoleon's March on Moscow (1812)"
	subtitle="Minard's map and its table of temperature, with this package's own plots"
	timeline={{
		type: 'player',
		values: MINARD_STEP_VALUES,
		progress: START_PROGRESS,
		onvalue: (value) => (step = Number(value)),
		player: { controls: ['play', 'slider', 'speed'] }
	}}
	legend={MINARD_LEGEND}
	order={['title', 'subtitle', 'divider', 'legend', 'plot', 'divider', 'timeline', 'footer']}
	layout={{ columns: 1, heights: [5, 2] }}
>
	<GeoPlot
		data={countries}
		coordinates={{ projection: { ...MINARD_PROJECTION } }}
		styles={{
			fill: 'currentColor',
			fillOpacity: 0.06,
			stroke: 'currentColor',
			strokeWidth: 0.5
		}}
		scales={{ r: { type: 'linear', domain: [0, maxSurvivors], range: [0, 24] } }}
		markers={mapMarkers}
		timeline={{ accessor: 'step', filterMode: 'upTo' }}
	/>
	<LinePlot
		data={MINARD_TEMPERATURES}
		x="lon"
		y="temp"
		scales={{
			x: {
				domain: [MINARD_LON_EXTENT[0] - 2, MINARD_LON_EXTENT[1] + 3.5],
				ticks: [...dateAt.keys()],
				tickFormat: (lon) => dateAt.get(lon as number) ?? '',
				label: false,
				tickRotate: -35
			},
			y: {
				domain: [-30, 10],
				ticks: [0, -10, -20, -30],
				grid: { stroke: 'currentColor', strokeDasharray: '2 3', strokeOpacity: 0.2 },
				label: 'temp (ºR)',
				labelOrientation: 'vertical',
				labelPosition: 'top'
			},
			color: { scheme: ['steelblue'] }
		}}
		markers={coldMarkers}
		timeline={{ accessor: 'step', filterMode: 'upTo' }}
	/>
	{#snippet footer()}
		<span>
			Based on <a
				href="https://en.wikipedia.org/wiki/Charles_Joseph_Minard#The_map_of_Napoleon's_Russian_campaign"
				target="_blank"
				rel="noopener noreferrer">Charles Minard's map</a
			>. Line thickness is proportional to the number of surviving soldiers at each point of the
			march; temperatures are in degrees Reaumur.
		</span>
	{/snippet}
</PlotComposer>
