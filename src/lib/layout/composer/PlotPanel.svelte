<script lang="ts">
	import { getComposer } from '$lib/layout/composer/context';
	import { provideHoverScope } from '$lib/layout/tooltip/hoverScope';
	import type { PanelInset, PanelSnippet } from '$lib/types/layout/composer';

	/**
	 * One cell of a `PlotComposer`, on its `area` (or the next free cell). It
	 * measures its box and hands `{ width, height }` to `children`. With
	 * `inset`, it floats over its area instead of taking a cell.
	 */
	let {
		area,
		inset,
		children
	}: {
		area?: string;
		inset?: PanelInset;
		children: PanelSnippet
	} = $props();

	const composer = getComposer();
	if (!composer) console.warn('PlotPanel: render it inside a `PlotComposer`.');
	// svelte-ignore state_referenced_locally
	const index = composer?.register(inset != null) ?? 0;
	const tag = composer?.tagOf(index);

	const parentScope = composer?.scope() ?? '';
	provideHoverScope(() => (parentScope ? `${parentScope}/panel-${index}` : `panel-${index}`));

	let bodyWidth = $state(0);
	let bodyHeight = $state(0);
</script>

<div
	class="dct-panel"
	class:dct-panel--inset={inset}
	style:grid-area={area}
	style:left={inset ? `${inset.left * 100}%` : undefined}
	style:top={inset ? `${(1 - inset.top) * 100}%` : undefined}
	style:width={inset ? `${(inset.right - inset.left) * 100}%` : undefined}
	style:height={inset ? `${(inset.top - inset.bottom) * 100}%` : undefined}
>
	{#if tag}
		<div class="dct-panel__tag">{tag}</div>
	{/if}
	<div class="dct-panel__body" bind:clientWidth={bodyWidth} bind:clientHeight={bodyHeight}>
		{#if bodyWidth > 0 && bodyHeight > 0}
			{@render children({ width: bodyWidth, height: bodyHeight })}
		{/if}
	</div>
</div>

<style>
	.dct-panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}
	.dct-panel--inset {
		position: absolute;
		z-index: 1;
		background: var(--dct-panel-inset-bg, var(--dct-bg, Canvas));
	}
	.dct-panel__tag {
		flex: 0 0 auto;
		font-family: var(--dct-title-font, inherit);
		font-size: var(--dct-panel-tag-size, 1rem);
		font-weight: var(--dct-panel-tag-weight, 600);
		line-height: 1.2;
	}
	.dct-panel__body {
		flex: 1 1 auto;
		min-width: 0;
		min-height: 0;
	}
</style>
