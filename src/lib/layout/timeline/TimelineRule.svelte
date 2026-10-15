<script lang="ts">
	import Timeline from '$lib/layout/timeline/Timeline.svelte';
	import type { TimelineState } from '$lib/layout/timeline/TimelineState.svelte';

	/**
	 * A timeline drawn as a rule: a line with the steps written along it, the
	 * current one emphasised. It takes `thickness` across and, along it, the
	 * room the chrome gives it - measured, so a vertical rule lines up with
	 * the plot beside it - and draws the {@link TimelineState} it is handed.
	 */
	let { timeline }: { timeline: TimelineState } = $props();

	const vertical = $derived(timeline.orientation === 'vertical');

	let measuredWidth = $state(0);
	let measuredHeight = $state(0);
</script>

<div
	class="dct-timeline-rule"
	style:width={vertical ? `${timeline.thickness}px` : '100%'}
	style:height={vertical ? '100%' : `${timeline.thickness}px`}
	bind:clientWidth={measuredWidth}
	bind:clientHeight={measuredHeight}
>
	{#if measuredWidth > 0 && measuredHeight > 0 && timeline.value !== undefined}
		<div class="dct-timeline-rule__box">
			<Timeline
				currentValue={timeline.value}
				values={timeline.steps}
				orientation={timeline.orientation}
				width={measuredWidth}
				height={measuredHeight}
			/>
		</div>
	{/if}
</div>

<style>
	.dct-timeline-rule {
		position: relative;
		min-width: 0;
		min-height: 0;
	}
	/* Out of flow, so the rule's own size doesn't feed back into the box it is measured in. */
	.dct-timeline-rule__box {
		position: absolute;
		inset: 0;
	}
</style>
