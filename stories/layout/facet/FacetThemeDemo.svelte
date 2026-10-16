<script lang="ts">
	import { untrack } from 'svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { facetGroups } from '../../data/facet-groups';
	import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
	import type { PlotStylesConfigInput } from '$lib/types/configuration/styling';

	// Calling $props() (even unused) keeps this component's inferred prop type
	// permissive - without it, Storybook's bare `render: () => ({ Component })`
	// typing rejects a zero-prop-plus-runes component.
	const props = $props();
	// svelte-ignore state_referenced_locally
	void props;

	type FacetThemeName = 'Default' | 'Purple' | 'Green';

	const FACET_THEMES: Record<FacetThemeName, PlotStylesConfigInput> = {
		Default: {},
		Purple: {
			facet: {
				indicator: { background: '#6a4c93', color: '#fff', radius: '0.25rem' },
				navButton: { background: '#6a4c93', color: '#fff', size: '2.5rem' }
			}
		},
		Green: {
			facet: {
				indicator: {
					background: '#16a34a',
					color: '#fff',
					fontSize: '0.7rem',
					padding: '0.3rem 0.8rem'
				},
				navButton: { background: '#16a34a', color: '#fff', size: '1.8rem', fontSize: '1rem' }
			}
		}
	};

	let active = $state<FacetThemeName>('Default');

	// Same untrack/cleanup pattern as ConfigDemo: `setConfiguration` reads
	// `current` to merge and then writes it, so tracking it inside this effect
	// would make the effect depend on the very state it sets - an infinite
	// loop. Cleanup restores defaults (the config is a global singleton)
	// before each re-run and on unmount.
	$effect(() => {
		const theme = active;
		untrack(() => {
			resetConfiguration();
			setConfiguration(FACET_THEMES[theme]);
		});
		return () => untrack(() => resetConfiguration());
	});
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">setConfiguration facet theme:</span>
		{#each Object.keys(FACET_THEMES) as name (name)}
			<button class:active={active === name} onclick={() => (active = name as FacetThemeName)}>
				{name}
			</button>
		{/each}
	</div>

	<p class="demo__hint">
		Restyles the indicator badge and pagination buttons - same global config that themes the rest of
		the package.
	</p>

	<BarPlot
		width={720}
		height={480}
		data={facetGroups(9)}
		x="category"
		y="value"
		facet={{ by: 'group', columns: 2, mode: 'paginated', pageSize: 4 }}
	/>
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
	.demo__hint {
		margin: 0;
		font-size: 0.85rem;
		opacity: 0.75;
	}
</style>
