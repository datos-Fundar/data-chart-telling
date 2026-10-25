<script lang="ts">
	import { Plot as SveltePlot, Geo, Trail, Text, Dot, Graticule, Frame } from 'svelteplot';
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { WORLD_TOPOLOGY } from '$datasets/world-countries-topology';
	import {
		NAPOLEONS_CITIES,
		NAPOLEONS_SIZE_LABELS,
		NAPOLEONS_LABEL_ROWS,
		NAPOLEONS_ARMY
	} from '$datasets';
	import { NAPOLEONS_RIVERS } from '$datasets/napoleons-rivers';
	import type { ProjectionLike } from '$lib/plots/utils/tiles';
	import ProjectionProbe from './ProjectionProbe.svelte';
	import { MINARD_STEPS, MINARD_PROJECTION, MINARD_LEGEND } from './minard';

	/**
	 * Minard's map of Napoleon's 1812 march: the army's trail, thick in
	 * proportion to its soldiers, over the rivers, cities and borders it
	 * crossed. A replica of svelteplot's own `trail/napoleon` example
	 * (https://svelteplot.dev/examples/trail/napoleon).
	 *
	 * The root is `Plot` - the chrome every plot kind wraps itself in - which
	 * doesn't care what its `cell` snippet draws: here svelteplot's own
	 * `<Plot>` (imported as `SveltePlot`), hand-assembled with a blur-masked
	 * `<defs>` glow and its own projection fitting. So a one-off svelteplot
	 * chart gets the same title, legend and timeline as `LinePlot` or `BarPlot`,
	 * and sits in a `PlotComposer` like them. By default it draws only the plot, and every other
	 * prop (title, order, legend, ...) goes to `Plot`;
	 * `onProjection` hands over the map's projection, to line other plots up with it.
	 */
	let {
		onProjection,
		timeline,
		...chrome
	}: {
		onProjection?: (projection: ProjectionLike | undefined) => void;
		timeline?: object;
	} & Record<string, unknown> = $props();

	// Ids are document-wide: two maps on one page (a docs page) must not share a mask.
	const id = $props.id();

	/** Country names the map prints in the background - placed by hand, not part of the data. */
	const COUNTRY_LABELS = [
		{ name: 'Russia', lon: 33.4, lat: 56 },
		{ name: 'Belarus', lon: 28.9534, lat: 53.7098 },
		{ name: 'Estonia', lon: 25.0136, lat: 58.5953 },
		{ name: 'Latvia', lon: 25.2, lat: 56.8796 },
		{ name: 'Lithuania', lon: 24.5, lat: 55.9 }
	];

	const SHOWN_COUNTRIES = new Set([
		'Russia',
		'Poland',
		'Belarus',
		'Estonia',
		'Latvia',
		'Lithuania'
	]);

	const countryObjects = WORLD_TOPOLOGY.objects as unknown as Record<
		string,
		GeoJSON.GeometryObject
	>;

	// topojson-client is an optional peer dependency (see `$lib/plots/utils/topojson`)
	// - loaded dynamically here too, rather than statically importing it, so this
	// story doesn't force it on consumers who never touch TopoJSON.
	let borders = $state<GeoJSON.MultiLineString | null>(null);
	let countries = $state<GeoJSON.Feature[]>([]);

	$effect(() => {
		let cancelled = false;
		// @ts-expect-error - topojson-client is an optional peer dependency; its
		// type declarations are intentionally not resolved by our own build (see
		// `$lib/plots/utils/topojson`), so this import is resolved purely at runtime.
		import('topojson-client').then((mod: unknown) => {
			if (cancelled) return;
			const { mesh, feature } = mod as {
				mesh: (
					topology: unknown,
					object: unknown,
					filter?: (a: unknown, b: unknown) => boolean
				) => GeoJSON.MultiLineString;
				feature: (
					topology: unknown,
					object: unknown
				) => GeoJSON.FeatureCollection | GeoJSON.Feature;
			};
			borders = mesh(WORLD_TOPOLOGY, countryObjects.countries, (a, b) => a !== b);
			const collection = feature(
				WORLD_TOPOLOGY,
				countryObjects.countries
			) as GeoJSON.FeatureCollection;
			countries = collection.features.filter((f) =>
				SHOWN_COUNTRIES.has(String(f.properties?.name))
			);
		});
		return () => {
			cancelled = true;
		};
	});

	// Each size label is reached at the step of the march row it is set to.
	const reachedAt = NAPOLEONS_SIZE_LABELS.map((label, index) => {
		const row = MINARD_STEPS[NAPOLEONS_LABEL_ROWS[index]];
		return { ...label, step: row.step, direction: row.direction };
	});

	/** The size label the march has just passed: the last one reached, shown at the trail's head. */
	function latestLabel(troops: { step: number }[]) {
		const head = Math.max(-1, ...troops.map((row) => row.step));
		return reachedAt
			.filter((label) => label.step <= head)
			.reduce<
				(typeof reachedAt)[number] | undefined
			>((latest, label) => (!latest || label.step >= latest.step ? label : latest), undefined);
	}
	const maxSurvivors = Math.max(...NAPOLEONS_ARMY.map((d) => d.size));
