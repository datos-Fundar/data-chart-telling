<script lang="ts">
	import Timeline from '$lib/layout/timeline/Timeline.svelte';
	import type { Snippet } from 'svelte';
	import type { Orientation, TimeValue } from '$lib/types/layout/timeline';
	import type { PlotBoxContext } from '$lib/types/layout/figure';

	/**
	 * Splits a box between its content and a timeline gutter showing `steps`
	 * with `selectedValue` highlighted. The content is the `child` snippet,
	 * handed whatever box the gutter and `--dct-timeline-gap` leave.
	 */
	let {
		steps,
		selectedValue,
		orientation = 'vertical',
		show = true,
		thickness = 60,
		width,
		height,
		child
	}: {
		steps: TimeValue[];
		selectedValue: TimeValue;
		orientation?: Orientation;
		show?: boolean;
		thickness?: number;
		width: number;
		height: number;
		child: Snippet<[PlotBoxContext]>;
	} = $props();

	const vertical = $derived(orientation === 'vertical');

	let innerWidth = $state(0);
	let innerHeight = $state(0);
</script>

<div
	class="dct-timeline"
	class:dct-timeline--horizontal={!vertical}
	style:width="{width}px"
	style:height="{height}px"
>
	<div class="dct-timeline__plot" bind:clientWidth={innerWidth} bind:clientHeight={innerHeight}>
		{#if innerWidth > 0 && innerHeight > 0}
			{@render child({ width: innerWidth, height: innerHeight })}
		{/if}
	</div>
	{#if show}
		<div
			class="dct-timeline__gutter"
			style:width={vertical ? `${thickness}px` : undefined}
			style:height={vertical ? undefined : `${thickness}px`}
		>
			<Timeline
				currentValue={selectedValue}
				values={steps}
				{orientation}
				width={vertical ? thickness : width}
				height={vertical ? height : thickness}
			/>
		</div>
	{/if}
</div>

<style>
	.dct-timeline {
		display: flex;
		flex-direction: row;
		gap: var(--dct-timeline-gap, 12px);
	}
	.dct-timeline--horizontal {
		flex-direction: column;
	}
	.dct-timeline__plot {
		flex: 1 1 0;
		min-width: 0;
		min-height: 0;
	}
	.dct-timeline__gutter {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
