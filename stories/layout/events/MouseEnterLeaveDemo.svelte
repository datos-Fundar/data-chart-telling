<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE, FEMALE_LIFE, MALE_LIFE } from '$datasets';

	/** The gap between the two series, as a band. */
	const GAP = FEMALE_LIFE.map((row, index) => ({
		year: row.year,
		lo: MALE_LIFE[index].value,
		hi: row.value
	}));

	let inside = $state(false);
	let entries = $state(0);
</script>

<!-- `onmouseenter` and `onmouseleave` on the area between the two lines. -->
<LinePlot
	width={760}
	height={340}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	markers={[
		{
			type: 'area',
			data: GAP,
			x: 'year',
			y1: 'lo',
			y2: 'hi',
			styles: { fill: 'orange', fillOpacity: inside ? 0.55 : 0.2 },
			onmouseenter: () => {
				inside = true;
				entries += 1;
			},
			onmouseleave: () => (inside = false)
		}
	]}
/>

<pre style="font-size: 0.8rem">{inside
		? 'Inside the gap'
		: 'Outside the gap'} - entered {entries} times</pre>