</script>

<Plot
	width={900}
	height={560}
	data={MINARD_STEPS}
	legend={MINARD_LEGEND}
	order={['plot']}
	{...chrome}
	timeline={{ accessor: 'step', filterMode: 'upTo', ...timeline }}
>
	{#snippet cell({ data, width, height })}
		<SveltePlot
			{width}
			{height}
			margin={0}
			projection={MINARD_PROJECTION}
			r={{ range: [0, 24], type: 'linear', domain: [0, maxSurvivors] }}
		>
			<ProjectionProbe onProjection={(own) => onProjection?.(own)} />
			<Graticule opacity={0.2} step={1} strokeDasharray="2,2" />

			<!-- "inner glow" per shown country, masked to a blurred version of its own borders -->
			<Geo
				data={countries}
				fill={(d) => String((d.properties as { name?: string })?.name)}
				opacity={0.2}
				mask="url(#{id}-clip)"
			/>
			<defs>
				<mask id="{id}-clip">
					<Frame fill="black" stroke="none" />
					{#if borders}
						<Geo
							data={[borders]}
							stroke="white"
							strokeWidth={12}
							strokeLinejoin="round"
							opacity={1}
							svgFilter="url(#{id}-blur)"
						/>
					{/if}
				</mask>
				<filter id="{id}-blur">
					<feGaussianBlur stdDeviation="1" />
				</filter>
			</defs>

			<!-- Under a projection svelteplot's `Text` ignores `dx`/`dy`, so the offsets are a `<g>` translate. -->
			<g transform="translate(0,-4)">
				<Text
					data={COUNTRY_LABELS}
					x="lon"
					y="lat"
					text="name"
					fontSize={16}
					rotate={(d) => -10 + (d.lon - 23.8) * -0.5}
					fill="currentColor"
					fillOpacity={0.3}
					lineAnchor="middle"
					textAnchor="middle"
				/>
			</g>

			<Geo data={NAPOLEONS_RIVERS.features} stroke="#38bdf8" strokeOpacity={0.6} />

			{#if borders}
				<Geo data={[borders]} stroke="currentColor" opacity={0.4} />
			{/if}

			<Dot data={NAPOLEONS_CITIES} x="lon" y="lat" r={2} fill="currentColor" opacity={0.6} />
			<g transform="translate(6,9)">
				<Text
					data={NAPOLEONS_CITIES}
					x="lon"
					y="lat"
					text="city"
					fontSize={10}
					fill="currentColor"
					fillOpacity={0.6}
					textAnchor="start"
				/>
			</g>

			<Trail
				data={data ?? []}
				x="lon"
				y="lat"
				cap="butt"
				r="size"
				opacity={0.6}
				z={(d) => `${d.division}-${d.direction}`}
				fill={(d) => (d.direction === 'A' ? 'currentColor' : '#b91c1c')}
			/>

			<!-- the size of the army where the march is now: above the advance, below the retreat -->
			{@const latest = latestLabel(data ?? [])}
			{#if latest}
				<g
					transform="translate(0,{(latest.direction === 'A' ? -1 : 1) *
						((latest.size / maxSurvivors) * 24 + 10)})"
				>
					<Text
						data={[latest]}
						x="lon"
						y="lat"
						text={(d) => d.size.toLocaleString('en-US')}
						fontSize={13}
						fontWeight="bold"
						fill="currentColor"
						stroke="white"
						strokeWidth={3}
						paintOrder="stroke"
						textAnchor="middle"
					/>
				</g>
			{/if}
		</SveltePlot>
	{/snippet}
	{#snippet footer()}
		<span>
			Based on <a
				href="https://en.wikipedia.org/wiki/Charles_Joseph_Minard#The_map_of_Napoleon's_Russian_campaign"
				target="_blank"
				rel="noopener noreferrer">Charles Minard's map</a
			>. Line thickness is proportional to the number of surviving soldiers at each point of the
			march.
		</span>
	{/snippet}
</Plot>
