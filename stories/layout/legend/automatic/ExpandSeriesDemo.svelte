<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE_EXPECTANCY } from '../../../plots/evolution/line/data';
</script>

<!--
	`series` adjusts the automatic discrete section: here it makes the
	legend clickable, and lays it out in a column. The items are still the
	plot's own.
-->
<LinePlot
	width={760}
	height={360}
	data={LIFE_EXPECTANCY}
	x="year"
	y="value"
	color="sex"
	legend={{
		series: {
			title: 'Sex (click to dim)',
			interactive: { enabled: true, disabled: { mode: 'dim' } },
			layout: { type: 'vertical' }
		}
	}}
/>
