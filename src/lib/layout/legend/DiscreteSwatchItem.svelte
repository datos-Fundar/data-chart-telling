<script lang="ts">
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { LegendText } from '$lib/layout/legend/LegendText';
	import DiscreteSymbolIcon from '$lib/layout/legend/DiscreteSymbolIcon.svelte';
	import type { LegendItem } from '$lib/types/layout/legend';

	let { item, color }: { item: LegendItem; color: string } = $props();
	const cfg = $derived(getConfiguration());
</script>

<DiscreteSymbolIcon {item} {color} />
<span class="dct-discrete__label">{item.label || LegendText.of(item.name, cfg)}</span>

<style>
	.dct-discrete__label {
		font-size: var(--dct-legend-size, 0.875rem);
		font-weight: var(--dct-legend-weight, 400);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}
</style>
