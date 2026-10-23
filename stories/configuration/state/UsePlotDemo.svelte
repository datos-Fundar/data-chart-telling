<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import HoverReadout from './HoverReadout.svelte';
	import { LIFE } from '$datasets';
</script>

<LinePlot
	width={720}
	height={360}
	title="Life expectancy at birth"
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	tooltip
	scales={{ x: { nice: false } }}
	markers={[{ type: 'hover' }, { type: 'component', component: HoverReadout }]}
/>
