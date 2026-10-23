<script lang="ts">
	import { untrack } from 'svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
	import type { Series } from '$lib/types/plots/data/common';
	import type { EdgeTickCollision } from '$lib/types/layout/scales';
	import { FEMALE_LIFE, type LifeRow } from '$datasets';

	let {
		enabled = true,
		collision = 'drop-nice',
		nice = true
	}: {
		/** Where `axis.edgeTicks.x.enabled` starts; the toggle switches it live. */
		enabled?: boolean;
		/** Where `axis.edgeTicks.x.collision` starts; the buttons switch it live. */
		collision?: EdgeTickCollision;
		/** Where `scales.x.nice` starts; the toggle switches it live. */
		nice?: boolean;
	} = $props();

	const series = [
		{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE }
	] satisfies Series<LifeRow>[];

	const STRATEGIES: EdgeTickCollision[] = ['drop-nice', 'drop-edge', 'extend'];

	let on = $state(untrack(() => enabled));
	let strategy = $state(untrack(() => collision));
	let rounded = $state(untrack(() => nice));

	// A plain statement, so the configuration is set before the plot mounts.
	resetConfiguration();
	setConfiguration({
		axis: { edgeTicks: { x: untrack(() => ({ enabled: on, collision: strategy })) } }
	});

	$effect(() => {
		const x = { enabled: on, collision: strategy };
		untrack(() => setConfiguration({ axis: { edgeTicks: { x } } }));
		return () => untrack(() => resetConfiguration());
	});
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">scales.x.nice:</span>
		<button class:active={rounded} onclick={() => (rounded = !rounded)}>
			{rounded ? 'true' : 'false'}
		</button>
	</div>
	<div class="demo__controls">
		<span class="demo__label">axis.edgeTicks.x.enabled:</span>
		<button class:active={on} onclick={() => (on = !on)}>{on ? 'true' : 'false'}</button>
	</div>
	<div class="demo__controls">
		<span class="demo__label">axis.edgeTicks.x.collision:</span>
		{#each STRATEGIES as option (option)}
			<button class:active={strategy === option} onclick={() => (strategy = option)}>
				{option}
			</button>
		{/each}
	</div>

	<LinePlot width={720} height={360} {series} scales={{ x: { nice: rounded } }} />
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
</style>
