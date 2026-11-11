<script lang="ts">
	import { useFigure } from '$lib/layout/plot/usePlot';
	import type { PublicLegend } from '$lib/layout/plot/PublicPlotContext';

	/** A `component` marker that hands over the figure's public legend. */
	let { onLegend }: { onLegend: (legend: PublicLegend | null) => void } = $props();

	// svelte-ignore state_referenced_locally
	onLegend(useFigure().legend);
</script>
