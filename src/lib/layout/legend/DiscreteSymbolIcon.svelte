<script lang="ts">
	import type { LegendItem } from '$lib/types/layout/legend';
	import type { LineStyle } from '$lib/types/plots/constants';

	/**
	 * The series' symbol/line-style icon, shared by both discrete item looks
	 * (`DiscreteSwatchItem` and `DiscreteBadgeItem`) so the two stay in sync.
	 * `color` is caller-supplied rather than read off `item` — the swatch look
	 * fills it with the series color, the badge look with its own label color.
	 */
	let { item, color }: { item: LegendItem; color: string } = $props();

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
	{#if item.symbol === 'circle'}
		<circle cx="5" cy="5" r="4" fill={color} />
	{:else if item.symbol === 'square'}
		<rect x="1" y="1" width="8" height="8" rx="2" fill={color} />
	{:else if item.symbol === 'triangle'}
		<path
			d="M 6 2 L 9 7.5 A 1.5 1.5 0 0 1 7.8 10 L 2.2 10 A 1.5 1.5 0 0 1 1 7.5 L 4 2 A 1.5 1.5 0 0 1 6 2"
			fill={color}
			transform="translate(0,-1)"
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
