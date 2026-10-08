import { getContext, setContext } from 'svelte';

/** A plot's resolved margins, as svelteplot settled them. */
export type CellMargins = { top: number; right: number; bottom: number; left: number };

const MARGIN_REPORT_KEY = Symbol('dct-margin-report');

/** Registers where the plot below reports the margins it settled on. Call during component init. */
export function provideMarginReport(report: (margins: CellMargins) => void): void {
	setContext(MARGIN_REPORT_KEY, report);
}

/** The enclosing margin report, or `null` when nothing listens. */
export function getMarginReport(): ((margins: CellMargins) => void) | null {
	return getContext<((margins: CellMargins) => void) | undefined>(MARGIN_REPORT_KEY) ?? null;
}

/** One facet's box and the margins pinned on it, so its panel lines up with its row and column. */
export type AlignedCell = { width: number; height: number; margins: CellMargins };

/**
 * Sizes a facet grid so every panel (the plot area inside its margins) has
 * the same box: each column and row takes its widest margins, which are
 * pinned on every facet in it. `undefined` until every facet has reported.
 */
export function buildAlignedCells(args: {
	columns: number;
	rows: number;
	width: number;
	height: number;
	gap: number;
	/** Height each row spends on something else (a facet title). */
	rowReserve?: number;
	/** Each slot's facet margins, `null` for an empty slot. */
	margins: (CellMargins | null | undefined)[][];
}): { colWidths: number[]; rowHeights: number[]; cells: (AlignedCell | null)[][] } | undefined {
	const { columns, rows, width, height, gap, rowReserve = 0, margins } = args;
	if (margins.some((row) => row.some((m) => m === undefined))) return undefined;
	const maxOf = (values: number[]) => (values.length ? Math.max(...values) : 0);
	const present = (r: number, c: number) => margins[r]?.[c] ?? null;
	const colLeft: number[] = [];
	const colRight: number[] = [];
	for (let c = 0; c < columns; c++) {
		const column = margins.map((row) => row[c]).filter((m): m is CellMargins => m != null);
		colLeft.push(maxOf(column.map((m) => m.left)));
		colRight.push(maxOf(column.map((m) => m.right)));
	}
	const rowTop: number[] = [];
	const rowBottom: number[] = [];
	for (let r = 0; r < rows; r++) {
		const row = (margins[r] ?? []).filter((m): m is CellMargins => m != null);
		rowTop.push(maxOf(row.map((m) => m.top)));
		rowBottom.push(maxOf(row.map((m) => m.bottom)));
	}
	const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
	const panelWidth = Math.max(
		0,
		(width - (columns - 1) * gap - sum(colLeft) - sum(colRight)) / columns
	);
	const panelHeight = Math.max(
		0,
		(height - (rows - 1) * gap - rows * rowReserve - sum(rowTop) - sum(rowBottom)) / rows
	);
	const cells = Array.from({ length: rows }, (_, r) =>
		Array.from({ length: columns }, (_, c) => {
			if (!present(r, c)) return null;
			return {
				width: Math.floor(panelWidth + colLeft[c] + colRight[c]),
				height: Math.floor(panelHeight + rowTop[r] + rowBottom[r]),
				margins: { top: rowTop[r], right: colRight[c], bottom: rowBottom[r], left: colLeft[c] }
			};
		})
	);
	return {
		colWidths: colLeft.map((l, c) => Math.floor(panelWidth + l + colRight[c])),
		rowHeights: rowTop.map((t, r) => Math.floor(panelHeight + t + rowBottom[r] + rowReserve)),
		cells
	};
}

/** `reports` with one facet's margins recorded; unchanged when they moved by 1px or less. */
export function withMarginReport(
	reports: Record<string, CellMargins>,
	key: string,
	margins: CellMargins
): Record<string, CellMargins> {
	const prev = reports[key];
	if (
		prev &&
		(['top', 'right', 'bottom', 'left'] as const).every(
			(side) => Math.abs(prev[side] - margins[side]) <= 1
		)
	)
		return reports;
	return { ...reports, [key]: margins };
}
