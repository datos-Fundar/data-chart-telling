<script lang="ts">
	import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
	import ContextReadout from './ContextReadout.svelte';
	import { HEIGHTS } from '$datasets';
</script>

<!-- A bin's edges and count are worked out by the plot: every format reads them from the row's context. -->
<HistogramPlot
	width={720}
	height={360}
	title="Heights"
	data={HEIGHTS}
	x="height"
	tooltip={{
		format: (context, number) =>
			`${context.from} to ${context.to} cm: ${number(context.count)} people`
	}}
	styles={{
		values: {
			show: true,
			format: (context, number) => (context.value > 0 ? number(context.value) : '')
		}
	}}
	markers={[{ type: 'hover' }, { type: 'component', component: ContextReadout }]}
/>
