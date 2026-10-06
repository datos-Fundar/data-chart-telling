import { describe, test, expect } from 'vitest';
import { SvelteMap } from 'svelte/reactivity';
import { buildHover, buildProcessedHoverPoints } from '$lib/layout/tooltip/buildHover';
import { SERIES_KEY } from '$lib/layout/phases/transforms';
import type { ProcessedData } from '$lib/types/layout/phases';
import type { LegendInteractionStore } from '$lib/types/layout/legend';

type Row = Record<string, unknown>;

describe('buildHover', () => {
	const base = { points: [], label: () => '', defaultStrategy: 'x' as const };

	test('is active with a tooltip or a hover marker, and only then', () => {
		expect(buildHover<Row>({ ...base, tooltip: undefined, markers: [] }).active).toBe(false);
		expect(
			buildHover<Row>({ ...base, tooltip: undefined, markers: [{ type: 'hover' }] }).active
		).toBe(true);
		const tooltip = { format: () => '', facetId: '', sync: false };
		expect(buildHover<Row>({ ...base, tooltip, markers: [] }).active).toBe(true);
	});

	test("falls back to the plot kind's own strategy, and the tooltip's wins over it", () => {
		expect(buildHover<Row>({ ...base, tooltip: undefined, markers: [] }).strategy).toBe('x');
		const tooltip = { format: () => '', facetId: '', sync: false, strategy: 'series' as const };
		expect(buildHover<Row>({ ...base, tooltip, markers: [] }).strategy).toBe('series');
	});

	test('carries pointMatching only when given', () => {
		expect(buildHover<Row>({ ...base, tooltip: undefined, markers: [] })).not.toHaveProperty(
			'pointMatching'
		);
		const contains = buildHover<Row>({
			...base,
			tooltip: undefined,
			markers: [],
			pointMatching: 'contains'
		});
		expect(contains.pointMatching).toBe('contains');
	});
});

describe('buildProcessedHoverPoints', () => {
	const y2 = Symbol('y2');
	const processed: ProcessedData = {
		data: [
			{ x: 1, [y2]: 5, raw: 2, [SERIES_KEY]: 'A' },
			{ x: 1, [y2]: 9, raw: 4, [SERIES_KEY]: 'B' }
		],
		channels: { x: 'x', y2 },
		options: {},
		transforms: []
	};
	const colorFor = (name: string) => (name === 'A' ? 'red' : 'blue');

	test('one point per row, at its position, in its series color', () => {
		const points = buildProcessedHoverPoints<Row>({
			processed,
			colorFor,
			legendInteraction: null,
			label: (row) => String(row.raw)
		});
		expect(points.map((p) => [p.x, p.y, p.label, p.series, p.color])).toEqual([
			[1, 5, '2', 'A', 'red'],
			[1, 9, '4', 'B', 'blue']
		]);
	});

	test('leaves out a series the legend turned off, and rows `include` rejects', () => {
		const legendInteraction = {
			disabledSeries: new SvelteMap([['A', { mode: 'style' }]])
		} as unknown as LegendInteractionStore;
		const off = buildProcessedHoverPoints<Row>({
			processed,
			colorFor,
			legendInteraction,
			label: () => ''
		});
		expect(off.map((p) => p.series)).toEqual(['B']);
		const included = buildProcessedHoverPoints<Row>({
			processed,
			colorFor,
			legendInteraction: null,
			label: () => '',
			include: (row) => row.raw === 2
		});
		expect(included.map((p) => p.series)).toEqual(['A']);
	});

	test('`row` decides what a hovered point reads as', () => {
		const [point] = buildProcessedHoverPoints<Row>({
			processed,
			colorFor,
			legendInteraction: null,
			label: () => '',
			row: (row) => ({ ...row, extra: true })
		});
		expect(point.row.extra).toBe(true);
	});
});
