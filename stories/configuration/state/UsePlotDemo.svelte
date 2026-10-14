<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import HoverReadout from './HoverReadout.svelte';
	import { LIFE_EXPECTANCY } from '../../plots/line/data';
</script>

<LinePlot
	width={720}
	height={360}
	title="Life expectancy at birth"
	data={LIFE_EXPECTANCY}
	x="year"
	y="value"
	color="sex"
	tooltip
	markers={[{ type: 'hover' }, { type: 'component', component: HoverReadout }]}
/>
