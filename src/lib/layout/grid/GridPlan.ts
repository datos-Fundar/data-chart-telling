import { Margins } from '$lib/layout/margins/Margins';
import type { CellBox, CellEdges, GridCellSpec, GridSpan } from '$lib/types/layout/grid';

/**
 * Where a grid's cells sit, without Svelte: each cell's slot - a named
 * `area`'s box in `areas`, an explicit `row`/`col` of its own, or, in order,
 * the next slot nothing claimed (adding rows as needed) - the grid's size,
 * which sides of each cell face no other cell, and the pixel tracks for a
 * box ({@link GridPlan.tracks}). Without `areas`, `columns` defaults to the
 * smallest square that fits every cell.
 */
export class GridPlan {
	readonly rows: number;
	readonly columns: number;
	/** Each cell's slot, in the order the cells came. */
	readonly spans: GridSpan[];
	readonly #areas: string[][] | undefined;
	#edges: CellEdges[] | undefined;

	constructor(
		cells: GridCellSpec[],
		options: {
			areas?: string[];
			columns?: number;
			/** At least this many rows, even when the last ones stay empty. */
			rows?: number;
		} = {}
	) {
		const args = { cells, ...options };
		const areaRows = GridPlan.#parseAreas(args.areas);
		const columns = Math.max(
			1,
			areaRows?.[0]?.length ?? args.columns ?? Math.ceil(Math.sqrt(args.cells.length || 1))
		);
		const taken = new Set<string>();
		const claim = (span: GridSpan) => {
			for (let r = span.row; r < span.row + span.rowSpan; r++)
				for (let c = span.col; c < span.col + span.colSpan; c++) taken.add(`${r}:${c}`);
		};

		const spans: (GridSpan | null)[] = args.cells.map((cell) => {
			const named = cell.area && areaRows ? GridPlan.#areaSpan(areaRows, cell.area) : null;
			const span =
				named ??
				(cell.row !== undefined || cell.col !== undefined
					? {
							row: cell.row ?? 0,
							col: cell.col ?? 0,
							rowSpan: cell.rowSpan ?? 1,
							colSpan: cell.colSpan ?? 1
						}
					: null);
			if (span) claim(span);
			return span;
		});

		// Named areas no cell uses still keep their slots, as CSS grid would.
		areaRows?.forEach((row, r) => row.forEach((name, c) => name !== '.' && taken.add(`${r}:${c}`)));

		let next = 0;
		const placed = spans.map((span) => {
			if (span) return span;
			while (taken.has(`${Math.floor(next / columns)}:${next % columns}`)) next++;
			const flowed = {
				row: Math.floor(next / columns),
				col: next % columns,
				rowSpan: 1,
				colSpan: 1
			};
			claim(flowed);
			return flowed;
		});

		const rows = Math.max(
			areaRows?.length ?? 0,
			args.rows ?? 1,
			1,
			...placed.map((span) => span.row + span.rowSpan)
		);
		this.#areas = areaRows;
		this.rows = rows;
		this.columns = columns;
		this.spans = placed;
	}

	/** Which sides of each cell face no other cell - where an `'outer'` axis draws. */
	get edges(): CellEdges[] {
		this.#edges ??= this.#buildEdges();
		return this.#edges;
	}

	/** The slot a named area covers, or `null` when it isn't in `areas`. */
	areaSpan(name: string): GridSpan | null {
		return this.#areas ? GridPlan.#areaSpan(this.#areas, name) : null;
	}

