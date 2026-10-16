<script lang="ts">
	import type { Snippet } from 'svelte';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { FrameClipping } from '$lib/layout/geometry/FrameClipping';

	/**
	 * Clips its children to the plot's inner frame, so a mark drawn past a
	 * pinned scale domain stops at the axes instead of spilling into the
	 * margins. The frame is widened by `frameClip.tolerance` on each side so
	 * edge strokes aren't shaved off. `clip: false` renders them as they are.
	 */
	let { clip = true, children }: { clip?: boolean; children: Snippet } = $props();

	const plot = usePlot().svelteplot;
	const clipId = `frame-clip-${Math.random().toString(36).slice(2, 9)}`;
	const tolerance = $derived(FrameClipping.parse(getConfiguration().frameClip.tolerance));
	// svelteplot reports no size until it has measured, so the frame is unknown at first.
	const frame = $derived.by(() => {
		const { marginLeft, marginTop } = plot.options;
		const { facetWidth, facetHeight } = plot;
		if (![marginLeft, marginTop, facetWidth, facetHeight].every(Number.isFinite)) return null;
		return {
			x: marginLeft - tolerance.left,
			y: marginTop - tolerance.top,
			width: facetWidth + tolerance.left + tolerance.right,
			height: facetHeight + tolerance.top + tolerance.bottom
		};
	});
</script>

{#if clip}
	<defs>
		<clipPath id={clipId}>
			{#if frame}
				<rect x={frame.x} y={frame.y} width={frame.width} height={frame.height} />
			{/if}
		</clipPath>
	</defs>
	<g clip-path="url(#{clipId})">
		{@render children()}
	</g>
{:else}
	{@render children()}
{/if}
