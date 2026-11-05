<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE } from '$datasets';

	let pressed = $state(false);
	let presses = $state(0);
</script>

<!-- `onpointerdown` and `onpointerup` on a rectangle: it darkens while it is pressed. -->
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
			data: [{}],
			x1: 1985,
			x2: 2005,
			y1: 50,
			y2: 85,
			styles: { fill: 'crimson', fillOpacity: pressed ? 0.45 : 0.15 },
			onpointerdown: () => {
				pressed = true;
				presses += 1;
			},
			onpointerup: () => (pressed = false),
			onpointerleave: () => (pressed = false)
		}
	]}
/>

<pre style="font-size: 0.8rem">{pressed ? 'Pressed' : 'Released'} - pressed {presses} times</pre>
