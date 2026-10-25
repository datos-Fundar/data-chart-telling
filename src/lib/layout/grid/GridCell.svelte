<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { GridCellsRegistry } from '$lib/layout/grid/GridCellsRegistry.svelte';
	import { CellAlignment } from '$lib/layout/grid/GridAlignment.svelte';
	import { HoverState } from '$lib/layout/hover/HoverState.svelte';
	import type { GridCellSnippet, GridInset } from '$lib/types/layout/grid';
	import type { HTMLAttributes } from 'svelte/elements';

	/**
	 * One cell of a `Grid`: takes the slot it asks for (a named `area`,
	 * an explicit `row`/`col`, or the next free one) and hands its box to
	 * `children`. With `inset`, it floats over its area instead of taking a
	 * slot. `label` fills the grid's `header` row above the cell - centered
	 * like a facet title, or flush left like a panel tag (the grid's own tag
	 * for the cell, when it tags them). In an aligned grid, the plot inside
	 * reports its margins and gets the grid's pinned ones. Anything a figure
	 * can't be drawn as on its own - a legend, a note - goes in one.
	 */
	let {
		area,
		row,
		col,
		rowSpan,
		colSpan,
		inset,
		label,
		labelKind = 'title',
		class: className,
		children,
		...rest
	}: {
		area?: string;
		row?: number;
		col?: number;
		rowSpan?: number;
		colSpan?: number;
		inset?: GridInset;
		label?: string;
		labelKind?: 'title' | 'tag';
		class?: string;
		children: GridCellSnippet;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> = $props();

	const grid = GridCellsRegistry.current();
	if (!grid) console.warn('GridCell: render it inside a `Grid`.');

	const id = grid?.register(() => ({ area, row, col, rowSpan, colSpan, inset }));
	onDestroy(() => {
		if (id) grid?.unregister(id);
	});

	const layout = $derived(id ? grid?.layout(id) : undefined);
	const header = $derived(grid?.header ?? 0);
	// Without a label of its own, the cell reads as the grid's tag for it.
	const tag = $derived(id ? grid?.tagOf(id) : undefined);
	const shownLabel = $derived(label ?? tag);
	const shownKind = $derived(label === undefined && tag !== undefined ? 'tag' : labelKind);

	const scope = id ? grid?.scopeOf(id) : undefined;
	if (scope !== undefined) HoverState.provideScope(() => scope);
	// What the cell draws is placed: a figure below it takes no cell of its own.
	GridCellsRegistry.leave();

	new CellAlignment(
		(margins) => {
			if (id) grid?.report(id, margins);
		},
		() => layout?.box.margins
	).provide();

	// Draw only once every sibling registered, so the plot's first render already sees its final box and edges.
	let ready = $state(false);
	onMount(() => {
		ready = true;
	});
</script>

<div
	{...rest}
	class={['dct-grid-cell', className]}
	class:dct-grid-cell--inset={inset}
	style:grid-row={layout?.gridRow}
	style:grid-column={layout?.gridColumn}
	style:left={inset ? `${inset.left * 100}%` : undefined}
	style:top={inset ? `${(1 - inset.top) * 100}%` : undefined}
	style:width={inset ? `${(inset.right - inset.left) * 100}%` : undefined}
	style:height={inset ? `${(inset.top - inset.bottom) * 100}%` : undefined}
>
	{#if header > 0}
		<div
			class="dct-grid-cell__label"
			class:dct-grid-cell__label--tag={shownKind === 'tag'}
			style:height="{header}px"
		>
			{shownLabel ?? ''}
		</div>
	{/if}
	{#if ready && layout && layout.box.width > 0 && layout.box.height > 0}
		{@render children({
			width: layout.box.width,
			height: layout.box.height,
			margins: layout.box.margins,
			edges: layout.edges
		})}
	{/if}
</div>

<style>
	.dct-grid-cell {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}
	.dct-grid-cell--inset {
		position: absolute;
		z-index: 1;
		background: var(--dct-cell-inset-bg, var(--dct-bg, Canvas));
	}
	.dct-grid-cell__label {
		flex: 0 0 auto;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-size: 0.85rem;
		font-weight: 600;
		text-align: center;
		opacity: 0.9;
	}
	.dct-grid-cell__label--tag {
		font-family: var(--dct-title-font, inherit);
		font-size: var(--dct-cell-tag-size, 1rem);
		font-weight: var(--dct-cell-tag-weight, 600);
		line-height: 1.2;
		text-align: start;
		opacity: 1;
	}
</style>
