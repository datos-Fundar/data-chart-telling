<script lang="ts">
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { LegendItem } from '$lib/types/layout/legend';
	import type { LineStyle, SymbolType } from '$lib/types/plots/constants';
	import { SymbolPath } from '$lib/utils/SymbolPath';

	/**
	 * The series' symbol/line-style icon, shared by both discrete item looks
	 * (`DiscreteSwatchItem` and `DiscreteBadgeItem`) so the two stay in sync.
	 * `color` is caller-supplied rather than read off `item` - the swatch look
	 * fills it with the series color, the badge look with its own label color.
	 * The shape is the item's own `symbol`, or the one `legend.icon.marks` gives
	 * the way it draws. A shape draws as the plot's dot does, fitted to the icon;
	 * `legend.icon.rounded` softens its corners.
	 */
	let { item, color }: { item: LegendItem; color: string } = $props();

	const cfg = $derived(getConfiguration());
	const icon = $derived(cfg.legend.icon);
	const shape = $derived<SymbolType>(
		item.symbol ?? (item.mark ? icon.marks[item.mark] : undefined) ?? 'square'
	);
	const rounded = $derived(icon.rounded);
	const filled = $derived(item.filled ?? true);
	// A rounded filled shape grows a same-colored stroke with round joins, so it is drawn smaller by that much.
	const paint = $derived<Record<string, string | number>>(
		!filled
			? {
					fill: 'none',
					stroke: color,
					'stroke-width': 1.5,
					...(rounded ? { 'stroke-linejoin': 'round' } : {}),
					'vector-effect': 'non-scaling-stroke'
				}
			: rounded
				? { fill: color, stroke: color, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }
				: { fill: color }
	);
	const size = $derived(filled ? (rounded ? 6.5 : 8) : 7);
	const offset = $derived(!filled ? 1.5 : rounded ? 1.75 : 1);

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
	{#if shape === 'line'}
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
	{:else if rounded && filled && shape === 'square'}
		<rect x="1" y="1" width="8" height="8" rx="2" fill={color} />
	{:else if rounded && filled && shape === 'triangle'}
		<path
			d="M 6 2 L 9 7.5 A 1.5 1.5 0 0 1 7.8 10 L 2.2 10 A 1.5 1.5 0 0 1 1 7.5 L 4 2 A 1.5 1.5 0 0 1 6 2"
			fill={color}
			transform="translate(0,-1)"
		/>
	{:else if shape === 'square' && filled && !rounded}
		<rect x="1" y="1" width="8" height="8" fill={color} />
	{:else}
		<path d={SymbolPath.fitted(shape, size)} transform="translate({offset},{offset})" {...paint} />
	{/if}
</svg>

<style>
	.dct-discrete__swatch {
		width: var(--dct-legend-swatch, 1.25rem);
		height: var(--dct-legend-swatch, 1.25rem);
		flex-shrink: 0;
	}
</style>
