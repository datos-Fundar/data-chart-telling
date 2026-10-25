import type { LabelLane } from '$lib/types/markers/basic/text';

/** A maximal stretch of positions pushed against each other, as inclusive indices (a lone position is `[i, i]`). */
type Run = [start: number, end: number];

const clamp = (value: number, lo: number, hi: number) => Math.min(Math.max(value, lo), hi);

/**
 * Lays out point labels that would overlap: spreads their pixel `y` apart,
 * gives each moved label its own lane for its leader line, and lines every
 * label up on one shared column once any of them clusters.
 */
export class Declutter {
	/**
	 * Lays out labels keyed by each item's `key`; fewer than two need none. A
	 * leftward fan with no room before the content box's left edge (the Y
	 * axis's tick labels sit there) flips right instead.
	 */
	static buildLanes<K>(args: {
		items: { key: K; px?: number; py: number }[];
		/** The labels' own horizontal offset (px); its sign is the side they fan toward. */
		dx: number;
		fontSize: number;
		geometry: { elbowGap: number; laneStep: number; labelGap: number };
		/** The content box's left/top/bottom edges (px). */
		bounds: { left: number; top: number; bottom: number };
		/** Aligns the labels on the shared column even when none of them overlaps. */
		forceAligned?: boolean;
		/** Lets a leftward fan with no room flip right. Defaults to `true`. */
		flip?: boolean;
	}): Map<K, LabelLane> {
		const { items, dx, fontSize, geometry, bounds, forceAligned, flip = true } = args;
		const lanes = new Map<K, LabelLane>();
		if (items.length < 2 && !forceAligned) return lanes;

		const sorted = [...items].sort((a, b) => a.py - b.py);
		const originals = sorted.map((item) => item.py);
		const minGap = Math.max(16, fontSize * 1.4);
		const { finals, connected } =
			sorted.length > 1
				? Declutter.#spread(originals, minGap, [bounds.top, bounds.bottom])
				: { finals: originals, connected: [] };
		const ranks = Declutter.#assignLanes(originals, finals, connected);

		const aligned = !!forceAligned || ranks.some((r) => r.runSize > 1);
		const lanesUsed = aligned ? Math.max(...ranks.map((r) => r.runSize)) : 1;
		const reach = geometry.elbowGap + (lanesUsed - 1) * geometry.laneStep + geometry.labelGap;

		let dir = Math.sign(dx) || 1;
		if (aligned && dir === -1 && flip) {
			// Unknown room (no x position yet) counts as none: flipping right is never wrong.
			const rooms = sorted.flatMap((item) => (item.px == null ? [] : [item.px - bounds.left]));
			if ((rooms.length > 0 ? Math.min(...rooms) : -Infinity) < reach) dir = 1;
		}

		sorted.forEach((item, i) => {
			lanes.set(item.key, {
				extraDy: finals[i] - originals[i],
				aligned,
				reach,
				laneReach: geometry.elbowGap + ranks[i].rank * geometry.laneStep,
				dir
			});
		});
		return lanes;
	}

