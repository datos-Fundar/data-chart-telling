<script lang="ts">
	import { BollingerX, BollingerY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import type { BollingerMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'bollinger'` marker - a moving-average band (svelteplot's
	 * `BollingerX`/`BollingerY`, picked from the way the plot runs
	 * (`usePlot().axes`). A `stroke`-independent `fill`-style option
	 * is deliberately not offered - confirmed empirically to have no visible
	 * effect on svelteplot's own line (see `BollingerStatisticOptions`'s own
	 * doc comment).
	 */
	let { marker }: { marker: BollingerMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(plot.axes?.isHorizontal ?? false);
	const BollingerMark = $derived(isHorizontal ? BollingerX : BollingerY);

	const data = $derived(marker.data ?? []);
</script>

<BollingerMark
	{data}
	x={marker.x}
	y={marker.y}
	n={marker.n}
	k={marker.k}
	stroke={marker.styles?.stroke}
	strokeOpacity={marker.styles?.strokeOpacity}
	fill={marker.styles?.bandFill}
/>
