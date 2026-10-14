<script lang="ts">
	import DiscreteSection from '$lib/layout/legend/DiscreteSection.svelte';
	import { LegendState } from '$lib/layout/legend/LegendState.svelte';
	import type { DiscreteLegendSection, LegendDisabledAction } from '$lib/types/layout/legend';

	let { section, action }: { section: DiscreteLegendSection; action: LegendDisabledAction } = $props();

	// svelte-ignore state_referenced_locally
	LegendState.provide().turnOff(section.items[0].name, action);
</script>

<DiscreteSection {section} />
