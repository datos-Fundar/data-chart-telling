<script lang="ts">
	import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
	import ContextReadout from './ContextReadout.svelte';
	import { HEIGHTS } from '$datasets';
	import type { HistogramRowContext } from '$lib/types/plots/distribution/histogram/props';
</script>

<!-- A bin's edges and count are worked out by the plot: every format reads them from the row's context. -->
<HistogramPlot
	width={720}
	height={360}
	title="Heights"
	data={HEIGHTS}
	x="height"
	tooltip={{
		format: (_row, number, context: HistogramRowContext) =>
			`${context.from} to ${context.to} cm: ${number(context.count)} people`
	}}
	styles={{ values: { show: true, format: (count, number) => (count > 0 ? number(count) : '') } }}
	markers={[{ type: 'hover' }, { type: 'component', component: ContextReadout }]}
/>
