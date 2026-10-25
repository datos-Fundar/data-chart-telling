<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { Series } from '$lib/types/plots/data/common';
	import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { MarginConfig } from '$lib/types/plots/props';

	/**
	 * Exercises `LinePlot`'s bindable `margins` the way a real consumer would:
	 * holds it as local `$state`, passes it straight back in via `bind:margins`.
	 * `data-margins` on the wrapper `<div>` exposes the current value for tests
	 * to read off the DOM - this component has no other way to surface it,
	 * since `render()` only gives a test access to the rendered markup.
	 */
	let {
		width,
		height,
		series,
		styles,
		scales
	}: {
		width: number;
		height: number;
		series: Series<Record<string, unknown>>[];
		styles?: AxisBasedStylesConfig;
		scales?: AxisBasedScalesConfig;
	} = $props();

	let margins = $state<MarginConfig | undefined>(undefined);
</script>

<div data-testid="margins-probe" data-margins={JSON.stringify(margins ?? null)}></div>
<LinePlot {width} {height} {series} {styles} {scales} bind:margins />
