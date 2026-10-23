<script lang="ts">
	import { untrack } from 'svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
	import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
	import { THEMES, type ThemeName } from '$lib/configuration/themes';
	import { ARGENTINA_CHILE_TRENDS, type CountryTrendRow } from '$datasets';
	import { PENGUIN_COUNTS, type PenguinSpeciesCount } from '$datasets';

	let active = $state<ThemeName>('Default');

	// Apply the active theme. We track ONLY `active`; the config read/write is
	// untracked, otherwise `setConfiguration` (which reads `current` to merge and
	// then writes it) would make this effect depend on the very state it sets -
	// an infinite loop. Cleanup restores defaults (the config is a global
	// singleton) before each re-run and on unmount.
	$effect(() => {
		const theme = active;
		untrack(() => {
			resetConfiguration();
			setConfiguration(THEMES[theme]);
		});
		return () => untrack(() => resetConfiguration());
	});

	const maxCount = Math.max(...PENGUIN_COUNTS.map((d) => d.count));
	const lineData = ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina');
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">setConfiguration:</span>
		{#each Object.keys(THEMES) as name (name)}
			<button class:active={active === name} onclick={() => (active = name as ThemeName)}>
				{name}
			</button>
		{/each}
	</div>

	<p class="demo__hint">
		One call - <code>setConfiguration(theme)</code> - restyles font, colours, palette, axis, spacing,
		legend and timeline across every chart at once.
	</p>

	<div class="demo__grid">
		<LinePlot
			width={460}
			height={360}
			title="GDP per capita vs. population"
			subtitle="Theme: {active}"
			caption="The configuration is global and reactive."
			data={lineData}
			x="year"
			y="value"
			color={'metric' as keyof CountryTrendRow}
			legend={[
				{
					type: 'discrete',
					title: 'Indicator',
					columns: 2,
					items: [
						{ name: 'GDP per capita', label: 'GDP per capita', symbol: 'line' },
						{ name: 'Population', label: 'Population', symbol: 'line' }
					]
				}
			]}
		/>
		<HeatmapPlot
			width={460}
			height={360}
			title="Penguins by island"
			subtitle="Theme: {active}"
			caption="Same configuration system."
			data={PENGUIN_COUNTS}
			x={'island' as keyof PenguinSpeciesCount}
			y={'species' as keyof PenguinSpeciesCount}
			color={'count' as keyof PenguinSpeciesCount}
			scales={{ x: { label: 'Island' }, y: { label: 'Species' } }}
			legend={[
				{
					type: 'continuous',
					title: 'Penguins',
					min: 0,
					max: maxCount,
					ticks: [Math.round(maxCount / 2)],
					format: (v) => `${v}`,
					width: 180
				}
			]}
			styles={{ values: { format: (v) => `${v}` } }}
		/>
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
	.demo__hint {
		margin: 0;
		font-size: 0.85rem;
		opacity: 0.75;
	}
	.demo__hint code {
		font-family: ui-monospace, monospace;
	}
	.demo__grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}
</style>
