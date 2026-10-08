<script lang="ts">
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

	/**
	 * Exercises `createLabelMarginTracker` directly, outside any plot - `width`
	 * drives its `maxOverflow` cap (mirroring every real caller's
	 * `halfDimensionOverflowCap(width, height)`) and `resolvedMargins` is
	 * exposed for a test to read back.
	 *
	 * `report` is handed out once via `onReady`, called directly by the test
	 * rather than wired to a prop-triggered `$effect` - the real caller
	 * (`watchLabelOverflow`'s `requestAnimationFrame` loop) invokes it as a
	 * plain imperative callback, fully outside Svelte's reactive graph, so a
	 * report landing at a given moment is decoupled from whatever triggered a
	 * `width` change around it. Routing it through a reactive effect instead
	 * would accidentally make every `report()` call implicitly re-fire on
	 * every `width` change too (since the buggy version of `report()` itself
	 * reads the live cap), masking exactly the corruption this is meant to
	 * catch.
	 */
	let {
		width,
		onReady
	}: {
		width: number;
		onReady: (report: (overflow: MarginOverflow) => void) => void;
	} = $props();

	const tracker = createLabelMarginTracker(
		() => undefined,
		undefined,
		undefined,
		() => halfDimensionOverflowCap(width, width)
	);

	onReady(tracker.report);
</script>

<div data-testid="probe" data-right={tracker.resolvedMargins?.right}></div>
