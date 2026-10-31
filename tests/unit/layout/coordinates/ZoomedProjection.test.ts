import { describe, expect, it } from 'vitest';
import { ZoomedProjection } from '$lib/layout/coordinates/ZoomedProjection';

const apply = (t: { k: number; x: number; y: number }, [x, y]: [number, number]) => [
	x * t.k + t.x,
	y * t.k + t.y
];

describe('ZoomedProjection transforms', () => {
	const inner = { k: 2, x: 10, y: -5 };
	const outer = { k: 1.5, x: -4, y: 7 };

	it('composes outer over inner', () => {
		const both = ZoomedProjection.compose(inner, outer);
		expect(apply(both, [3, 4])).toEqual(apply(outer, apply(inner, [3, 4]) as [number, number]));
	});

	it('carries what was drawn for one view to another', () => {
		const settled = ZoomedProjection.compose(inner, outer);
		const live = ZoomedProjection.compose({ k: 6, x: -30, y: 12 }, outer);
		const carry = ZoomedProjection.between(settled, live);
		const drawn = apply(settled, [3, 4]) as [number, number];
		const [lx, ly] = apply(live, [3, 4]);
		const [cx, cy] = apply(carry, drawn);
		expect(cx).toBeCloseTo(lx);
		expect(cy).toBeCloseTo(ly);
	});

	it('is the identity between a view and itself', () => {
		const view = ZoomedProjection.compose(inner, outer);
		expect(ZoomedProjection.between(view, view)).toEqual({ k: 1, x: 0, y: 0 });
	});
});
