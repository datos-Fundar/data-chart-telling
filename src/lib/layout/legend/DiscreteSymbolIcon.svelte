<script lang="ts">
	import type { LegendItem } from '$lib/types/layout/legend';
	import type { LineStyle } from '$lib/types/plots/constants';
	import { SymbolPath } from '$lib/utils/SymbolPath';

	/**
	 * The series' symbol/line-style icon, shared by both discrete item looks
	 * (`DiscreteSwatchItem` and `DiscreteBadgeItem`) so the two stay in sync.
	 * `color` is caller-supplied rather than read off `item` - the swatch look
	 * fills it with the series color, the badge look with its own label color.
	 * A shape draws as the plot's dot does, fitted to the icon.
	 */
	let { item, color }: { item: LegendItem; color: string } = $props();

	const filled = $derived(item.filled ?? true);
	const paint = $derived(
		filled
			? { fill: color }
			: { fill: 'none', stroke: color, 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' }
	);

	function dashArray(style?: LineStyle): string | undefined {
		switch (style) {
			case 'dashed':
				return '2,5';
			case 'dotted':
				return '1,4';
			case 'dashdot':
				return '5,3,1,3';
			default:
				return undefined;
		}
	}
</script>

<svg class="dct-discrete__swatch" viewBox="0 0 15 10">
	{#if item.symbol && item.symbol !== 'line'}
		<path
			d={SymbolPath.fitted(item.symbol, filled ? 8 : 7)}
			transform={filled ? 'translate(1,1)' : 'translate(1.5,1.5)'}
			{...paint}
		/>
	{:else if item.symbol === 'line'}
		<line
			x1="2"
			y1="5"
			x2="13"
			y2="5"
			stroke={color}
			stroke-width="3"
			stroke-linecap="round"
			stroke-dasharray={dashArray(item.lineStyle)}
		/>
	{:else}
		<rect x="1" y="1" width="8" height="8" fill={color} />
	{/if}
</svg>

<style>
	.dct-discrete__swatch {
		width: var(--dct-legend-swatch, 1.25rem);
		height: var(--dct-legend-swatch, 1.25rem);
		flex-shrink: 0;
	}
</style>
