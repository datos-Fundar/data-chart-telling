<script lang="ts">
	import { Plot as SveltePlot, Line, Dot, Text, RuleX, RuleY, LinearGradientY } from 'svelteplot';
	import Plot from '$lib/layout/plot/Plot.svelte';
	import type { ProjectionLike } from '$lib/plots/utils/tiles';
	import { MINARD_LON_EXTENT, MINARD_TEMPERATURES, type MinardTemperature } from './minard';

	/**
	 * The graphic table of temperature under Minard's map: the cold the army
	 * met on the retreat, in degrees Réaumur below zero. A line whose color
	 * follows its own value - a `LinearGradientY` painted onto the stroke -
	 * that grows from east to west with the timeline, as the army retreats.
	 *
	 * Each reading sits at the same horizontal place as on the map: with the
	 * map's `projection` it is where the map draws the reading's longitude and
	 * latitude, and without, the longitude spread across the width. By default it draws
	 * only the plot, and every other prop goes to `Plot`.
	 */
	let {
		projection,
		timeline,
		...chrome
	}: { projection?: ProjectionLike; timeline?: object } & Record<string, unknown> = $props();

	// Ids are document-wide: two tables on one page (a docs page) must not share a gradient.
	const id = $props.id();

	/** Where a reading falls across a plot `width` wide. */
	function across(reading: MinardTemperature, width: number): number {
		const placed = projection?.([reading.lon, reading.lat]);
		if (placed) return placed[0];
		const [west, east] = MINARD_LON_EXTENT;
		return ((reading.lon - west) / (east - west)) * width;
	}

	const FREEZING = 0;
	const COLDEST = -30;
</script>

<Plot
	width={900}
	height={260}
	data={MINARD_TEMPERATURES}
	order={['plot']}
	{...chrome}
	timeline={{ accessor: 'step', filterMode: 'upTo', ...timeline }}
>
	{#snippet cell({ data, width, height })}
		{@const readings = (data ?? []).map((reading, index) => ({
			...reading,
			px: across(reading, width),
			index
		}))}
		<SveltePlot
			{width}
			{height}
			margin={0}
			x={{ domain: [0, width], axis: false }}
			y={{ domain: [COLDEST - 6, 4], axis: false }}
		>
			<defs>
				<LinearGradientY
					id="{id}-gradient"
					stops={[
						{ y: FREEZING, color: '#7dd3fc' },
						{ y: COLDEST, color: '#1e3a8a' }
					]}
				/>
			</defs>

			<RuleY
				data={[0, -10, -20, -30]}
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeDasharray="2,2"
			/>
			<Text
				data={[0, -10, -20, -30]}
				x={4}
				y={(degrees) => degrees}
				text={(degrees) => `${degrees}°`}
				fontSize={10}
				dy={-5}
				textAnchor="start"
				fill="currentColor"
				fillOpacity={0.5}
			/>

			<RuleX
				data={readings}
				x="px"
				y1="temp"
				y2={4}
				stroke="currentColor"
				strokeOpacity={0.2}
				strokeDasharray="2,2"
			/>
			<Line data={readings} x="px" y="temp" stroke="url(#{id}-gradient)" strokeWidth={5} />
			<Dot data={readings} x="px" y="temp" r={3} fill="currentColor" />
			<Text
				data={readings}
				x="px"
				y="temp"
				text={(reading) => `${reading.temp}°; ${reading.date.replace(/ 1812$/, '')}`}
				fontSize={10}
				dy={(reading) => (reading.index % 2 ? -10 : 14)}
				fill="currentColor"
				textAnchor={(reading) => (reading.px > width - 60 ? 'end' : 'middle')}
			/>
		</SveltePlot>
	{/snippet}
	{#snippet footer()}
		<span>
			Temperature in degrees Réaumur, on the retreat from Moscow. Each reading is under the place on
			the map where the army was.
		</span>
	{/snippet}
</Plot>
