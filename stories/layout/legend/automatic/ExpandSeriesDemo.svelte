<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE } from '$datasets';
</script>

<!--
	`series` adjusts the automatic discrete section: here it makes the
	legend clickable, and lays it out in a column. The items are still the
	plot's own.
-->
<LinePlot
	width={760}
	height={360}
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	scales={{ x: { nice: false } }}
	legend={{
		series: {
			title: 'Sex (click to dim)',
			interactive: { enabled: true, disabled: { mode: 'dim' } },
			layout: { type: 'vertical' }
		}
	}}
/>
