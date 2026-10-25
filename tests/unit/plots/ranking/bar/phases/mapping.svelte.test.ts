import { describe, test, expect, vi, afterEach } from 'vitest';
import { stageOf } from '../../../_helpers/stages';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import type { BarPlotState } from '$lib/types/plots/ranking/bar/state';
import type { Series } from '$lib/types/plots/data/common';

const buildMapping = stageOf(buildBarDefaults<Row>(), 'mapping');

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { category: string; value: number };

const SERIES: Series<Row>[] = [
	{
		name: 'a',
		x: 'category',
		y: 'value',
		data: [
			{ category: 'A', value: 10 },
			{ category: 'B', value: -5 }
		]
	}
];

const STATE: BarPlotState<Row> = {
	series: SERIES,
	segments: {},
	gaps: {},
	scales: {},
	width: 400,
	height: 300
};

function build(overrides: Partial<BarPlotState<Row>> = {}) {
	return buildMapping({ ...STATE, resolvedSeries: SERIES, ...overrides });
}

afterEach(() => vi.restoreAllMocks());

describe('category axis (read by the "data" phase)', () => {
	const buildData = stageOf(buildBarDefaults<Row>(), 'data');
	const axesOf = (overrides: Partial<BarPlotState<Row>>) =>
		buildData({ ...STATE, ...overrides } as BarPlotState<Row>).axes!;

	test('is x when x holds the categories', () => {
		expect(axesOf({})).toMatchObject({ category: 'x', value: 'y', orientation: 'vertical' });
	});

	test('is y, and the bars horizontal, when y holds the categories', () => {
		const axes = axesOf({
			series: [{ name: 'a', x: 'value', y: 'category', data: SERIES[0].data }]
		});
		expect(axes).toMatchObject({ category: 'y', value: 'x', orientation: 'horizontal' });
	});

	test('numeric categories default to x; scales.y.type puts them on y', () => {
		const years = [{ category: 2020, value: 10 }] as unknown as Row[];
		const vertical = axesOf({ series: [{ name: 'a', x: 'category', y: 'value', data: years }] });
		expect(vertical).toMatchObject({ category: 'x', x: { origin: 'promoted' } });
		const horizontal = axesOf({
			series: [{ name: 'a', x: 'value', y: 'category', data: years }],
			scales: { y: { type: 'band' } }
		});
		expect(horizontal).toMatchObject({ category: 'y', y: { origin: 'explicit' } });
	});

	test('warns and defaults to x when both axes are categorical', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const axes = axesOf({ scales: { x: { type: 'categorical' }, y: { type: 'categorical' } } });
		expect(axes.category).toBe('x');
		expect(warn).toHaveBeenCalledOnce();
	});
});

describe('buildMapping - channels', () => {
	test('resolves each channel to the first series own x/y accessor', () => {
		const result = build();
		expect(result.channels!.x.accessor(SERIES[0].data[0])).toBe('A');
		expect(result.channels!.y.accessor(SERIES[0].data[0])).toBe(10);
	});
});
