<script lang="ts">
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import type { DiscreteLegendSection } from '$lib/types/layout/legend';

	/**
	 * Routes through `LegendLayout` (not `DiscreteSection` directly) so tests
	 * exercise the real `.dct-legend` → `.dct-legend__section` nesting a chart
	 * actually renders into - `.dct-legend__section` is a shrink-to-fit flex
	 * item, and that's exactly the ancestor whose width previously collapsed
	 * once pagination narrowed the visible page (see the long comment on
	 * DiscreteSection's measurement effect). A bare wrapper `<div>` around
	 * `DiscreteSection` alone doesn't have that shrink-to-fit ancestor, so it
	 * can't catch a regression there.
	 */
	let { section, width = 300 }: { section: DiscreteLegendSection; width?: number } = $props();
</script>

<div style="width: {width}px">
	<LegendLayout sections={[section]} />
</div>
