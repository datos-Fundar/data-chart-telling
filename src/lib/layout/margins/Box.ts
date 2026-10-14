import { Margins } from '$lib/layout/margins/Margins';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { BoxAnchor, BoxAnchors, BoxFlip } from '$lib/types/layout/box';

/**
 * A rectangle in pixels: where something sits (`x`, `y`, its top-left) and
 * how big it is. Anything a plot lays out - a label, a tooltip, the plot's
 * own area - can be one, measured from the DOM ({@link Box.of}) or off it
 * ({@link Box.ofText}). Immutable: every operation returns a new one.
 */
export class Box {
	static #canvas: CanvasRenderingContext2D | null | undefined;

	constructor(
		readonly x: number,
		readonly y: number,
		readonly width: number,
		readonly height: number
	) {}

	/** A box of `width` x `height` at the origin. */
	static size(width: number, height: number): Box {
		return new Box(0, 0, width, height);
	}

	/** A box from any rect-like reading, e.g. an element's `getBBox()`. */
	static of(rect: { x: number; y: number; width: number; height: number }): Box {
		return new Box(rect.x, rect.y, rect.width, rect.height);
	}

	/**
	 * The box one line of `text` takes at `fontSize` in the configuration's
	 * font (`'inherit'` measures as sans-serif), measured off the DOM, on a
	 * canvas. Empty during SSR.
	 */
	static ofText(text: string, fontSize: number, cfg: Pick<PlotStylesConfig, 'font'>): Box {
		if (Box.#canvas === undefined) {
			Box.#canvas =
				typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
		}
		const family = cfg.font === 'inherit' ? 'sans-serif' : cfg.font;
		const canvas = Box.#canvas;
		if (canvas) canvas.font = `${fontSize}px ${family}`;
		return Box.size(canvas?.measureText(text).width ?? 0, fontSize * 1.2);
	}

	get left(): number {
		return this.x;
	}

	get top(): number {
		return this.y;
	}

	get right(): number {
		return this.x + this.width;
	}

	get bottom(): number {
		return this.y + this.height;
	}

	/** Whether the box has no area. */
	get empty(): boolean {
		return this.width === 0 && this.height === 0;
	}

	/** How far this box reaches out from its origin (the point it sits around), in whole pixels. */
	get reach(): Margins {
		return this.overflow(Box.size(0, 0));
	}

	/** This box grown by `px` on every side. */
	pad(px: number): Box {
		return new Box(this.x - px, this.y - px, this.width + 2 * px, this.height + 2 * px);
	}

	/**
	 * This box placed beside `point` on `anchor`'s side per axis: `gap` px
	 * before or after it, or centred on it.
	 */
	beside(
		point: { x: number; y: number },
		anchor: BoxAnchors,
		gap: { x?: number; y?: number } = {}
	): Box {
		const start = (pos: number, size: number, side: BoxAnchor, space: number) =>
			side === 'before' ? pos - space - size : side === 'after' ? pos + space : pos - size / 2;
		return new Box(
			start(point.x, this.width, anchor.x, gap.x ?? 0),
			start(point.y, this.height, anchor.y, gap.y ?? 0),
			this.width,
			this.height
		);
	}

	/** How far this box reaches past `bounds` on each side, in whole pixels; an empty box reaches nowhere. */
	overflow(bounds: Box): Margins {
		if (this.empty) return Margins.ZERO;
		return new Margins(
			Math.ceil(Math.max(0, bounds.top - this.top)),
			Math.ceil(Math.max(0, this.right - bounds.right)),
			Math.ceil(Math.max(0, this.bottom - bounds.bottom)),
			Math.ceil(Math.max(0, bounds.left - this.left))
		);
	}

	/**
	 * This box placed next to `point`, `gap` px away, on its preferred side
	 * per axis (`anchor`), inside `within` with an `edge` px clearance: a side
	 * it doesn't fit on gives way to the centred position, then to the
	 * opposite side, and as a last resort it is pushed back inside.
	 */
	placeNear(
		point: { x: number; y: number },
		anchor: BoxAnchors,
		within: Box,
		{ gap = 10, edge = 6 } = {}
	): Box {
		const along = (
			pos: number,
			size: number,
			from: number,
			to: number,
			preferred: BoxAnchor
		): number => {
			const startAt = (side: BoxAnchor) =>
				side === 'before' ? pos - gap - size : side === 'after' ? pos + gap : pos - size / 2;
			const order: BoxAnchor[] =
				preferred === 'before'
					? ['before', 'middle', 'after']
					: preferred === 'after'
						? ['after', 'middle', 'before']
						: ['middle'];
			for (const side of order) {
				const start = startAt(side);
				if (start >= from + edge && start + size <= to - edge) return start;
			}
			const last = startAt(order[order.length - 1]);
			return Math.min(Math.max(last, from + edge), Math.max(from + edge, to - size - edge));
		};
		return new Box(
			along(point.x, this.width, within.left, within.right, anchor.x),
			along(point.y, this.height, within.top, within.bottom, anchor.y),
			this.width,
			this.height
		);
	}

	/**
	 * Which side of `point` this box goes on, per axis, to stay inside
	 * `within`: its preferred side `gap` px away, else the opposite one; a
	 * centred box shifts back inside instead. Returns the side and the offset
	 * from the point - for a label anchored at the point, like a text's
	 * `textAnchor`/`lineAnchor` and `dx`/`dy`. Measure the box off the DOM
	 * ({@link Box.ofText}): a reading of the rendered label would feed back
	 * into the layout it is placed in.
	 */
	flipNear(
		point: { x: number; y: number },
		anchor: BoxAnchors,
		within: Box,
		gap: { x: number; y: number }
	): BoxFlip {
		const along = (
			pos: number,
			size: number,
			from: number,
			to: number,
			side: BoxAnchor,
			space: number
		): { side: BoxAnchor; offset: number } => {
			if (side === 'after') {
				return pos + space + size > to
					? { side: 'before', offset: -space }
					: { side, offset: space };
			}
			if (side === 'before') {
				return pos - space - size < from
					? { side: 'after', offset: space }
					: { side, offset: -space };
			}
			const half = size / 2;
			if (pos - half < from) return { side, offset: from + half - pos };
			if (pos + half > to) return { side, offset: to - (pos + half) };
			return { side, offset: 0 };
		};
		const x = along(point.x, this.width, within.left, within.right, anchor.x, gap.x);
		const y = along(point.y, this.height, within.top, within.bottom, anchor.y, gap.y);
		return { anchor: { x: x.side, y: y.side }, dx: x.offset, dy: y.offset };
	}
}
