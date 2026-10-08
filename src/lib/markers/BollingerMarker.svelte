<script lang="ts">
	import { isHorizontalFor } from '$lib/markers/orientation';
	import { BollingerX, BollingerY, usePlot } from 'svelteplot';
	import type { BollingerMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'bollinger'` marker - a moving-average band (svelteplot's
	 * `BollingerX`/`BollingerY`, picked from the plot's axis scale types - see
	 * `isHorizontalFor`). A `stroke`-independent `fill`-style option
	 * is deliberately not offered - confirmed empirically to have no visible
	 * effect on svelteplot's own line (see `BollingerStatisticOptions`'s own
	 * doc comment).
	 */
	let { marker }: { marker: BollingerMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(isHorizontalFor(plot.scales.x?.type, plot.scales.y?.type));

	const data = $derived(marker.data ?? []);
</script>

{#if isHorizontal}
	<BollingerX
		{data}
		x={marker.x}
		y={marker.y}
		n={marker.n}
		k={marker.k}
		stroke={marker.styles?.stroke}
		strokeOpacity={marker.styles?.strokeOpacity}
		fill={marker.styles?.bandFill}
	/>
{:else}
	<BollingerY
		{data}
		x={marker.x}
		y={marker.y}
		n={marker.n}
		k={marker.k}
		stroke={marker.styles?.stroke}
		strokeOpacity={marker.styles?.strokeOpacity}
		fill={marker.styles?.bandFill}
	/>
{/if}
