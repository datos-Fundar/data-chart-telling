<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { LIFE } from '$datasets';
	import type { HoverStrategy } from '$lib/types/layout/hover';

	// A step of a story picks how the hover reaches the points; the plot's own hover follows it.
	const STEPS: { strategy: HoverStrategy; caption: string }[] = [
		{ strategy: 'x', caption: 'Every line at the hovered year, with a crosshair along it' },
		{
			strategy: 'punctual',
			caption: 'The one point under the pointer, with a crosshair through it'
		},
		{ strategy: 'series', caption: 'Every point of the hovered line, without a crosshair' }
	];
	let step = $state(0);
</script>

<div style="display: flex; gap: 8px; margin-bottom: 8px;">
	{#each STEPS as { strategy }, i (strategy)}
		<button type="button" aria-pressed={step === i} onclick={() => (step = i)}>
			{strategy}
		</button>
	{/each}
</div>
<p style="margin: 0 0 8px;">{STEPS[step].caption}</p>

<PlotComposer width={760} height={380} hover={{ strategy: STEPS[step].strategy }}>
	<LinePlot data={LIFE} x="year" y="value" color="sex" tooltip markers={[{ type: 'hover' }]} />
</PlotComposer>
