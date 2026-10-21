<script lang="ts">
	import { untrack } from 'svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
	import { PROVINCE_VALUES } from '$examples/data';

	let {
		enabled = true,
		width = 320
	}: {
		/** Where `axis.autoRotate` starts; the toggle switches it live. */
		enabled?: boolean;
		/** Where the plot's width starts; the slider changes it live. */
		width?: number;
	} = $props();

	let on = $state(untrack(() => enabled));
	let plotWidth = $state(untrack(() => width));

	// A plain statement, so the configuration is set before the plot mounts.
	resetConfiguration();
	setConfiguration({ axis: { autoRotate: untrack(() => on) } });

	$effect(() => {
		const autoRotate = on;
		untrack(() => setConfiguration({ axis: { autoRotate } }));
		return () => untrack(() => resetConfiguration());
	});
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">axis.autoRotate:</span>
		<button class:active={on} onclick={() => (on = !on)}>{on ? 'true' : 'false'}</button>
	</div>
	<div class="demo__controls">
		<span class="demo__label">width: {plotWidth}px</span>
		<input type="range" min="120" max="720" step="10" bind:value={plotWidth} />
	</div>

	<!-- `autoRotate` is read when a plot mounts, so the plot remounts when it changes. -->
	{#key on}
		<BarPlot
			width={plotWidth}
			height={320}
			data={PROVINCE_VALUES}
			x="province"
			y="value"
			color="sex"
			scales={{ y: { domain: [70, 85] } }}
		/>
	{/key}
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: 12px;
		font-family: system-ui, sans-serif;
		font-size: 14px;
	}
	.demo__controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.demo__label {
		min-width: 140px;
	}
	button {
		padding: 4px 10px;
		border: 1px solid #94a3b8;
		border-radius: 6px;
		background: white;
		cursor: pointer;
	}
	button.active {
		background: #1e293b;
		color: white;
	}
</style>
