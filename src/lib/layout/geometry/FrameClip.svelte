<script lang="ts">
	import type { Snippet } from 'svelte';
	import { usePlot } from 'svelteplot';

	/**
	 * Clips its children to the plot's inner frame, so a mark drawn past a
	 * pinned scale domain stops at the axes instead of spilling into the
	 * margins. `clip: false` renders them as they are.
	 */
	let { clip = true, children }: { clip?: boolean; children: Snippet } = $props();

	const plot = usePlot();
	const clipId = `frame-clip-${Math.random().toString(36).slice(2, 9)}`;
</script>

{#if clip}
	<defs>
		<clipPath id={clipId}>
			<rect
				x={plot.options.marginLeft}
				y={plot.options.marginTop}
				width={plot.facetWidth}
				height={plot.facetHeight}
			/>
		</clipPath>
	</defs>
	<g clip-path="url(#{clipId})">
		{@render children()}
	</g>
{:else}
	{@render children()}
{/if}
