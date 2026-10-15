<script lang="ts">
	import { Plot as SveltePlot, Geo, Trail, Text, Graticule, Frame } from 'svelteplot';
	import Plot from '$lib/layout/plot/Plot.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import { WORLD_TOPOLOGY } from '../../plots/geo/data';
	import { MINARD_TROOPS, MINARD_COUNTRY_LABELS, type MinardRow } from '../../data/minard';
	import type { LegendSection } from '$lib/types/layout/legend';

	/**
	 * The point of this story: `Plot` - the chrome every plot kind wraps
	 * itself in - doesn't know or care what's inside its `cell` snippet; it
	 * only owns the chrome (title/subtitle/caption, legend, timeline
	 * scrubbing). Here the snippet renders svelteplot's own
	 * `<Plot>` (imported as `SveltePlot`) directly, hand-assembled with a blur-masked `<defs>` glow and
	 * its own projection fitting - proof that a one-off svelteplot chart can
	 * still sit inside the same title/legend/timeline shell as
	 * `LinePlot`/`BarPlot`/etc.
	 *
	 * Replica of svelteplot's own `trail/napoleon` example
	 * (https://svelteplot.dev/examples/trail/napoleon), itself based on Charles
	 * Minard's 1812 map of Napoleon's Russian campaign. Data: HistData::Minard.
	 */

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

	// Minard's chart has no real clock - `step` is just the row's position in
	// the march (the CSV's own order), used as a stand-in "time" axis so
	// `Plot`'s timeline can scrub the march forward/backward.
	const steppedTroops: (MinardRow & { step: number })[] = MINARD_TROOPS.map((d, step) => ({
		...d,
		step
	}));
	const maxSurvivors = Math.max(...MINARD_TROOPS.map((d) => d.survivors));

	const lons = MINARD_TROOPS.map((d) => d.long);
	const lats = MINARD_TROOPS.map((d) => d.lat);
	const lonExtent: [number, number] = [Math.min(...lons), Math.max(...lons)];
	const latExtent: [number, number] = [Math.min(...lats), Math.max(...lats)];

	// Fixed to the full march's bounding box (not the timeline-filtered subset)
	// so the map framing stays put while scrubbing instead of zooming as rows
	// drop out.
	const domain = {
		type: 'Polygon' as const,
		coordinates: [
			[
				[lonExtent[0], latExtent[1]],
				[lonExtent[0], latExtent[0]],
				[lonExtent[1], latExtent[0]],
				[lonExtent[1], latExtent[1]],
				[lonExtent[0], latExtent[1]]
			].reverse()
		]
	};

	const legend: LegendSection[] = [
		{
			type: 'discrete',
			title: 'Direction',
			items: [
				{ name: 'Advance to Moscow', symbol: 'line', color: 'currentColor' },
				{ name: 'Retreat', symbol: 'line', color: '#b91c1c' }
			]
		}
	];
</script>

<Scrubber initial={1}>
	{#snippet children({ progress })}
		<Plot
			width={860}
			height={560}
			title="Napoleon's March on Moscow (1812)"
			subtitle="Plain svelteplot inside the plots' own chrome"
			data={steppedTroops}
			{legend}
			timeline={{
				accessor: 'step',
				type: 'rule',
				progress,
				filterMode: 'upTo',
				orientation: 'horizontal'
			}}
		>
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
			{#snippet cell({ data, width, height })}
				<SveltePlot
					{width}
					{height}
					projection={{ type: 'conic-equal-area', inset: 20, domain }}
					r={{ range: [0, 24], type: 'linear', domain: [0, maxSurvivors] }}
				>
					<Graticule opacity={0.2} step={1} strokeDasharray="2,2" />

					<!-- "inner glow" per shown country, masked to a blurred version of its own borders -->
					<Geo
						data={countries}
						fill={(d) => String((d.properties as { name?: string })?.name)}
						opacity={0.2}
						mask="url(#napoleon-clip)"
					/>
					<defs>
						<mask id="napoleon-clip">
							<Frame fill="black" stroke="none" />
							{#if borders}
								<Geo
									data={[borders]}
									stroke="white"
									strokeWidth={12}
									strokeLinejoin="round"
									opacity={1}
									svgFilter="url(#napoleon-blur)"
								/>
							{/if}
						</mask>
						<filter id="napoleon-blur">
							<feGaussianBlur stdDeviation="1" />
						</filter>
					</defs>

					<Text
						data={MINARD_COUNTRY_LABELS}
						x="lon"
						y="lat"
						text="name"
						fontSize={16}
						dy={-4}
						rotate={(d) => -10 + (d.lon - 23.8) * -0.5}
						fill="currentColor"
						fillOpacity={0.3}
						lineAnchor="middle"
						textAnchor="middle"
					/>

					{#if borders}
						<Geo data={[borders]} stroke="currentColor" opacity={0.4} />
					{/if}

					<Trail
						data={data ?? []}
						x="long"
						y="lat"
						cap="butt"
						r="survivors"
						z={(d) => `${d.group}-${d.direction}`}
						fill={(d) => (d.direction === 'A' ? 'currentColor' : '#b91c1c')}
					/>
				</SveltePlot>
			{/snippet}
		</Plot>
	{/snippet}
</Scrubber>
