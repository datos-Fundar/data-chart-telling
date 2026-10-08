<script lang="ts" generics="TRow extends Record<string, unknown>">
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { buildSharedMargins } from '$lib/layout/facet/margins';
	import { buildFacetGridGroups, facetGridKey } from '$lib/layout/facet/config';
	import FacetCellFrame from '$lib/layout/facet/FacetCellFrame.svelte';
	import { buildAlignedCells } from '$lib/layout/facet/alignment';
	import { createMarginReports } from '$lib/layout/facet/marginReports.svelte';
	import type { FacetCellSnippet } from '$lib/types/layout/facet';
	import type { Accessor } from '$lib/types/plots/data/common';
	import type { MarginConfig } from '$lib/types/plots/props';

	/**
	 * Small multiples as a matrix: one facet per `rows` × `cols` combination,
	 * each value labelled; either accessor alone gives one row or column.
	 * Combinations without rows stay empty.
	 */
	let {
		data,
		rows,
		cols,
		rowValues,
		colValues,
		gap = 12,
		width,
		height,
		cell,
		marginsForFacet,
		align = false
	}: {
		data: TRow[];
		rows?: Accessor<TRow, unknown>;
		cols?: Accessor<TRow, unknown>;
		rowValues?: string[];
		colValues?: string[];
		gap?: number;
		width: number;
		height: number;
		cell: FacetCellSnippet<TRow>;
		marginsForFacet?: (rows: TRow[]) => MarginConfig;
		/** Sizes rows and columns so every panel gets the same box, whatever axes each facet draws - see `buildAlignedCells`. */
		align?: boolean;
	} = $props();

	const STRIP = 24;

	const getRow = $derived(rows === undefined ? null : resolveAccessor<TRow>(rows));
	const getCol = $derived(cols === undefined ? null : resolveAccessor<TRow>(cols));

	function distinct(get: ((d: TRow) => unknown) | null, given: string[] | undefined): string[] {
		if (!get) return [''];
		if (given) return given;
		return [...new Set(data.map((d) => String(get(d))))];
	}

	const rowKeys = $derived(distinct(getRow, rowValues));
	const colKeys = $derived(distinct(getCol, colValues));

	const groups = $derived(buildFacetGridGroups(data, rows, cols));
	const rowsAt = (row: string, col: string) =>
		groups.get(facetGridKey(row || undefined, col || undefined))?.rows ?? [];

	const cellMargins = $derived(
		marginsForFacet
			? buildSharedMargins(
					rowKeys.flatMap((r) => colKeys.map((c) => rowsAt(r, c))).filter((g) => g.length > 0),
					marginsForFacet
				)
			: undefined
	);

	const colStrip = $derived(getCol ? STRIP : 0);
	const rowStrip = $derived(getRow ? STRIP : 0);
	const cellWidth = $derived(
		Math.max(0, Math.floor((width - rowStrip - (colKeys.length - 1) * gap) / colKeys.length))
	);
	const cellHeight = $derived(
		Math.max(0, Math.floor((height - colStrip - (rowKeys.length - 1) * gap) / rowKeys.length))
	);

	const reports = createMarginReports();
	const aligned = $derived(
		align
			? buildAlignedCells({
					columns: colKeys.length,
					rows: rowKeys.length,
					width: width - rowStrip - (rowStrip ? gap : 0),
					height: height - colStrip - (colStrip ? gap : 0),
					gap,
					margins: rowKeys.map((row, r) =>
						colKeys.map((col, c) => (rowsAt(row, col).length ? reports.settled[`${r}:${c}`] : null))
					)
				})
			: undefined
	);
	const columnTrack = $derived(
		aligned
			? aligned.colWidths.map((w) => `${w}px`).join(' ')
			: `repeat(${colKeys.length}, ${cellWidth}px)`
	);
	const rowTrack = $derived(
		aligned
			? aligned.rowHeights.map((h) => `${h}px`).join(' ')
			: `repeat(${rowKeys.length}, ${cellHeight}px)`
	);

	function label(row: string, col: string): string {
		if (getRow && getCol) return `${row} · ${col}`;
		return getRow ? row : col;
	}
</script>

<div
	class="dct-facet-grid"
	style:width="{width}px"
	style:height="{height}px"
	style:gap="{gap}px"
	style:grid-template-columns="{columnTrack}{rowStrip ? ` ${rowStrip}px` : ''}"
	style:grid-template-rows="{colStrip ? `${colStrip}px ` : ''}{rowTrack}"
>
	{#if getCol}
		{#each colKeys as col (col)}
			<div class="dct-facet-grid__strip dct-facet-grid__strip--col">{col}</div>
		{/each}
		{#if getRow}<div></div>{/if}
	{/if}
	{#each rowKeys as row, r (row)}
		{#each colKeys as col, c (col)}
			{@const cellRows = rowsAt(row, col)}
			<div
				class="dct-facet-grid__cell"
				data-row={getRow ? row : undefined}
				data-col={getCol ? col : undefined}
			>
				{#if cellRows.length > 0 && cellWidth > 0 && cellHeight > 0}
					{@const box = aligned?.cells[r]?.[c]}
					{@const place = {
						facetValue: label(row, col),
						row: getRow ? row : undefined,
						col: getCol ? col : undefined,
						data: cellRows,
						width: box?.width ?? cellWidth,
						height: box?.height ?? cellHeight,
						margins: box ? { ...cellMargins, ...box.margins } : cellMargins,
						edges: {
							top: r === 0,
							bottom: r === rowKeys.length - 1,
							left: c === 0,
							right: c === colKeys.length - 1
						}
					}}
					{#if align}
						<FacetCellFrame pinned={box?.margins} onMargins={(m) => reports.report(`${r}:${c}`, m)}>
							{@render cell(place)}
						</FacetCellFrame>
					{:else}
						{@render cell(place)}
					{/if}
				{/if}
			</div>
		{/each}
		{#if getRow}
			<div class="dct-facet-grid__strip dct-facet-grid__strip--row">{row}</div>
		{/if}
	{/each}
</div>

<style>
	.dct-facet-grid {
		display: grid;
	}
	.dct-facet-grid__cell {
		min-width: 0;
		min-height: 0;
	}
	.dct-facet-grid__strip {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 600;
		opacity: 0.9;
		overflow: hidden;
		white-space: nowrap;
	}
	.dct-facet-grid__strip--row {
		writing-mode: vertical-rl;
	}
</style>
