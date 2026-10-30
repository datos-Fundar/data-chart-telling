<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { LegendDisabledAction } from '$lib/types/layout/legend';
	import { PRICES } from '$datasets';

	// Calling $props() (even unused) keeps this component's inferred prop type
	// permissive - without it, Storybook's bare `render: () => ({ Component })`
	// typing rejects a zero-prop-plus-runes component.
	const props = $props();
	// svelte-ignore state_referenced_locally
	void props;

	const COMMODITIES = ['Brent oil', 'Natural gas', 'Coal', 'Wheat'];
	const MODES = ['dim', 'hide', 'omit'] as const;

	let mode = $state<(typeof MODES)[number]>('dim');
	let off = $state<string[]>([]);
	let highlighted = $state<string[]>([]);

	const action = $derived<LegendDisabledAction>({ mode });
	const toggle = (name: string) => {
		highlighted = [];
		off = off.includes(name) ? off.filter((other) => other !== name) : [...off, name];
	};
	const highlight = (name: string) => {
		off = [];
		highlighted = highlighted.includes(name)
			? highlighted.filter((other) => other !== name)
			: [...highlighted, name];
	};
</script>

<!--
	`legend.off` and `legend.highlight` turn series off from code, the way a
	click on the legend does: the series fades in the plot and in the legend
	together. `off` takes a name → action map (here the mode you pick),
	`highlight` keeps the series you pick on (one or several) and dims the rest. Clicking the legend
	still works alongside them.
-->
<div class="controls">
	<span>What turning off does:</span>
	{#each MODES as option (option)}
		<label><input type="radio" bind:group={mode} value={option} /> {option}</label>
	{/each}
</div>
<div class="controls">
	<span>Turn off:</span>
	{#each COMMODITIES as name (name)}
		<button class:active={off.includes(name)} onclick={() => toggle(name)}>{name}</button>
	{/each}
</div>
<div class="controls">
	<span>Highlight (pick several; dims the rest):</span>
	{#each COMMODITIES as name (name)}
		<button class:active={highlighted.includes(name)} onclick={() => highlight(name)}>{name}</button
		>
	{/each}
</div>

<LinePlot
	width={760}
	height={380}
	title="Commodity prices"
	data={PRICES}
	x="date"
	y="index"
	color="commodity"
	legend={{
		off: Object.fromEntries(off.map((name) => [name, action])),
		highlight: highlighted.length > 0 ? highlighted : undefined,
		series: { interactive: { enabled: true, disabled: action } }
	}}
/>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
		font-size: 13px;
	}
	button {
		padding: 2px 10px;
		border: 1px solid #bbb;
		border-radius: 12px;
		background: white;
		cursor: pointer;
	}
	button.active {
		background: #4f46e5;
		border-color: #4f46e5;
		color: white;
	}
</style>
