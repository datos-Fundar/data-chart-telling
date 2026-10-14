import { Box } from '$lib/layout/margins/Box';
import type { MarginConfig, MarginSide } from '$lib/types/plots/props';

/** A box's four sides, in pixels. Immutable: every operation returns a new one. */
export class Margins {
	static readonly SIDES: readonly MarginSide[] = ['top', 'right', 'bottom', 'left'];
	static readonly ZERO = new Margins(0, 0, 0, 0);
	/** What an axis plot's `'auto'` side reads as before svelteplot sizes its axes. */
	static readonly AXIS_ESTIMATE = new Margins(20, 20, 30, 40);
	/** What a map's `'auto'` side reads as: a small uniform gap, like an `inset` marker's own. */
	static readonly GEO_ESTIMATE = new Margins(8, 8, 8, 8);

	constructor(
		readonly top: number,
		readonly right: number,
		readonly bottom: number,
		readonly left: number
	) {}

	/** Some sides, the rest `0`. */
	static of(sides: Partial<Record<MarginSide, number>>): Margins {
		return new Margins(sides.top ?? 0, sides.right ?? 0, sides.bottom ?? 0, sides.left ?? 0);
	}

	/** Every side `value`. */
	static uniform(value: number): Margins {
		return new Margins(value, value, value, value);
	}

	/** Half of each dimension: how far something inside a `width` x `height` box may reach out. */
	static half(width: number, height: number): Margins {
		const w = Math.max(0, width / 2);
		const h = Math.max(0, height / 2);
		return new Margins(h, w, h, w);
	}

	/** A margin config as numbers: a side that is `'auto'` or unset reads as `estimate`'s. */
	static resolve(config: MarginConfig | undefined, estimate: Margins = Margins.AXIS_ESTIMATE) {
		return estimate.map((fallback, side) => {
			const value = config?.[side];
			return typeof value === 'number' ? value : fallback;
		});
	}

	/** Each side through `fn`. */
	map(fn: (value: number, side: MarginSide) => number): Margins {
		return new Margins(
			fn(this.top, 'top'),
			fn(this.right, 'right'),
			fn(this.bottom, 'bottom'),
			fn(this.left, 'left')
		);
	}

	max(other: Margins): Margins {
		return this.map((value, side) => Math.max(value, other[side]));
	}

	min(other: Margins): Margins {
		return this.map((value, side) => Math.min(value, other[side]));
	}

	plus(other: Margins): Margins {
		return this.map((value, side) => value + other[side]);
	}

	/** Whether every side is within `tolerance` px of `other`'s. */
	equals(other: Margins | undefined, tolerance = 0): boolean {
		return (
			other != null &&
			Margins.SIDES.every((side) => Math.abs(this[side] - other[side]) <= tolerance)
		);
	}

	/** Whether every side is `0` or less. */
	get empty(): boolean {
		return Margins.SIDES.every((side) => this[side] <= 0);
	}

	/** The box these margins leave inside a `width` x `height` one. */
	contentBox(width: number, height: number): Box {
		return new Box(
			this.left,
			this.top,
			Math.max(0, width - this.left - this.right),
			Math.max(0, height - this.top - this.bottom)
		);
	}

	/** The sides as a plain object - what svelteplot and `JSON` read. */
	toJSON(): Record<MarginSide, number> {
		return { top: this.top, right: this.right, bottom: this.bottom, left: this.left };
	}
}
