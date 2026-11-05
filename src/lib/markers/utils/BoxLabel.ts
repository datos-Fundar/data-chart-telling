import type { TextMarkerConfig } from '$lib/types/markers/common';
import type { TextLabelConfig } from '$lib/types/markers/basic/text';
import type { LabelAnchor } from '$lib/types/plots/constants';

/** Where a row's edge along an axis is: a field of the rows, the symbol a transform keyed it by, a function of the row, or a literal. */
type Edge = unknown;

/** The edges of the box each row spans, in the data's own terms. */
export type BoxChannels = { x1: Edge; x2: Edge; y1: Edge; y2: Edge };

/** The scales a box is measured on. */
export type BoxScales = Record<
	string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	{ type?: string; fn: any } | undefined
>;

/** The pixel size of the box of a row, for the markers whose boxes are bands of a category axis rather than edges. */
export type BoxSizer = (
	row: unknown,
	scales: BoxScales
) => { width: number; height: number } | undefined;

/** The `text` marker that labels the boxes a marker draws, and where each label's box is. */
export type BoxLabelMarker = { marker: TextMarkerConfig; box: BoxChannels | BoxSizer };

/** What a marker has to say for its boxes to be labelled. */
export type Labelled = {
	type?: string;
	data?: unknown[];
	label?: TextLabelConfig;
	x?: Edge;
	y?: Edge;
	x1?: Edge;
	x2?: Edge;
	y1?: Edge;
	y2?: Edge;
	isHorizontal?: boolean;
	role?: string;
	thickness?: number;
	/** The marker's styles: the insets of a cell or a bar are read off them. */
	styles?: object;
};

const read =
	(edge: Edge) =>
	(row: unknown): unknown =>
		typeof edge === 'function'
			? (edge as (row: unknown) => unknown)(row)
			: typeof edge === 'string' || typeof edge === 'symbol'
				? (row as Record<string | symbol, unknown>)?.[edge]
				: edge;

/** The middle of two positions along an axis, whether numbers or dates. */
const middle = (from: unknown, to: unknown) =>
	from instanceof Date || to instanceof Date
		? new Date((Number(from) + Number(to)) / 2)
		: (Number(from) + Number(to)) / 2;

const bandwidth = (scale: BoxScales[string]) =>
	scale?.type === 'band' ? Number(scale.fn.bandwidth()) : undefined;

const distance = (scale: BoxScales[string], from: unknown, to: unknown) =>
	scale ? Math.abs(Number(scale.fn(to)) - Number(scale.fn(from))) : undefined;

/**
 * How a marker that draws a box per row writes a label in each: the `text` marker for them, centred on the box,
 * and where the box is for it to fit to. A `rect` says it with its edges, a `cell` is a band of each axis, and a bar
 * or a waffle is a band of its category axis and the stretch of its value.
 */
