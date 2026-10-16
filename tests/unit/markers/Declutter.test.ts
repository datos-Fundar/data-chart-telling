import { describe, it, expect } from 'vitest';
import { Declutter } from '$lib/markers/text/Declutter';

const geometry = { elbowGap: 6, laneStep: 5, labelGap: 4 };
const bounds = { left: 0, top: 0, bottom: 300 };
// fontSize 12 -> a minimum gap of 16.8px between labels.
const MIN_GAP = 16.8;

const lanes = (
	items: { px?: number; py: number }[],
	over: { dx?: number; bounds?: typeof bounds } = {}
) =>
	Declutter.buildLanes({
		items: items.map((item, key) => ({ key, ...item })),
		dx: over.dx ?? 8,
		fontSize: 12,
		geometry,
		bounds: over.bounds ?? bounds
	});

/** Each label's final y, in the order given. */
const finals = (items: { px?: number; py: number }[], over = {}) => {
	const result = lanes(items, over);
	return items.map((item, i) => item.py + result.get(i)!.extraDy);
};

describe('Declutter.buildLanes', () => {
	it('lays out nothing for fewer than two labels', () => {
		expect(lanes([]).size).toBe(0);
		expect(lanes([{ px: 10, py: 50 }]).size).toBe(0);
	});

	it('leaves labels that already clear each other where they are', () => {
		const result = lanes([{ py: 50 }, { py: 100 }, { py: 200 }]);
		for (const lane of result.values()) {
			expect(lane.extraDy).toBe(0);
			expect(lane.aligned).toBe(false);
			expect(lane.dir).toBe(1);
		}
		expect(result.get(0)!.laneReach).toBe(geometry.elbowGap);
		expect(result.get(0)!.reach).toBe(geometry.elbowGap + geometry.labelGap);
	});

	it('spreads overlapping labels at least the minimum gap apart, centered when there is room', () => {
		const ys = finals([{ py: 148 }, { py: 150 }, { py: 152 }]);
		expect(ys[1] - ys[0]).toBeGreaterThanOrEqual(MIN_GAP - 1e-9);
		expect(ys[2] - ys[1]).toBeGreaterThanOrEqual(MIN_GAP - 1e-9);
		expect((ys[0] + ys[2]) / 2).toBeCloseTo(150);
	});

	it('spreads a cluster toward the side with more room', () => {
		const nearTop = finals([{ py: 20 }, { py: 22 }, { py: 24 }]);
		const nearBottom = finals([{ py: 276 }, { py: 278 }, { py: 280 }]);
		// Mostly grows away from the near edge, instead of reaching toward it.
		expect(nearTop[0] - 20).toBeGreaterThan(-5);
		expect(nearTop[2] - 24).toBeGreaterThan(nearTop[0] - 20);
		expect(280 - nearBottom[2]).toBeGreaterThan(-5);
		expect(276 - nearBottom[0]).toBeGreaterThan(280 - nearBottom[2]);
	});

	it('keeps the order of the labels, however the input is ordered', () => {
		const ys = finals([{ py: 130 }, { py: 100 }, { py: 101 }]);
		expect(ys[1]).toBeLessThan(ys[2]);
		expect(ys[2]).toBeLessThan(ys[0]);
	});

	it('gives every label in a cluster its own lane, and aligns them all on one column', () => {
		const result = lanes([{ py: 100 }, { py: 102 }, { py: 104 }, { py: 250 }]);
		const clustered = [0, 1, 2].map((i) => result.get(i)!);
		expect(new Set(clustered.map((l) => l.laneReach)).size).toBe(3);
		expect(clustered.every((l) => l.aligned)).toBe(true);
		// Three lanes: the shared column clears the outermost.
		expect(result.get(0)!.reach).toBe(
			geometry.elbowGap + 2 * geometry.laneStep + geometry.labelGap
		);
		// The label that did not cluster is aligned too, but did not move.
		expect(result.get(3)!.extraDy).toBe(0);
		expect(result.get(3)!.aligned).toBe(true);
	});

	it('gives two pushed labels different lanes, so their leader lines do not touch', () => {
		const result = lanes([{ py: 150 }, { py: 151 }]);
		const [a, b] = [result.get(0)!, result.get(1)!];
		expect(a.laneReach).not.toBe(b.laneReach);
		expect([a.laneReach, b.laneReach].sort((x, y) => x - y)).toEqual([
			geometry.elbowGap,
			geometry.elbowGap + geometry.laneStep
		]);
	});

	describe('inside the content box', () => {
		it('keeps a cluster below the top edge', () => {
			const ys = finals([{ py: 2 }, { py: 4 }, { py: 6 }]);
			expect(Math.min(...ys)).toBeGreaterThanOrEqual(bounds.top - 1e-9);
			expect(ys[1] - ys[0]).toBeGreaterThanOrEqual(MIN_GAP - 1e-9);
		});

		it('keeps a cluster above the bottom edge', () => {
			const ys = finals([{ py: 294 }, { py: 296 }, { py: 298 }]);
			expect(Math.max(...ys)).toBeLessThanOrEqual(bounds.bottom + 1e-9);
		});

		it('shrinks a cluster too big to fit, evenly', () => {
			const tight = { left: 0, top: 0, bottom: 40 };
			const ys = finals([{ py: 18 }, { py: 20 }, { py: 22 }, { py: 24 }], { bounds: tight });
			expect(Math.min(...ys)).toBeGreaterThanOrEqual(-1e-9);
			expect(Math.max(...ys)).toBeLessThanOrEqual(40 + 1e-9);
			const gaps = ys.slice(1).map((y, i) => y - ys[i]);
			for (const gap of gaps) expect(gap).toBeCloseTo(gaps[0]);
		});

		it('clamps a lone label past an edge', () => {
			const ys = finals([{ py: -10 }, { py: 150 }]);
			expect(ys[0]).toBe(0);
			expect(ys[1]).toBe(150);
		});
	});

	describe('which side the labels fan toward', () => {
		const cluster = (px: number | undefined, dx: number) =>
			lanes(
				[
					{ px, py: 100 },
					{ px, py: 102 }
				],
				{ dx }
			);

		it('goes right for a positive or zero offset', () => {
			expect(cluster(100, 8).get(0)!.dir).toBe(1);
			expect(cluster(100, 0).get(0)!.dir).toBe(1);
		});

		it('goes left when there is room before the left edge', () => {
			expect(cluster(100, -8).get(0)!.dir).toBe(-1);
		});

		it('flips right when the cluster is too close to the left edge', () => {
			expect(cluster(5, -8).get(0)!.dir).toBe(1);
		});

		it('flips right when the horizontal position is not known yet', () => {
			expect(cluster(undefined, -8).get(0)!.dir).toBe(1);
		});

		it('keeps the leftward side without a cluster, whatever the room', () => {
			const result = lanes(
				[
					{ px: 5, py: 50 },
					{ px: 5, py: 200 }
				],
				{ dx: -8 }
			);
			expect(result.get(0)!.dir).toBe(-1);
		});
	});
});