	/**
	 * Pixel tracks for a `width` x `height` box and every cell's box. Each
	 * track's panel share follows its weight (`widths`, `heights`). With
	 * `margins` (one per cell, all reported), every column takes the widest
	 * left margin among cells starting in it and the widest right among cells
	 * ending in it - rows likewise - and those margins are pinned on the
	 * cells, so every plot area lines up with its row and column. `header` is
	 * the height each row spends above its cells (a label).
	 */
	tracks(args: {
		width: number;
		height: number;
		gap: number;
		header?: number;
		widths?: number[];
		heights?: number[];
		margins?: (Margins | undefined)[];
	}): { colWidths: number[]; rowHeights: number[]; boxes: CellBox[] } {
		const { rows, columns, spans } = this;
		const { width, height, gap, header = 0 } = args;
		const aligned = args.margins != null && args.margins.every((m) => m !== undefined);
		const marginOf = (i: number) => (aligned ? args.margins![i]! : Margins.ZERO);

		const colLeft = Array.from({ length: columns }, () => 0);
		const colRight = Array.from({ length: columns }, () => 0);
		const rowTop = Array.from({ length: rows }, () => 0);
		const rowBottom = Array.from({ length: rows }, () => 0);
		spans.forEach((span, i) => {
			const m = marginOf(i);
			const lastCol = span.col + span.colSpan - 1;
			const lastRow = span.row + span.rowSpan - 1;
			colLeft[span.col] = Math.max(colLeft[span.col], m.left);
			colRight[lastCol] = Math.max(colRight[lastCol], m.right);
			rowTop[span.row] = Math.max(rowTop[span.row], m.top);
			rowBottom[lastRow] = Math.max(rowBottom[lastRow], m.bottom);
		});

		const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
		const share = (total: number, weights: number[]) => {
			const whole = sum(weights) || 1;
			return weights.map((w) => (Math.max(0, total) * w) / whole);
		};
		const panelWidths = share(
			width - (columns - 1) * gap - sum(colLeft) - sum(colRight),
			GridPlan.#weights(args.widths, columns)
		);
		const panelHeights = share(
			height - (rows - 1) * gap - rows * header - sum(rowTop) - sum(rowBottom),
			GridPlan.#weights(args.heights, rows)
		);
		const colWidths = panelWidths.map((w, c) => colLeft[c] + w + colRight[c]);
		const rowHeights = panelHeights.map((h, r) => header + rowTop[r] + h + rowBottom[r]);

		const span = (tracks: number[], from: number, count: number) =>
			sum(tracks.slice(from, from + count)) + (count - 1) * gap;
		const boxes = spans.map((s) => ({
			width: Math.max(0, Math.floor(span(colWidths, s.col, s.colSpan))),
			height: Math.max(0, Math.floor(span(rowHeights, s.row, s.rowSpan) - header)),
			...(aligned
				? {
						margins: new Margins(
							rowTop[s.row],
							colRight[s.col + s.colSpan - 1],
							rowBottom[s.row + s.rowSpan - 1],
							colLeft[s.col]
						)
					}
				: {})
		}));
		return { colWidths, rowHeights, boxes };
	}

	#buildEdges(): CellEdges[] {
		const occupied = new Set<string>();
		for (const span of this.spans)
			for (let r = span.row; r < span.row + span.rowSpan; r++)
				for (let c = span.col; c < span.col + span.colSpan; c++) occupied.add(`${r}:${c}`);
		const any = (cells: [number, number][]) => cells.some(([r, c]) => occupied.has(`${r}:${c}`));
		const range = (from: number, count: number) =>
			Array.from({ length: count }, (_, i) => from + i);
		return this.spans.map((span) => {
			const cols = range(span.col, span.colSpan);
			const rows = range(span.row, span.rowSpan);
			return {
				top: !any(cols.map((c) => [span.row - 1, c])),
				bottom: !any(cols.map((c) => [span.row + span.rowSpan, c])),
				left: !any(rows.map((r) => [r, span.col - 1])),
				right: !any(rows.map((r) => [r, span.col + span.colSpan]))
			};
		});
	}

	/** `areas` rows split into their cell names. */
	static #parseAreas(areas: string[] | undefined): string[][] | undefined {
		return areas?.map((row) => row.trim().split(/\s+/));
	}

	/** The slot a named area covers: the bounding box of its cells, or `null` when it isn't in `areas`. */
	static #areaSpan(areas: string[][], name: string): GridSpan | null {
		let top = Infinity;
		let left = Infinity;
		let bottom = -1;
		let right = -1;
		areas.forEach((row, r) =>
			row.forEach((cell, c) => {
				if (cell !== name) return;
				top = Math.min(top, r);
				left = Math.min(left, c);
				bottom = Math.max(bottom, r);
				right = Math.max(right, c);
			})
		);
		if (bottom < 0) return null;
		return { row: top, col: left, rowSpan: bottom - top + 1, colSpan: right - left + 1 };
	}

	/** `weights` when they match `count` tracks, else equal ones. */
	static #weights(weights: number[] | undefined, count: number): number[] {
		return weights?.length === count ? weights : Array.from({ length: count }, () => 1);
	}
}
