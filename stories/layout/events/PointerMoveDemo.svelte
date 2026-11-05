<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE } from '$datasets';

	let at = $state<{ x: number; y: number } | undefined>();
</script>

<!--
	`onpointermove` on a rectangle that covers the plot. svelteplot adds the data position of the
	pointer to the event, as `dataX` and `dataY`.
-->
<LinePlot
	width={760}
	height={340}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ x: { domain: [1947, 2019] }, y: { domain: [50, 85] } }}
	markers={[
		{
			type: 'rect',
			data: [{}],
			x1: 1947,
			x2: 2019,
			y1: 50,
			y2: 85,
			styles: { fill: 'currentColor', fillOpacity: 0.04 },
			onpointermove: (event) => {
				const { dataX, dataY } = event as Event & { dataX: number; dataY: number };
				at = { x: dataX, y: dataY };
			},
			onpointerleave: () => (at = undefined)
		}
	]}
/>

<pre style="font-size: 0.8rem">{at
		? `Year ${at.x.toFixed(1)}, ${at.y.toFixed(1)} years`
		: 'Move the pointer over the plot'}</pre>
