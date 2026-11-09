import type { TextMarkerConfig } from '$lib/types/markers/basic/text';
import type { LabelAnchor } from '$lib/types/plots/constants';
import type {
	BoxGeometryOf,
	BoxLabelConfig,
	BoxLabelMarker,
	BoxScales,
	BoxSizer
} from '$lib/types/markers/labels/box';

/** The `text` marker that writes a `'box'` label, anchored in the box of each shape. */
export class BoxLayout {
	static build(
		label: BoxLabelConfig,
		geometry: BoxGeometryOf,
		plot: { data?: unknown[]; scales?: () => BoxScales | undefined; gap?: number } = {}
	): BoxLabelMarker {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { anchor, outside, gap, layout, ...text } = label;
		const placed = BoxLayout.#anchored(
			{ anchor, outside, gap: gap ?? plot.gap },
			text,
			geometry.size,
			plot.scales
		);
		return {
			box: geometry.box,
			marker: {
				fit: !outside,
				...text,
				...placed,
				type: 'text',
				data: plot.data as never,
				x: geometry.x,
				y: geometry.y
			} as unknown as TextMarkerConfig
		};
	}

	/** The offset (per row, as each box has its own size) and text anchors that put a label at `anchor`. */
	static #anchored(
		where: { anchor?: LabelAnchor; outside?: boolean; gap?: number },
		label: Omit<BoxLabelConfig, 'anchor' | 'outside' | 'gap' | 'layout'>,
		size: BoxSizer | undefined,
		scales: (() => BoxScales | undefined) | undefined
	): Partial<TextMarkerConfig> {
		const { anchor = 'middle', outside = false } = where;
		if (anchor === 'middle' || !size) return {};
		const gap = where.gap ?? 4;
		const horizontal = anchor.endsWith('left') ? -1 : anchor.endsWith('right') ? 1 : 0;
		const vertical = anchor.startsWith('top') ? -1 : anchor.startsWith('bottom') ? 1 : 0;
		// A corner is always inside its shape.
		const beyond = outside && horizontal * vertical === 0;
		const away = beyond ? 1 : -1;
		const move = (axis: 'width' | 'height', side: number, row: unknown) => {
			// Read at draw time: the scales move as the labels register.
			const current = scales?.();
			const box = current ? size(row, current) : undefined;
			return box ? side * (box[axis] / 2 + away * gap) : 0;
		};
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
}
