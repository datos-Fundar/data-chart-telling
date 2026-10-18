<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import { TIME_SERIES } from '../../data/time-series';

	let progress = $state(0);
	// A step: a number here (a year), a `Date` on a timeline of dates.
	let year = $state<number | Date | undefined>();
	let playing = $state(false);
	let speed = $state(1);
	let loop = $state(false);
</script>

<!--
	The timeline tells its owner what happens: `onprogress` and `onvalue`
	on the timeline, `onplay`, `onspeed` and `onloop` on its `player`.
-->
<LinePlot
	width={760}
	height={340}
	data={TIME_SERIES.filter((d) => d.metric === 'GDP')}
	x="year"
	y="value"
	color="region"
	scales={{ x: { domain: [2018, 2022] }, y: { domain: [0, 100] } }}
	timeline={{
		accessor: 'year',
		type: 'player',
		filterMode: 'upTo',
		onprogress: (p) => (progress = p),
		onvalue: (value) => (year = value),
		player: {
			controls: ['play', 'value', 'slider', 'speed', 'loop'],
			onplay: (value) => (playing = value),
			onspeed: (value) => (speed = value),
			onloop: (value) => (loop = value)
		}
	}}
/>

<pre style="font-size: 0.8rem">progress: {progress.toFixed(2)}
year: {year ?? '-'}
playing: {playing}
speed: x{speed}
loop: {loop}</pre>
