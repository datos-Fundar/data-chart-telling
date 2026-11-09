import type {
	BoxChannels,
	BoxEdge,
	BoxGeometryOf,
	BoxScales,
	BoxShape,
	BoxSizer,
	BoxedMarker
} from '$lib/types/markers/labels/box';

const read =
	(edge: BoxEdge) =>
	(row: unknown): unknown =>
		typeof edge === 'function'
			? (edge as (row: unknown) => unknown)(row)
			: typeof edge === 'string' || typeof edge === 'symbol'
				? (row as Record<string | symbol, unknown>)?.[edge]
				: edge;

const middle = (from: unknown, to: unknown) =>
	from instanceof Date || to instanceof Date
		? new Date((Number(from) + Number(to)) / 2)
		: (Number(from) + Number(to)) / 2;

const bandwidth = (scale: BoxScales[string]) =>
	scale?.type === 'band' ? Number(scale.fn.bandwidth()) : undefined;

const distance = (scale: BoxScales[string], from: unknown, to: unknown) =>
	scale ? Math.abs(Number(scale.fn(to)) - Number(scale.fn(from))) : undefined;

/** The box each row of a marker spans, as its kind's {@link BoxShape} tells it. */
export class BoxGeometry {
	static of(
		shape: BoxShape,
		marker: BoxedMarker,
		plot: { isHorizontal?: boolean } = {}
	): BoxGeometryOf | undefined {
		if (shape === 'cell') return BoxGeometry.#cell(marker);
		if (shape === 'band') {
			return marker.role === 'hitArea'
				? undefined
				: BoxGeometry.#band(marker, marker.isHorizontal ?? plot.isHorizontal ?? false);
		}
		return BoxGeometry.#edges(marker);
	}

	/** A style of the marker, only when it is a number. */
	static #style(marker: BoxedMarker, name: string): unknown {
		const value = (marker.styles as Record<string, unknown> | undefined)?.[name];
		return typeof value === 'number' ? value : undefined;
	}

	static #edges({ x, y, x1, x2, y1, y2 }: BoxedMarker): BoxGeometryOf | undefined {
		// A side with only a value runs from zero to it, as a bar does.
		if (
			y1 === undefined &&
			y2 === undefined &&
			y !== undefined &&
			x1 !== undefined &&
			x2 !== undefined
		) {
			[y1, y2] = [0, y];
		}
		if (
			x1 === undefined &&
			x2 === undefined &&
			x !== undefined &&
			y1 !== undefined &&
			y2 !== undefined
		) {
			[x1, x2] = [0, x];
		}
		if ([x1, x2, y1, y2].some((edge) => edge === undefined)) return undefined;
		const [left, right, top, bottom] = [x1, x2, y1, y2].map(read);
		const size: BoxSizer = (row, scales) => {
			const [width, height] = [
				distance(scales.x, left(row), right(row)),
				distance(scales.y, top(row), bottom(row))
			];
			return width === undefined || height === undefined ? undefined : { width, height };
		};
		return {
			box: { x1, x2, y1, y2 } as BoxChannels,
			size,
			x: (row: unknown) => middle(left(row), right(row)),
			y: (row: unknown) => middle(top(row), bottom(row))
		};
	}

	static #cell(marker: BoxedMarker): BoxGeometryOf | undefined {
		if (marker.x === undefined || marker.y === undefined) return undefined;
		const inset = Number(BoxGeometry.#style(marker, 'inset') ?? 0.5);
		const box: BoxSizer = (_, scales) => {
			const [width, height] = [bandwidth(scales.x), bandwidth(scales.y)];
			return width === undefined || height === undefined
				? undefined
				: { width: width - 2 * inset, height: height - 2 * inset };
		};
		return { box, size: box, x: marker.x, y: marker.y };
	}

	static #band(marker: BoxedMarker, isHorizontal: boolean): BoxGeometryOf | undefined {
		const [category, from, to] = isHorizontal
			? [marker.y, marker.x1, marker.x2]
			: [marker.x, marker.y1, marker.y2];
		const value = isHorizontal ? marker.x : marker.y;
		const [start, end] = from !== undefined && to !== undefined ? [from, to] : [0, value];
		if (category === undefined || end === undefined) return undefined;
		const [first, last] = [start, end].map(read);
		const [before, after] = isHorizontal
			? [BoxGeometry.#style(marker, 'insetTop'), BoxGeometry.#style(marker, 'insetBottom')]
			: [BoxGeometry.#style(marker, 'insetLeft'), BoxGeometry.#style(marker, 'insetRight')];
		const middleOf = (row: unknown) => middle(first(row), last(row));
		const box: BoxSizer = (row, scales) => {
			const band = bandwidth(isHorizontal ? scales.y : scales.x);
			const length = distance(isHorizontal ? scales.x : scales.y, first(row), last(row));
			if (band === undefined || length === undefined) return undefined;
			const thickness = marker.thickness ?? band * (1 - Number(before ?? 0) - Number(after ?? 0));
			return isHorizontal
				? { width: length, height: thickness }
				: { width: thickness, height: length };
		};
		return isHorizontal
			? { box, size: box, x: middleOf, y: category }
			: { box, size: box, x: category, y: middleOf };
	}
}
