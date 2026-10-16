<script lang="ts">
	import { untrack } from 'svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
	import { TIME_SERIES } from '../../data/time-series';
	import type { PlotStylesConfigInput } from '$lib/types/configuration/styling';

	/**
	 * Every divider takes its look from the configuration's `divider` - color,
	 * width, style and margin - so one `setConfiguration` call restyles all of
	 * them at once, in every plot on the page.
	 */

	// Calling $props() (even unused) keeps this component's inferred prop type
	// permissive - without it, Storybook's bare `render: () => ({ Component })`
	// typing rejects a zero-prop-plus-runes component.
	const props = $props();
	// svelte-ignore state_referenced_locally
	void props;

	type DividerTheme = 'Default' | 'Dashed' | 'Dotted' | 'Double';

	const THEMES: Record<DividerTheme, PlotStylesConfigInput> = {
		Default: {},
		Dashed: { divider: { style: 'dashed', width: '1px', color: '#94a3b8', margin: '0.25rem 0' } },
		Dotted: { divider: { style: 'dotted', width: '2px', color: '#e6580d', margin: '0.5rem 0' } },
		Double: { divider: { style: 'double', width: '4px', color: '#1b9e77', margin: '0.25rem 0' } }
	};

	let active = $state<DividerTheme>('Default');

	// `setConfiguration` reads the config it writes, so the write runs untracked;
	// the config is global, so each switch and the unmount reset it first.
	$effect(() => {
		const theme = active;
		untrack(() => {
			resetConfiguration();
			setConfiguration(THEMES[theme]);
		});
		return () => untrack(() => resetConfiguration());
	});

	const data = TIME_SERIES.filter((d) => d.region === 'North');
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">setConfiguration divider:</span>
		{#each Object.keys(THEMES) as name (name)}
			<button class:active={active === name} onclick={() => (active = name as DividerTheme)}>
				{name}
			</button>
		{/each}
	</div>

	<LinePlot
		width={680}
		height={440}
		title="GDP vs. Employment"
		subtitle="North region, 2018-2022"
		caption="Source: synthetic demo data."
		legend={[
			{
				type: 'discrete',
				columns: 2,
				items: [
					{ name: 'GDP', symbol: 'line' },
					{ name: 'Employment', symbol: 'line' }
				]
			}
		]}
		order={['title', 'subtitle', 'divider', 'legend', 'divider', 'plot', 'divider', 'caption']}
		{data}
		x="year"
		y="value"
		color="metric"
	/>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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
</style>
