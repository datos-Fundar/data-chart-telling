<script lang="ts">
	import { contrastTextColor } from '$lib/utils/color';
	import DiscreteSymbolIcon from '$lib/layout/legend/DiscreteSymbolIcon.svelte';
	import type { LegendItem } from '$lib/types/layout/legend';

	/**
	 * The `interactive.legendStyle: 'badge'` item look: a pill with the series
	 * color, symbol icon, label, and a toggle icon - an eye (crossed out when
	 * `disabled`) for `'dim'` mode, or a plus/cross pair for `'hide'`/`'omit'`.
	 */
	let {
		item,
		color,
		disabled,
		showIcon = true,
		omitMode = false
	}: {
		item: LegendItem;
		color: string;
		disabled: boolean;
		showIcon?: boolean;
		omitMode?: boolean;
	} = $props();
	const textColor = $derived(contrastTextColor(color));
</script>

<span class="dct-discrete__badge" style:background={color} style:color={textColor}>
	{#if showIcon}
		<DiscreteSymbolIcon {item} color={textColor} />
	{/if}
	<span class="dct-discrete__label">{item.label || item.name}</span>
	<svg class="dct-discrete__eye" viewBox="0 0 24 24" aria-hidden="true">
		{#if omitMode}
			{#if disabled}
				<line x1="12" y1="5" x2="12" y2="19" />
				<line x1="5" y1="12" x2="19" y2="12" />
			{:else}
				<line x1="6" y1="6" x2="18" y2="18" />
				<line x1="6" y1="18" x2="18" y2="6" />
			{/if}
		{:else if disabled}
			<path
				d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
			/>
			<line x1="1" y1="1" x2="23" y2="23" />
		{:else}
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		{/if}
	</svg>
</span>

<style>
	.dct-discrete__badge {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		min-width: 0;
		padding: var(--dct-legend-badge-pad, 0.25rem 0.65rem);
		border-radius: var(--dct-legend-badge-radius, 999px);
	}
	.dct-discrete__label {
		font-size: var(--dct-legend-size, 0.875rem);
		font-weight: var(--dct-legend-weight, 400);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}
	.dct-discrete__eye {
		width: var(--dct-legend-badge-eye-size, 0.9rem);
		height: var(--dct-legend-badge-eye-size, 0.9rem);
		flex-shrink: 0;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
</style>
