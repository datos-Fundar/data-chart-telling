<script lang="ts">
	import ContinuousSection from '$lib/layout/legend/ContinuousSection.svelte';
	import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import type { ContinuousLegendSection } from '$lib/types/layout/legend';
	import type { LegendInteractionStore } from '$lib/types/layout/legend';

	let {
		section,
		onReady
	}: { section: ContinuousLegendSection; onReady: (store: LegendInteractionStore) => void } =
		$props();

	onReady(provideLegendInteraction());
</script>

<ContinuousSection {section} />
