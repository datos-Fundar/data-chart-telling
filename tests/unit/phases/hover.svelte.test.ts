import { describe, test, expect } from 'vitest';
import { HoverPhase } from '$lib/phases/hover/HoverPhase';
import { HoverSettings } from '$lib/layout/hover/HoverSettings';
import { Pipeline } from '$lib/phases/Pipeline';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { HoverConfig } from '$lib/types/plots/props';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import type { ProcessedData } from '$lib/types/phases';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';

type Row = Record<string, unknown>;

describe('HoverSettings.buildConfig', () => {
	const base = { points: [], label: () => '', format: () => '', defaultStrategy: 'x' as const };

	test('is active with a tooltip or a hover marker, and only then', () => {
		expect(
			HoverSettings.buildConfig<Row>({ ...base, tooltip: undefined, markers: [] }).active
		).toBe(false);
		expect(
			HoverSettings.buildConfig<Row>({
				...base,
				tooltip: undefined,
				markers: [{ type: 'hover' }]
			}).active
		).toBe(true);
		const tooltip = { format: () => '', sync: false };
		expect(HoverSettings.buildConfig<Row>({ ...base, tooltip, markers: [] }).active).toBe(true);
	});

	test("falls back to the plot kind's own strategy, and the tooltip's wins over it", () => {
		expect(
			HoverSettings.buildConfig<Row>({ ...base, tooltip: undefined, markers: [] }).strategy
		).toBe('x');
		const tooltip = { format: () => '', sync: false, strategy: 'series' as const };
		expect(HoverSettings.buildConfig<Row>({ ...base, tooltip, markers: [] }).strategy).toBe(
			'series'
		);
	});

	test('carries pointMatching only when given', () => {
		expect(
			HoverSettings.buildConfig<Row>({ ...base, tooltip: undefined, markers: [] })
		).not.toHaveProperty('pointMatching');
		const contains = HoverSettings.buildConfig<Row>({
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
		const points = HoverPhase.buildProcessedHoverPoints<Row>({
			processed,
			colorFor,
			label: (row) => String(row.raw)
		});
		expect(points.map((p) => [p.x, p.y, p.label, p.series, p.color])).toEqual([
			[1, 5, '2', 'A', 'red'],
			[1, 9, '4', 'B', 'blue']
		]);
	});

	test('leaves out a series the legend turned off, and rows `include` rejects', () => {
		const legendInteraction = new LegendState();
		legendInteraction.turnOff('A', { mode: 'dim' });
		const off = HoverPhase.buildProcessedHoverPoints<Row>({
			processed,
			colorFor,
			legendInteraction,
			label: () => ''
		});
		expect(off.map((p) => p.series)).toEqual(['B']);
		const included = HoverPhase.buildProcessedHoverPoints<Row>({
			processed,
			colorFor,
			label: () => '',
			include: (row) => row.raw === 2
		});
		expect(included.map((p) => p.series)).toEqual(['A']);
	});

	test('`row` decides what a hovered point reads as', () => {
		const [point] = HoverPhase.buildProcessedHoverPoints<Row>({
			processed,
			colorFor,
			label: () => '',
			row: (row) => ({ ...row, extra: true })
		});
		expect(point.row.extra).toBe(true);
	});
});

describe('the "hover" phase', () => {
	type Sale = { year: number; region: string; value: number };
	const SALES: Sale[] = [
		{ year: 2021, region: 'Norte', value: 3 },
		{ year: 2022, region: 'Norte', value: 5 },
		{ year: 2021, region: 'Sur', value: 4 }
	];
	const runKind = (defaults: AxisPlotDefaults<never, never>, props: Record<string, unknown>) =>
		Pipeline.ofAxisKind(defaults as never).run({ data: SALES, width: 400, height: 300, ...props }, {
			cfg: DEFAULT_CONFIG
		} as never) as {
			hover?: HoverConfig<Sale>;
			hoverPosition?: { x: (r: never) => unknown; y: (r: never) => unknown };
		};

	test('leaves what the pointer can match, and where each row sits, in the state', () => {
		const state = runKind(buildLineDefaults() as never, {
			x: 'year',
			y: 'value',
			color: 'region',
			tooltip: { format: undefined }
		});
		expect(state.hover?.active).toBe(true);
		expect(state.hover?.strategy).toBe('x');
		expect(state.hover?.points.map((p) => [p.x, p.y, p.series])).toEqual([
			[2021, 3, 'Norte'],
			[2022, 5, 'Norte'],
			[2021, 4, 'Sur']
		]);
		expect(state.hoverPosition?.y(SALES[1] as never)).toBe(5);
	});

	test("takes the kind's own strategy: a horizontal bar hovers along y, matching each bar's band", () => {
		const state = runKind(buildBarDefaults() as never, {
			x: 'value',
			y: 'region',
			scales: { y: { type: 'categorical' } }
		});
		expect(state.hover?.active).toBe(false);
		expect(state.hover?.strategy).toBe('y');
		expect(state.hover?.pointMatching).toBe('contains');
	});
});
