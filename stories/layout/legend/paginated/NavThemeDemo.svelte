<script lang="ts">
	import { untrack } from 'svelte';
	import HorizontalDemo from './HorizontalDemo.svelte';
	import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
	import type { PlotStylesConfigInput } from '$lib/types/configuration/styling';

	// Calling $props() (even unused) keeps this component's inferred prop type
	// permissive - without it, Storybook's bare `render: () => ({ Component })`
	// typing rejects a zero-prop-plus-runes component.
	const props = $props();
	void props;

	type NavThemeName = 'Default' | 'Purple' | 'Green';

	const NAV_THEMES: Record<NavThemeName, PlotStylesConfigInput> = {
		Default: {},
		Purple: {
			legend: {
				navButton: { background: '#6a4c93', color: '#fff', size: '1.75rem', fontSize: '1.1rem' }
			}
		},
		Green: {
			legend: {
				navButton: { background: '#16a34a', color: '#fff', size: '1.5rem', fontSize: '0.9rem' }
			}
		}
	};

	let active = $state<NavThemeName>('Default');

	// Same untrack/cleanup pattern as ConfigDemo/FacetThemeDemo: `setConfiguration`
	// reads `current` to merge and then writes it, so tracking it inside this
	// effect would make the effect depend on the very state it sets - an
	// infinite loop. Cleanup restores defaults (the config is a global
	// singleton) before each re-run and on unmount.
	$effect(() => {
		const theme = active;
		untrack(() => {
			resetConfiguration();
			setConfiguration(NAV_THEMES[theme]);
		});
		return () => untrack(() => resetConfiguration());
	});
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">setConfiguration legend.navButton theme:</span>
		{#each Object.keys(NAV_THEMES) as name (name)}
			<button class:active={active === name} onclick={() => (active = name as NavThemeName)}>
				{name}
			</button>
		{/each}
	</div>

	<p class="demo__hint">
		Restyles the prev/next pagination arrows - same global config that themes the rest of the
		package (compare with the facet pagination buttons).
	</p>

	<HorizontalDemo itemCount={24} maxRows={1} width={460} />
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
