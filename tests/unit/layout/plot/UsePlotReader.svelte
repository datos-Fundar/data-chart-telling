<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';

	const plot = usePlot();
</script>

<g
	data-testid="plot-reader"
	data-rows={plot.data.length}
	data-width={plot.width}
	data-height={plot.height}
	data-strategy={plot.hover.strategy}
	data-tooltip={plot.hover.tooltip.visible}
	data-sp-width={plot.svelteplot.width}
	data-legend={plot.legend ? 'yes' : 'no'}
></g>
