import type { Row } from '$lib/types/phases/transforms/adapter';

/** The fix transforms that give a `rect` a value on one axis share. */
export class AnchorBar {
	/**
	 * A `rect` a transform gave a value on one axis, with no far edge on that axis,
	 * draws a bar from zero up to that value, the way svelteplot's `RectY`/`RectX`
	 * do. A bin's or a group's value arrives as `y` (for `binX`/`groupX`) or `x`
	 * (for `binY`/`groupY`), so the bar's far end on that axis is set here, once the
	 * transforms have run. A value with an edge already is left alone, as is a
	 * `rect` with an `interval`, which svelteplot draws itself.
	 */
	static toZero(axis: 'x' | 'y'): (marker: Row) => Row {
		const [near, far] = axis === 'y' ? (['y1', 'y2'] as const) : (['x1', 'x2'] as const);
		return (marker) => {
			if (marker.type !== 'rect' || marker.interval !== undefined) return marker;
			if (marker[axis] === undefined || marker[far] !== undefined) return marker;
			return { ...marker, [near]: marker[near] ?? 0, [far]: marker[axis] };
		};
	}
}
