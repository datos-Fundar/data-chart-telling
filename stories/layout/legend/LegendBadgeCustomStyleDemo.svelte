<script lang="ts">
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import type { LegendSection } from '$lib/types/layout/legend';

	// Calling $props() (even unused) keeps this component's inferred prop type
	// permissive - without it, Storybook's bare `render: () => ({ Component })`
	// typing rejects a zero-prop-plus-runes component.
	const props = $props();
	void props;

	/**
	 * `.dct-discrete__badge` isn't a themeable config knob (unlike
	 * `--dct-legend-*` custom properties) - it's a plain, stable CSS class on
	 * the pill, restyled here from a consumer stylesheet with an ordinary
	 * `:global(...)` selector. No package prop needed for shadow, border, or
	 * hover; this toggle just swaps a wrapper class to compare before/after.
	 */
	let custom = $state(true);

	const sections: LegendSection[] = [
		{
			type: 'discrete',
			title: 'Indicator (click to hide)',
			interactive: { enabled: true, disabled: { mode: 'dim', style: { opacity: 0.15 } } },
			items: [
				{ name: 'GDP', label: 'GDP', color: '#4f46e5', symbol: 'line' },
				{ name: 'Employment', label: 'Employment', color: '#e6580d', symbol: 'line' },
				{ name: 'Inflation', label: 'Inflation', color: '#16a34a', symbol: 'line' }
			]
		}
	];
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">.dct-discrete__badge:</span>
		<button class:active={!custom} onclick={() => (custom = false)}>Default</button>
		<button class:active={custom} onclick={() => (custom = true)}
			>Custom (shadow/border/hover)</button
		>
	</div>

	<div class="demo__stage" class:demo__stage--custom={custom}>
		<LegendLayout {sections} />
	</div>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-family: ui-sans-serif, system-ui, sans-serif;
	}
	.demo__controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.demo__label {
		font-family: ui-monospace, monospace;
		font-size: 0.8rem;
		opacity: 0.7;
	}
	.demo__controls button {
		padding: 0.3rem 0.8rem;
		border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
		border-radius: 0.375rem;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	.demo__controls button.active {
		background: #111827;
		color: white;
		border-color: #111827;
	}

	/* Everything below targets the package's own `.dct-discrete__badge` /
	   `.dct-discrete__item--interactive` classes exactly as a consumer app
	   would from its own global stylesheet - scoped here to `.demo__stage
	   --custom` only so the "Default" toggle state stays untouched. */
	:global(.demo__stage--custom .dct-discrete__badge) {
		border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
		box-shadow: 0 2px 6px color-mix(in srgb, currentColor 20%, transparent);
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}
	:global(.demo__stage--custom .dct-discrete__item--interactive:hover .dct-discrete__badge) {
		transform: translateY(-2px);
		box-shadow: 0 4px 10px color-mix(in srgb, currentColor 30%, transparent);
	}
</style>