export class BoxLabel {
	/** `undefined` when the marker has no label, or does not say where its boxes are. */
	static of(
		marker: Labelled,
		plot: {
			isHorizontal?: boolean;
			scales?: () => BoxScales | undefined;
			gap?: number;
		} = {}
	): BoxLabelMarker | undefined {
		if (!marker.label) return undefined;
		const own = BoxLabel.#shape(marker, plot.isHorizontal ?? marker.isHorizontal ?? false);
		if (!own) return undefined;
		const { anchor, outside, gap, ...label } = marker.label;
		const size = typeof own.box === 'function' ? own.box : (own as { size?: BoxSizer }).size;
		const placed = BoxLabel.#anchored(
			{
				anchor,
				outside,
				gap: gap ?? plot.gap
			},
			label,
			size,
			plot.scales
		);
		return {
			box: own.box,
			marker: {
				// A label outside its shape has nothing to fit to.
				fit: !outside,
				...label,
				...placed,
				type: 'text',
				data: marker.data as never,
				x: own.x,
				y: own.y
			} as unknown as TextMarkerConfig
		};
	}

	/**
	 * What puts a label at `anchor` of its shape: the pixels it is moved from the middle - a function of the row, for
	 * the size of its shape is the row's own - and the sides of its point it is written on. `{}` for the middle.
	 */
	static #anchored(
		where: { anchor?: LabelAnchor; outside?: boolean; gap?: number },
		label: Omit<TextLabelConfig, 'anchor' | 'outside' | 'gap'>,
		size: BoxSizer | undefined,
		scales: (() => BoxScales | undefined) | undefined
	): Partial<TextMarkerConfig> {
		const { anchor = 'middle', outside = false } = where;
		if (anchor === 'middle' || !size) return {};
		const gap = where.gap ?? 4;
		const horizontal = anchor.endsWith('left') ? -1 : anchor.endsWith('right') ? 1 : 0;
		const vertical = anchor.startsWith('top') ? -1 : anchor.startsWith('bottom') ? 1 : 0;
		// Beyond an edge only means something for an edge: a corner is inside its shape.
		const beyond = outside && horizontal * vertical === 0;
		const away = beyond ? 1 : -1;
		const move = (axis: 'width' | 'height', side: number, row: unknown) => {
			// Read when a label is drawn, not when its marker is made: the scales move as the labels register.
			const current = scales?.();
			const box = current ? size(row, current) : undefined;
			return box ? side * (box[axis] / 2 + away * gap) : 0;
		};
		// A number of the label's own (or its styles') is added to the move: it is the push from the anchor.
		const own = (value: unknown, fallback: unknown) =>
			Number(typeof value === 'number' ? value : (fallback ?? 0));
		const baseX = own(label.dx, label.styles?.dx);
		const baseY = own(label.dy, label.styles?.dy);
		return {
			dx: horizontal === 0 ? label.dx : (row: unknown) => baseX + move('width', horizontal, row),
			dy: vertical === 0 ? label.dy : (row: unknown) => baseY + move('height', vertical, row),
			styles: {
				...label.styles,
				textAnchor:
					label.styles?.textAnchor ??
					(horizontal === 0 ? 'middle' : (horizontal === 1) === beyond ? 'start' : 'end'),
				lineAnchor:
					label.styles?.lineAnchor ??
					(vertical === 0 ? 'middle' : (vertical === 1) === beyond ? 'top' : 'bottom')
			}
		} as Partial<TextMarkerConfig>;
	}

	/** A style of the marker, when it is a number: a function of the row says nothing of a box in general. */
	static #style(marker: Labelled, name: string): unknown {
		const value = (marker.styles as Record<string, unknown> | undefined)?.[name];
		return typeof value === 'number' ? value : undefined;
	}

	static #shape(marker: Labelled, isHorizontal: boolean) {
		if (marker.type === 'cell') return BoxLabel.#cell(marker);
		if (marker.type === 'bar') {
			return marker.role === 'segment'
				? BoxLabel.#bar(marker, marker.isHorizontal ?? false)
				: undefined;
		}
		if (marker.type === 'waffle') return BoxLabel.#bar(marker, isHorizontal);
		return BoxLabel.#edges(marker);
	}

	/** A rectangle: the box is between its edges. */
	static #edges({ x, y, x1, x2, y1, y2 }: Labelled) {
		// A side with a value and no start, next to one with both its edges, runs from zero to it, as a bar does.
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
			box: { x1, x2, y1, y2 } as BoxChannels | BoxSizer,
			size,
			x: (row: unknown) => middle(left(row), right(row)),
			y: (row: unknown) => middle(top(row), bottom(row))
		};
	}

	/** A cell: a band of each axis, less its inset. */
	static #cell(marker: Labelled) {
		if (marker.x === undefined || marker.y === undefined) return undefined;
		const inset = Number(BoxLabel.#style(marker, 'inset') ?? 0.5);
		const box: BoxSizer = (_, scales) => {
			const [width, height] = [bandwidth(scales.x), bandwidth(scales.y)];
			return width === undefined || height === undefined
				? undefined
				: { width: width - 2 * inset, height: height - 2 * inset };
		};
		return { box: box as BoxChannels | BoxSizer, x: marker.x, y: marker.y };
	}

	/** A bar or a waffle: a band of the category axis, as wide as its insets leave it, and as long as its value. */
	static #bar(marker: Labelled, isHorizontal: boolean) {
		const [category, from, to] = isHorizontal
			? [marker.y, marker.x1, marker.x2]
			: [marker.x, marker.y1, marker.y2];
		const value = isHorizontal ? marker.x : marker.y;
		// Without both ends, the bar runs from zero to its value.
		const [start, end] = from !== undefined && to !== undefined ? [from, to] : [0, value];
		if (category === undefined || end === undefined) return undefined;
		const [first, last] = [start, end].map(read);
		const [before, after] = isHorizontal
			? [BoxLabel.#style(marker, 'insetTop'), BoxLabel.#style(marker, 'insetBottom')]
			: [BoxLabel.#style(marker, 'insetLeft'), BoxLabel.#style(marker, 'insetRight')];
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
			? { box: box as BoxChannels | BoxSizer, x: middleOf, y: category }
			: { box: box as BoxChannels | BoxSizer, x: category, y: middleOf };
	}
}
