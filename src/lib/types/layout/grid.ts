import type { Snippet } from 'svelte';
import type { Margins } from '$lib/layout/margins/Margins';

/** Where a cell sits in its grid - whether each of its sides is on the grid's outer edge (no cell beyond it). */
export type CellEdges = { top: boolean; right: boolean; bottom: boolean; left: boolean };

/** A cell's slot: its top-left track and how many tracks it spans. */
export type GridSpan = { row: number; col: number; rowSpan: number; colSpan: number };

/** Where a cell asks to sit: a named `area`, an explicit `row`/`col`, or - with neither - the next free slot. */
export type GridCellSpec = {
	area?: string;
	row?: number;
	col?: number;
	rowSpan?: number;
	colSpan?: number;
};

/** A floating cell's box as fractions of its area (or of the whole grid), from the left and bottom edges. */
export type GridInset = { left: number; bottom: number; right: number; top: number };

/**
 * Where a figure drawn straight inside a `Grid` (a `PlotComposer`'s)
 * sits: a named `area`, or - with `inset` - a box floating over its area.
 * Without either, it takes the next free cell.
 */
export type GridPlacement = { area?: string; inset?: GridInset };

/** The box a grid cell hands its content. */
export type GridCellContext = {
	width: number;
	height: number;
	/** The margins pinned on the cell's plot so its panel lines up with its row and column - only in an aligned grid. */
	margins?: Margins;
	edges: CellEdges;
};
export type GridCellSnippet = Snippet<[GridCellContext]>;

/** One cell's box: its size and, in an aligned grid, the margins pinned on it. */
export type CellBox = { width: number; height: number; margins?: Margins };

/** What a cell asks of its grid: a slot, or - with `inset` - a box floating over one. */
export type GridCellRequest = GridCellSpec & { inset?: GridInset };

/** Where the grid put a cell: its CSS placement, its box and which sides face the grid's edge. */
export type GridCellLayout = {
	gridRow?: string;
	gridColumn?: string;
	box: CellBox;
	edges: CellEdges;
};
