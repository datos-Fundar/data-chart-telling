<script lang="ts">
	import ContinuousSection from '$lib/layout/legend/ContinuousSection.svelte';
	import { LegendState } from '$lib/layout/legend/LegendState.svelte';
	import type { ContinuousLegendSection } from '$lib/types/layout/legend';

	let {
		section,
		onReady
	}: { section: ContinuousLegendSection; onReady: (store: LegendState) => void } = $props();

	// svelte-ignore state_referenced_locally
	onReady(LegendState.provide());
</script>

<ContinuousSection {section} />
