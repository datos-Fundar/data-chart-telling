<script lang="ts">
	import DiscreteSection from '$lib/layout/legend/DiscreteSection.svelte';
	import type {
		DiscreteLegendSection,
		LegendItemsLayout,
		SymbolLegendSection
	} from '$lib/types/layout/legend';

	/**
	 * A shape scale: each category next to its shape, drawn as a discrete
	 * section's items - all in one color, and never toggling, since they name
	 * categories rather than series.
	 */
	let {
		section,
		defaultItemsLayout
	}: { section: SymbolLegendSection; defaultItemsLayout?: LegendItemsLayout } = $props();

	const discrete = $derived<DiscreteLegendSection>({
		type: 'discrete',
		columns: section.columns,
		layout: section.layout,
		items: section.items.map((item) => ({
			...item,
			color: section.color ?? 'currentColor',
			filled: section.filled ?? true
		}))
	});
</script>

<DiscreteSection section={discrete} {defaultItemsLayout} />
