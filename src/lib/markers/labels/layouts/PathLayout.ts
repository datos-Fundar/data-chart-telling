import type { TextMarkerConfig } from '$lib/types/markers/basic/text';
import type { LineAnchor, TextAnchor } from '$lib/types/plots/constants';
import type { BoxGeometryOf, BoxLabelMarker, BoxScales } from '$lib/types/markers/labels/box';
import type { PageEdge, PathLabelConfig } from '$lib/types/markers/labels/path';

type Placement = { dx: number; dy: number; textAnchor: TextAnchor; lineAnchor: LineAnchor };

/** Each page edge's outward direction. */
const NORMALS: Record<PageEdge, [number, number]> = {
	top: [0, -1],
	bottom: [0, 1],
	left: [-1, 0],
	right: [1, 0]
};

const OPPOSITE: Record<PageEdge, PageEdge> = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left'
};

/** The `text` marker that writes a `'path'` label along an edge of each shape's box. */
export class PathLayout {
	static build(
		label: PathLabelConfig,
		geometry: BoxGeometryOf,
		plot: { data?: unknown[]; scales?: () => BoxScales | undefined; gap?: number } = {}
	): BoxLabelMarker | undefined {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { layout, edge, side = 'outside', offset = 'middle', gap, ...text } = label;
		const { size, ends } = geometry;
		if (!size) return undefined;
		const sign = side === 'outside' ? 1 : side === 'inside' ? -1 : 0;
		const space = sign * (gap ?? plot.gap ?? 4);
		const along = PathLayout.#fraction(offset);
		const own = (value: unknown, fallback: unknown) =>
			Number(typeof value === 'number' ? value : (fallback ?? 0));
		const [baseX, baseY] = [own(text.dx, text.styles?.dx), own(text.dy, text.styles?.dy)];

		// Read at draw time: the scales move as the labels register.
		const placed = (row: unknown): Placement => {
			const scales = plot.scales?.();
			const box = scales ? size(row, scales) : undefined;
			const page = PathLayout.#pageEdge(edge ?? (ends ? 'tip' : 'top'), ends, row, scales);
			const [h, v] = NORMALS[page];
			const [width, height] = [box?.width ?? 0, box?.height ?? 0];
			const across = (extent: number) => extent / 2 + space;
			const end = (from: TextAnchor | LineAnchor, to: TextAnchor | LineAnchor) =>
				along === 0 ? from : along === 1 ? to : 'middle';
			const out = (towards: number, before: string, after: string) =>
				sign === 0 ? 'middle' : towards * sign > 0 ? after : before;
			return v !== 0
				? {
						dx: (along - 0.5) * width,
						dy: v * across(height),
						textAnchor: end('start', 'end') as TextAnchor,
						lineAnchor: out(v, 'bottom', 'top') as LineAnchor
					}
				: {
						dx: h * across(width),
						dy: (along - 0.5) * height,
						textAnchor: out(h, 'end', 'start') as TextAnchor,
						lineAnchor: end('top', 'bottom') as LineAnchor
					};
		};
		const styles = text.styles ?? {};
		return {
			box: geometry.box,
			marker: {
				fit: false,
				...text,
				dx: (row: unknown) => baseX + placed(row).dx,
				dy: (row: unknown) => baseY + placed(row).dy,
				...(styles.textAnchor ? {} : { textAnchor: (row: unknown) => placed(row).textAnchor }),
				...(styles.lineAnchor ? {} : { lineAnchor: (row: unknown) => placed(row).lineAnchor }),
				type: 'text',
				data: plot.data as never,
				x: geometry.x,
				y: geometry.y
			} as unknown as TextMarkerConfig
		};
	}

	/** How far along the edge, from its left or top end. */
	static #fraction(offset: NonNullable<PathLabelConfig['offset']>): number {
		if (offset === 'start') return 0;
		if (offset === 'end') return 1;
		if (offset === 'middle') return 0.5;
		const percent = Number.parseFloat(offset);
		return Number.isFinite(percent) ? Math.min(Math.max(percent / 100, 0), 1) : 0.5;
	}

	/** The page edge a row's `edge` is: its tip is the end of the shape its value runs to. */
	static #pageEdge(
		edge: string,
		ends: BoxGeometryOf['ends'],
		row: unknown,
		scales: BoxScales | undefined
	): PageEdge {
		if (edge !== 'tip' && edge !== 'base') return edge as PageEdge;
		const scale = ends && scales?.[ends.axis];
		const [from, to] = scale
			? [Number(scale.fn(ends.from(row))), Number(scale.fn(ends.to(row)))]
			: [0, 0];
		// Pixels grow rightward and downward: a value up the page runs to a smaller `y`.
		const tip: PageEdge =
			ends?.axis === 'x' ? (to >= from ? 'right' : 'left') : to <= from ? 'top' : 'bottom';
		return edge === 'tip' ? tip : OPPOSITE[tip];
	}
}
