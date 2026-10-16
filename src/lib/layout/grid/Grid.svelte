<script lang="ts">
	import { GridPlan } from '$lib/layout/grid/GridPlan';
	import { GridCellsRegistry } from '$lib/layout/grid/GridCellsRegistry.svelte';
	import type { GridCellLayout } from '$lib/types/layout/grid';
	import { Tags } from '$lib/layout/grid/Tags';
	import { HoverState } from '$lib/layout/hover/HoverState.svelte';
	import type { Snippet } from 'svelte';
	import type { ComposerTags } from '$lib/types/layout/composer';

	/**
	 * The grid both facets and composers lay their panels out on. `GridCell`
	 * children register into it and get a pixel box: a named `area`, an
	 * explicit `row`/`col`, or the next free slot of `columns`; `widths` and
	 * `heights` weigh the tracks. `header` reserves a label row above every
	 * cell; `colLabels`/`rowLabels` add a strip above the columns and beside
	 * the rows. With `align`, the grid waits for every cell's plot to report
	 * its margins, then sizes tracks so every plot area lines up. `tags`
	 * labels the cells in order, and `scoped` gives each its own hover scope -
	 * how a `PlotComposer` marks its panels.
	 */
	let {
		width,
		height,
		columns,
		rows,
		areas,
		widths,
		heights,
		gap = 12,
		header = 0,
		align = false,
		colLabels,
		rowLabels,
		strip = 24,
		tags,
		scoped = false,
		children
	}: {
		width: number;
		height: number;
		columns?: number;
		/** At least this many rows, even when the last ones stay empty. */
		rows?: number;
		areas?: string[];
		widths?: number[];
		heights?: number[];
		gap?: number;
		header?: number;
		align?: boolean;
		colLabels?: string[];
		rowLabels?: string[];
		strip?: number;
		/** Labels every cell without its own, in the order they register - see {@link Tags}. */
		tags?: ComposerTags;
		/** Whether each cell gives what it draws its own hover-scope id, under the one in scope here. */
		scoped?: boolean;
		children: Snippet;
	} = $props();

	const parentScope = HoverState.scope();
	const tagSequence = $derived(tags === undefined ? undefined : new Tags(tags));
	// The cells below register here; each is tagged and scoped by its registration order.
	const grid = new GridCellsRegistry({
		layouts: () => layouts,
		header: () => header,
		aligned: () => align,
		tag: (index) => tagSequence?.at(index),
		scope: (index) => {
			if (!scoped) return undefined;
			const parent = parentScope();
			return parent ? `${parent}/panel-${index}` : `panel-${index}`;
		}
	});
	grid.provide();

	const resolved = $derived(grid.requests);
	const slotted = $derived(resolved.filter((cell) => !cell.inset));

	const plan = $derived(new GridPlan(slotted, { areas, columns, rows }));

	const colStrip = $derived(colLabels?.length ? strip : 0);
	const rowStrip = $derived(rowLabels?.length ? strip : 0);
	const innerWidth = $derived(width - (rowStrip ? rowStrip + gap : 0));
	const innerHeight = $derived(height - (colStrip ? colStrip + gap : 0));

	const tracks = $derived(
		plan.tracks({
			width: innerWidth,
			height: innerHeight,
			gap,
			header,
			widths,
			heights,
			margins: align ? slotted.map((cell) => grid.alignment.settled[cell.id]) : undefined
		})
	);

	/** The px size of `count` tracks from `from`, gaps between them included. */
	const spanSize = (sizes: number[], from: number, count: number) =>
		sizes.slice(from, from + count).reduce((a, b) => a + b, 0) + (count - 1) * gap;

	const rowOffset = $derived(colStrip ? 2 : 1);

	const layouts = $derived.by(() => {
		const out: Record<string, GridCellLayout> = {};
		slotted.forEach((cell, i) => {
			const span = plan.spans[i];
			out[cell.id] = {
				gridRow: `${span.row + rowOffset} / span ${span.rowSpan}`,
				gridColumn: `${span.col + 1} / span ${span.colSpan}`,
				box: tracks.boxes[i],
				edges: plan.edges[i]
			};
		});
		for (const cell of resolved) {
			if (!cell.inset) continue;
			const area = cell.area && areas ? areaBox(cell.area) : null;
			const box = area ?? { width: innerWidth, height: innerHeight };
			out[cell.id] = {
				gridRow: area ? area.gridRow : undefined,
				gridColumn: area ? area.gridColumn : undefined,
				box: {
					width: Math.max(0, Math.floor(box.width * (cell.inset.right - cell.inset.left))),
					height: Math.max(
						0,
						Math.floor(box.height * (cell.inset.top - cell.inset.bottom)) - header
					)
				},
				edges: { top: true, right: true, bottom: true, left: true }
			};
		}
		return out;
	});

	/** A named area's px box and CSS placement, for an inset floating over it. */
	function areaBox(name: string) {
		const span = plan.areaSpan(name) ?? { row: 0, col: 0, rowSpan: 1, colSpan: 1 };
		return {
			width: spanSize(tracks.colWidths, span.col, span.colSpan),
			height: spanSize(tracks.rowHeights, span.row, span.rowSpan),
			gridRow: `${span.row + rowOffset} / span ${span.rowSpan}`,
			gridColumn: `${span.col + 1} / span ${span.colSpan}`
		};
	}
</script>

<div
	class="dct-grid"
	style:width="{width}px"
	style:height="{height}px"
	style:gap="{gap}px"
	style:grid-template-columns="{tracks.colWidths.map((w) => `${w}px`).join(' ')}{rowStrip
		? ` ${rowStrip}px`
		: ''}"
	style:grid-template-rows="{colStrip ? `${colStrip}px ` : ''}{tracks.rowHeights
		.map((h) => `${h}px`)
		.join(' ')}"
>
	{#each colLabels ?? [] as label, c (c)}
		<div class="dct-grid__strip dct-grid__strip--col" style:grid-row="1" style:grid-column={c + 1}>
			{label}
		</div>
	{/each}
	{#each rowLabels ?? [] as label, r (r)}
		<div
			class="dct-grid__strip dct-grid__strip--row"
			style:grid-row={r + rowOffset}
			style:grid-column={plan.columns + 1}
		>
			{label}
		</div>
	{/each}
	{@render children()}
</div>

<style>
	.dct-grid {
		position: relative;
		display: grid;
	}
	.dct-grid__strip {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 600;
		opacity: 0.9;
		overflow: hidden;
		white-space: nowrap;
	}
	.dct-grid__strip--row {
		writing-mode: vertical-rl;
	}
</style>
