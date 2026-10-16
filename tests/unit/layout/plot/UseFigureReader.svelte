<script lang="ts">
	import { useFigure } from '$lib/layout/plot/usePlot';

	const figure = useFigure();
</script>

<div
	data-testid="figure-reader"
	data-strategy={figure.hover.strategy}
	data-active-x={String(figure.hover.activeX)}
	data-legend={figure.legend ? 'yes' : 'no'}
>
	{figure.legend?.off.length}
</div>
