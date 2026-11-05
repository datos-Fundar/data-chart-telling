<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE, FEMALE_LIFE } from '$datasets';

	let selected = $state<{ year: number; value: number } | undefined>();
</script>

<!-- A dot on each of the female series' years: clicking one tells its row. -->
<LinePlot
	width={760}
	height={340}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	markers={[
		{
			type: 'dot',
			data: FEMALE_LIFE,
			x: 'year',
			y: 'value',
			r: 7,
			styles: { dotFill: 'tomato', dotStroke: 'white' },
			onclick: (_event, row) => (selected = row)
		}
	]}
/>

<pre style="font-size: 0.8rem">{selected
		? `Clicked ${selected.year}: ${selected.value} years`
		: 'Click one of the red dots'}</pre>
