import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import { buildLinePresentation } from '$lib/plots/line/presentation';
import { buildBarPresentation } from '$lib/plots/bar/presentation';
import { buildPyramidPresentation } from '$lib/plots/pyramid/presentation';
import { buildHeatmapPresentation } from '$lib/plots/heatmap/presentation';

type Row = { year: number; age: string; sex: string; pop: number };

const ROWS: Row[] = [
	{ year: 2000, age: '0-4', sex: 'F', pop: 10 },
	{ year: 2000, age: '0-4', sex: 'M', pop: 12 },
	{ year: 2000, age: '5-9', sex: 'F', pop: 8 },
	{ year: 2010, age: '0-4', sex: 'F', pop: 15 }
];

describe('timeline interpolation, resolved by the "mapping" phase', () => {
	test("a line tweens its `y`, matched per series, and only once there's `data` and a `y`", () => {
		const { timeline } = buildLinePresentation<Row>(
			{ data: ROWS, x: 'year', y: 'pop', color: 'sex' },
			DEFAULT_CONFIG
		);
		expect(timeline?.interpolation).toEqual({ value: 'pop', key: 'sex' });
		expect(
			buildLinePresentation<Row>({ x: 'year', y: 'pop' }, DEFAULT_CONFIG).timeline?.interpolation
		).toBeUndefined();
		expect(
			buildLinePresentation<Row>({ data: ROWS, x: 'year' }, DEFAULT_CONFIG).timeline?.interpolation
		).toBeUndefined();
	});

	test('a bar matches by category, and by category and group when grouped', () => {
		const ungrouped = buildBarPresentation<Row>({ data: ROWS, x: 'age', y: 'pop' }, DEFAULT_CONFIG);
		expect(ungrouped.timeline?.interpolation).toEqual({ value: 'pop', key: 'age' });
		const grouped = buildBarPresentation<Row>(
			{ data: ROWS, x: 'age', y: 'pop', color: 'sex' },
			DEFAULT_CONFIG
		);
		const key = resolveAccessor(grouped.timeline!.interpolation!.key!);
		expect(key(ROWS[1])).toBe('0-4::M');
	});

	test("a pyramid tweens its magnitude (`x`), matched by category and side, through its series' swap", () => {
		const { timeline } = buildPyramidPresentation<Row>(
			{ data: ROWS, x: 'pop', y: 'age', color: 'sex' },
			DEFAULT_CONFIG
		);
		expect(timeline?.interpolation?.value).toBe('pop');
		expect(resolveAccessor(timeline!.interpolation!.key!)(ROWS[2])).toBe('5-9::F');
	});
});

describe('slice scales, from the "scales" phase', () => {
	test('a pyramid shares its diverging magnitude axis and every category', () => {
		const { sliceScales } = buildPyramidPresentation<Row>(
			{ x: 'pop', y: 'age', color: 'sex' },
			DEFAULT_CONFIG
		);
		expect(sliceScales!(ROWS)).toEqual({
			x: { domain: [-15, 15] },
			y: { domain: ['0-4', '5-9'] }
		});
	});

	test('a heatmap shares its color domain, from zero, only when it has a `color`', () => {
		const colored = buildHeatmapPresentation<Row>(
			{ x: 'year', y: 'age', color: 'pop' },
			DEFAULT_CONFIG
		);
		expect(colored.sliceScales!(ROWS)).toEqual({ color: { domain: [0, 15] } });
		const plain = buildHeatmapPresentation<Row>({ x: 'year', y: 'age' }, DEFAULT_CONFIG);
		expect(plain.sliceScales!(ROWS)).toEqual({});
	});
});

test('a bar hovers along whichever axis carries its categories', () => {
	const vertical = buildBarPresentation<Row>({ x: 'age', y: 'pop' }, DEFAULT_CONFIG);
	const horizontal = buildBarPresentation<Row>(
		{ x: 'age', y: 'pop', scales: { y: { type: 'categorical' } } },
		DEFAULT_CONFIG
	);
	expect([vertical.hoverStrategy, horizontal.hoverStrategy]).toEqual(['x', 'y']);
});
