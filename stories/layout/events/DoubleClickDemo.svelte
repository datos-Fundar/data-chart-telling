<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE } from '$datasets';

	const ERAS = [
		{ name: 'Early years', from: 1947, to: 1980 },
		{ name: 'Middle years', from: 1980, to: 2000 },
		{ name: 'Recent years', from: 2000, to: 2019 }
	];

	let locked = $state<string | undefined>();
</script>

<!-- An era is a rectangle behind the lines: double-clicking it locks it. -->
<LinePlot
	width={760}
	height={340}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ y: { domain: [50, 85] } }}
	markers={[
		{
			type: 'rect',
			data: ERAS,
			x1: 'from',
			x2: 'to',
			y1: 50,
			y2: 85,
			insetLeft: 2,
			insetRight: 2,
			styles: { fill: 'steelblue', fillOpacity: 0.12 },
			ondblclick: (_event, era) => (locked = locked === era.name ? undefined : era.name)
		}
	]}
/>

<pre style="font-size: 0.8rem">{locked
		? `Locked: ${locked}`
		: 'Double-click an era to lock it'}</pre>
