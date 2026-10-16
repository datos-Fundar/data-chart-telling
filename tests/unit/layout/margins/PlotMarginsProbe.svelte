<script lang="ts">
	import { Margins } from '$lib/layout/margins/Margins';
	import { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
	import type { MarginConfig } from '$lib/types/plots/props';
	import type { EdgeBox } from '$lib/types/layout/box';

	/**
	 * A `PlotMargins` outside any plot: `width` sizes its box (and so the cap on
	 * label growth), `author` is its author margins, and its labels' margins
	 * and resolved config are exposed for a test to read back. `onReady` hands
	 * out the instance once, so a test reports overflow imperatively, the way
	 * a label's DOM measurement does - outside the reactive graph.
	 */
	let {
		width,
		author,
		scales,
		reserve = [],
		onReady,
		onSettle
	}: {
		width: number;
		author?: MarginConfig;
		scales?: Partial<Record<'x' | 'y', { tickRotate?: number }>>;
		reserve?: EdgeBox[];
		onReady: (margins: PlotMargins) => void;
		onSettle?: (margins: MarginConfig) => void;
	} = $props();

	const margins = new PlotMargins({
		theme: () => ({}),
		author: () => author,
		estimate: () => Margins.AXIS_ESTIMATE,
		reserve: () => reserve,
		size: () => ({ width, height: width }),
		resetKey: () => undefined,
		scales: () => scales,
		tickFontSize: () => 12,
		settle: (m) => onSettle?.(m)
	});

	// svelte-ignore state_referenced_locally
	onReady(margins);
</script>

<div
	data-testid="probe"
	data-right={margins.config.right}
	data-bottom={margins.config.bottom}
	data-left={margins.config.left}
></div>
