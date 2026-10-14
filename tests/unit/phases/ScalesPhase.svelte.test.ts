import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { ScalesPhase } from '$lib/phases/scales/ScalesPhase';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { AxisPlotKind } from '$lib/types/phases';

type Row = Record<string, unknown>;

const ROWS: Row[] = [
	{ c: 'b', v: 3 },
	{ c: 'a', v: -7 },
	{ c: 'c', v: 5 }
];

/** The scales a kind with these options leaves for `props`, from its whole pipeline. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function build(kind: Partial<AxisPlotKind<any, any>>, props: Row = {}) {
	const state = Pipeline.ofAxisKind({ markers: { marks: () => [] }, ...kind } as never).run(
		{
			width: 400,
			height: 300,
			scales: {},
			segments: {},
			markers: [],
			data: ROWS,
			x: 'c',
			y: 'v',
			...props
		},
		{ cfg: DEFAULT_CONFIG }
	) as unknown as { scales: Record<string, Row | undefined>; marker?: unknown };
	return state.scales;
}

const bars = { data: { discreteAxes: 1 } } as const;

describe('ScalesPhase - category axes', () => {
	test('an axis the kind lays out as categories becomes a band, left in its own order', () => {
		const scales = build(bars);
		expect(scales.x).toMatchObject({ type: 'band' });
		expect(scales.x?.domain).toBeUndefined();
		expect(scales.y).toBeUndefined();
	});

	test('a kind that asks for none leaves a string axis to svelteplot', () => {
		expect(build({}).x).toBeUndefined();
	});

	test('the author marks a band as categorical, or as a type of their own', () => {
		expect(build(bars, { scales: { x: { type: 'categorical' } } }).x?.type).toBe('band');
		expect(build(bars, { scales: { x: { type: 'point' } } }).x?.type).toBe('point');
	});

	test('the value axis of a plot with categories is never discrete itself', () => {
		const scales = build(bars, { scales: { y: { type: 'categorical', nice: true } } });
		expect(scales.y).toEqual({ nice: true });
	});

	test("`bandOrder: 'data'` gives the band the order the rows come in, unless the author does", () => {
		const kind = { ...bars, scales: { bandOrder: 'data' as const } };
		expect(build(kind).x?.domain).toEqual(['b', 'a', 'c']);
		expect(build(kind, { scales: { x: { domain: ['c'] } } }).x?.domain).toEqual(['c']);
	});

	test('the kind’s `defaults` sit under the author’s, and an author padding replaces its inner and outer', () => {
		const kind = {
			...bars,
			scales: { defaults: () => ({ category: { paddingInner: 0.2, paddingOuter: 0.1 } }) }
		};
		expect(build(kind).x).toMatchObject({ paddingInner: 0.2, paddingOuter: 0.1 });
		expect(build(kind, { scales: { x: { padding: 0.4 } } }).x).toMatchObject({
			paddingInner: 0.4,
			paddingOuter: 0.4
		});
		expect(build(kind, { scales: { x: { padding: 0.4, paddingInner: 0.05 } } }).x).toMatchObject({
			paddingInner: 0.05,
			paddingOuter: 0.4
		});
	});

	test('defaults are by role, so they follow the orientation', () => {
		const kind = { ...bars, scales: { defaults: () => ({ category: { padding: 0.3 } }) } };
		expect(build(kind, { x: 'v', y: 'c' })).toMatchObject({ y: { padding: 0.3 } });
		expect(build(kind, { x: 'v', y: 'c' }).x).toBeUndefined();
	});
});

describe('ScalesPhase - symmetric axes', () => {
	const kind = { ...bars, scales: { symmetric: ['value' as const] } };

	test('a symmetric axis reaches as far below zero as above, to the largest magnitude', () => {
		expect(build(kind).y?.domain).toEqual([-7, 7]);
	});

	test('with no rows it spans [-1, 1], and a pinned domain is left alone', () => {
		expect(build(kind, { data: [] }).y?.domain).toEqual([-1, 1]);
		expect(build(kind, { scales: { y: { domain: [0, 100] } } }).y?.domain).toEqual([0, 100]);
	});
});

describe('ScalesPhase - what a kind fits and adds', () => {
	test('`fit` sets what it fits on an axis the author left unpinned, and the shared growth leaves it', () => {
		const kind = {
			scales: { zero: ['y' as const], fit: () => ({ y: { domain: [-50, 50] } }) }
		};
		expect(build(kind).y?.domain).toEqual([-50, 50]);
	});

	test('`extend` runs last, over the scales in place', () => {
		let seen: unknown;
		build({
			...bars,
			scales: {
				extend: (state: { scales: Row }) => {
					seen = state.scales.x;
					return state;
				}
			}
		});
		expect(seen).toMatchObject({ type: 'band' });
	});

	test('an unpinned numeric axis grows to reach zero where the kind says it starts there', () => {
		const rows = [
			{ c: 1, v: 5 },
			{ c: 2, v: 9 }
		];
		const transforms = [{ type: 'stackY' }];
		const kind = { scales: { zero: ['y' as const] } };
		expect(build(kind, { data: rows, transforms }).y?.domain).toEqual([0, 9]);
	});
});

describe('ScalesPhase - the axes it names', () => {
	const phase = new ScalesPhase({ zero: ['value'], symmetric: ['category', 'x'] });
	const horizontal = new PlotAxes({ category: 'y', value: 'x', orientation: 'horizontal' });

	test('a role resolves to the axis playing it, a name to itself', () => {
		expect(phase.zeroAxes({ axes: horizontal })).toEqual(['x']);
		expect(phase.symmetricAxes({ axes: horizontal })).toEqual(['y', 'x']);
	});

	test('without axes, value is y and category is x', () => {
		expect(phase.zeroAxes({})).toEqual(['y']);
		expect(phase.symmetricAxes({})).toEqual(['x', 'x']);
	});

	test('it keeps the data order only when asked to', () => {
		expect(phase.keepsDataOrder).toBe(false);
		expect(new ScalesPhase({ bandOrder: 'data' }).keepsDataOrder).toBe(true);
	});
});
