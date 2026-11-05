<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE, MALE_LIFE } from '$datasets';

	let over = $state<{ year: number; value: number } | undefined>();
</script>

<!-- `onpointerenter` and `onpointerleave` on the male series' dots. -->
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
			data: MALE_LIFE,
			x: 'year',
			y: 'value',
			r: 7,
			styles: { dotFill: 'steelblue', dotStroke: 'white' },
			onpointerenter: (_event, row) => (over = row),
			onpointerleave: () => (over = undefined)
		}
	]}
/>

<pre style="font-size: 0.8rem">{over
		? `Over ${over.year}: ${over.value} years`
		: 'Move over a blue dot'}</pre>
