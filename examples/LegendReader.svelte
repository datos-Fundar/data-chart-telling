<script lang="ts">
	import { useFigure } from '@fundar/data-chart-telling';

	// Call during component init, below a plot or a PlotComposer.
	const { legend } = useFigure();
</script>

<p>Hidden series: {legend?.off.join(', ') || 'none'}</p>
