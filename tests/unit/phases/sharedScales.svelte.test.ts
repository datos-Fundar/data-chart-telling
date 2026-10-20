import { describe, test, expect } from 'vitest';
import { SharedScalesPhase } from '$lib/phases/sharedScales/SharedScalesPhase';
import { buildFacetKeyOf, buildFacetPanels, buildFacetPlaceKey } from '$lib/layout/facet/config';
import { PANEL_KEY } from '$lib/phases/facet/FacetPanels';
import { buildLineDefaults } from '$lib/plots/line/defaults';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { SharedAxisValues } from '$lib/types/phases';

const values = (
	x: unknown[],
	y: unknown[],
	extra: Partial<SharedAxisValues> = {}
): SharedAxisValues => ({
	x,
	y,
	band: [],
	zero: [],
	...extra
});

describe('buildSharedAxisScale', () => {
	test('a band keeps the order the data gives it when its kind asks for that', () => {
		const slice = (dataOrder?: boolean) => ({
			...values(['b', 'a'], [], { band: ['x'] }),
			dataOrder
		});
		expect(SharedScalesPhase.buildSharedAxisScale([slice(true)], 'x')).toEqual({
			domain: ['b', 'a']
		});
		expect(SharedScalesPhase.buildSharedAxisScale([slice()], 'x')).toEqual({ domain: ['a', 'b'] });
	});

	test('spans every facet on a numeric axis, niced', () => {
		expect(
			SharedScalesPhase.buildSharedAxisScale([values([1, 5], []), values([3, 12], [])], 'x')
		).toEqual({
			domain: [1, 12],
			nice: false
		});
	});

	test('nices the extent itself, with a fine step, so short panels do not over-round', () => {
		expect(
			SharedScalesPhase.buildSharedAxisScale([values([], [0, 58], { zero: ['y'] })], 'y')
		).toEqual({
			domain: [0, 60],
			nice: false
		});
	});

	test('a total a hair past a tick stays on it', () => {
		expect(
			SharedScalesPhase.buildSharedAxisScale([values([], [0, 100.2], { zero: ['y'] })], 'y')
		).toEqual({ domain: [0, 100], nice: false });
	});

	test('includes zero when a facet asks for it', () => {
		expect(
			SharedScalesPhase.buildSharedAxisScale(
				[values([], [4, 9], { zero: ['y'] }), values([], [2, 3])],
				'y'
			)
		).toEqual({ domain: [0, 9], nice: false });
	});

	test('a band axis gets every category, sorted like svelteplot sorts them', () => {
		expect(
			SharedScalesPhase.buildSharedAxisScale(
				[values(['b', 'a'], [], { band: ['x'] }), values(['c', 'a'], [], { band: ['x'] })],
				'x'
			)
		).toEqual({ domain: ['a', 'b', 'c'] });
	});

	test('a band axis of numbers stays categorical', () => {
		expect(
			SharedScalesPhase.buildSharedAxisScale([values([2020, 2010], [], { band: ['x'] })], 'x')
		).toEqual({
			domain: [2010, 2020]
		});
	});

	test('dates span earliest to latest', () => {
		const a = new Date('2020-01-01');
		const b = new Date('2021-06-01');
		expect(SharedScalesPhase.buildSharedAxisScale([values([b], []), values([a], [])], 'x')).toEqual(
			{
				domain: [a, b]
			}
		);
	});

	test('no values, no domain', () => {
		expect(SharedScalesPhase.buildSharedAxisScale([values([], [])], 'x')).toBeUndefined();
	});
});

type Row = { g: string; h: string; v: number };
const ROWS: Row[] = [
	{ g: 'A', h: 'p', v: 1 },
	{ g: 'A', h: 'q', v: 2 },
	{ g: 'B', h: 'p', v: 10 },
	{ g: 'B', h: 'q', v: 30 }
];

/** A data run's output for `facet`: each row tagged with its panel, placed at `x = v` and `y = 2v`. */
function frameOf(facet: FacetConfig<Row> | undefined) {
	const keyOf = facet ? buildFacetKeyOf(facet) : () => undefined;
	return {
		panels: facet
			? buildFacetPanels(facet, ROWS).map(({ rows: _rows, ...panel }) => panel)
			: undefined,
		processedData: {
			data: ROWS.map((row) => ({ ...row, [PANEL_KEY]: keyOf(row) })),
			channels: { x: 'v', y: (row: Row) => row.v * 2 },
			options: {},
			transforms: []
		},
		markers: []
	};
}

/** The step's domains for `facet`'s frame, looked up the way a plot's shell looks up a cell's. */
function sharedScalesOf(facet: FacetConfig<Row> | undefined) {
	const step = new SharedScalesPhase(buildLineDefaults<Row>().sharedScales).run;
	const { sharedScales } = step({ ...frameOf(facet), facet } as never, {}) as {
		sharedScales: Record<string, { x?: { domain: unknown[] }; y?: { domain: unknown[] } }>;
	};
	return (place: { facetValue?: string; row?: string; col?: string } = {}) =>
		sharedScales[facet ? buildFacetPlaceKey(facet, { facetValue: '', ...place }) : ''];
}

describe('SharedScalesPhase', () => {
	test("'shared' (default) gives every facet the same x and y domains", () => {
		const scales = sharedScalesOf({ by: 'g' });
		const a = scales({ facetValue: 'A' });
		expect(a?.x?.domain).toEqual([0, 30]);
		expect(a?.y?.domain).toEqual([0, 60]);
		expect(scales({ facetValue: 'B' })).toEqual(a);
	});

	test("'free' leaves every wrapped facet to fit its own", () => {
		expect(sharedScalesOf({ by: 'g', scales: 'free' })({ facetValue: 'A' })).toBeUndefined();
	});

	test("'free-x' still shares y across wrapped facets", () => {
		const a = sharedScalesOf({ by: 'g', scales: 'free-x' })({ facetValue: 'A' });
		expect(a?.x).toBeUndefined();
		expect(a?.y?.domain).toEqual([0, 60]);
	});

	test("in a grid, 'free-x' shares x down each column", () => {
		const scales = sharedScalesOf({ rows: 'h', cols: 'g', scales: 'free-x' });
		expect(scales({ row: 'p', col: 'A' })?.x?.domain).toEqual([1, 2]);
		expect(scales({ row: 'q', col: 'B' })?.x?.domain).toEqual([10, 30]);
		expect(scales({ row: 'q', col: 'A' })?.y).toEqual(scales({ row: 'p', col: 'B' })?.y);
	});

	test('without a facet, every row shares one domain - a timeline step keeps the frame', () => {
		const scales = sharedScalesOf(undefined)();
		expect(scales?.x?.domain).toEqual([0, 30]);
		expect(scales?.y?.domain).toEqual([0, 60]);
	});

	test('a kind without `sharedScales` options still shares its domains, with no bands and no zero', () => {
		const state = { ...frameOf(undefined) };
		const { sharedScales } = new SharedScalesPhase(undefined).run(state as never, {}) as {
			sharedScales: Record<string, { x?: { domain: unknown[] } }>;
		};
		expect(sharedScales[''].x?.domain).toEqual([0, 30]);
	});
});