	/** The runs of `connected` pairs over `connected.length + 1` positions. */
	static #runs(connected: boolean[]): Run[] {
		const runs: Run[] = [];
		for (let i = 0; i <= connected.length; ) {
			let j = i;
			while (j < connected.length && connected[j]) j++;
			runs.push([i, j]);
			i = j + 1;
		}
		return runs;
	}

	/**
	 * Spreads sorted `positions` so no two end up closer than `minGap`, keeping
	 * the block centered on the originals: a pass pushing items down and one
	 * pulling them up, each valid alone, averaged per item (chaining them would
	 * be a no-op). `connected[i]` is whether either pass had to push `i` and
	 * `i + 1` apart. Each run is then kept inside `bounds`.
	 */
	static #spread(
		positions: number[],
		minGap: number,
		bounds: readonly [number, number]
	): { finals: number[]; connected: boolean[] } {
		const n = positions.length;
		const connected = new Array<boolean>(n - 1).fill(false);
		const down = [...positions];
		for (let i = 1; i < n; i++) {
			if (down[i - 1] + minGap > down[i]) {
				down[i] = down[i - 1] + minGap;
				connected[i - 1] = true;
			}
		}
		const up = [...positions];
		for (let i = n - 2; i >= 0; i--) {
			if (up[i + 1] - minGap < up[i]) {
				up[i] = up[i + 1] - minGap;
				connected[i] = true;
			}
		}
		const weights = Declutter.#biasWeights(down, up, connected, bounds);
		const averaged = positions.map((_, i) => down[i] * weights[i] + up[i] * (1 - weights[i]));
		return { finals: Declutter.#fit(averaged, connected, bounds), connected };
	}

	/**
	 * Per-item weight of the down pass (the up pass gets the rest). A run near
	 * an edge leans on the pass that grows away from it, so it expands the way
	 * there is room instead of reaching for room it lacks; `0.5` with equal room
	 * on both sides. Every member of a run shares one weight.
	 */
	static #biasWeights(
		down: number[],
		up: number[],
		connected: boolean[],
		[lo, hi]: readonly [number, number]
	): number[] {
		const weights = down.map(() => 0.5);
		for (const [i, j] of Declutter.#runs(connected)) {
			if (j === i) continue;
			const center = ((down[i] + up[i]) / 2 + (down[j] + up[j]) / 2) / 2;
			const roomAbove = Math.max(0, center - lo);
			const roomBelow = Math.max(0, hi - center);
			const total = roomAbove + roomBelow;
			weights.fill(total > 0 ? roomBelow / total : 0.5, i, j + 1);
		}
		return weights;
	}

	/**
	 * Shifts each run inside `[lo, hi]`, shrinking it uniformly around its
	 * center only if it is wider than the room. A lone position is clamped.
	 */
	static #fit(
		positions: number[],
		connected: boolean[],
		[lo, hi]: readonly [number, number]
	): number[] {
		const out = [...positions];
		for (const [i, j] of Declutter.#runs(connected)) {
			if (j === i) {
				out[i] = clamp(out[i], lo, hi);
				continue;
			}
			const [min, max] = [out[i], out[j]];
			if (min >= lo && max <= hi) continue;
			const span = max - min;
			const scale = span > 0 ? Math.min(1, (hi - lo) / span) : 1;
			const center = (min + max) / 2;
			const newCenter = clamp(center, lo + (span * scale) / 2, hi - (span * scale) / 2);
			for (let k = i; k <= j; k++) out[k] = newCenter + (out[k] - center) * scale;
		}
		return out;
	}

	/**
	 * Gives every member of a run its own lane (`rank` 0 bends nearest the
	 * point), so no two leader lines touch or cross. Each leader is an elbow:
	 * a stub out from the point to its lane, a vertical run to the label's
	 * height, then a run in to the shared column. A pair is ordered by which
	 * member can sit in the nearer lane without crossing the other's elbow;
	 * when the geometry doesn't decide, the member that traveled furthest
	 * takes the nearer lane.
	 */
	static #assignLanes(
		originals: number[],
		finals: number[],
		connected: boolean[]
	): { rank: number; runSize: number }[] {
		const out = originals.map(() => ({ rank: 0, runSize: 1 }));
		const within = (v: number, k: number) =>
			v >= Math.min(originals[k], finals[k]) && v <= Math.max(originals[k], finals[k]);
		const distance = (k: number) => Math.abs(finals[k] - originals[k]);
		/** Whether `i` in the nearer lane than `j` provably crosses nothing. */
		const saferNearer = (i: number, j: number) => !within(originals[j], i) && !within(finals[i], j);

		for (const [start, end] of Declutter.#runs(connected)) {
			const runSize = end - start + 1;
			if (runSize < 2) continue;
			const members = Array.from({ length: runSize }, (_, k) => start + k);
			// The pairs the geometry decides: `before` holds the members that must take a nearer lane than each key.
			const before = new Map(members.map((k) => [k, new Set<number>()]));
			for (const i of members) {
				for (const j of members) {
					if (i !== j && saferNearer(i, j) && !saferNearer(j, i)) before.get(j)!.add(i);
				}
			}
			// Nearest lane first, each member only once everything that must precede it has a lane; the one that traveled furthest goes first among the free ones.
			const order: number[] = [];
			const placed = new Set<number>();
			while (order.length < runSize) {
				const left = members.filter((k) => !placed.has(k));
				const free = left.filter((k) => [...before.get(k)!].every((i) => placed.has(i)));
				const next = (free.length ? free : left).reduce((best, k) =>
					distance(k) > distance(best) ? k : best
				);
				order.push(next);
				placed.add(next);
			}
			order.forEach((k, rank) => {
				out[k] = { rank, runSize };
			});
		}
		return out;
	}
}
