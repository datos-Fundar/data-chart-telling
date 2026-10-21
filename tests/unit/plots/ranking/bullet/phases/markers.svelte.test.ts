import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildBulletDefaults } from '$lib/plots/ranking/bullet/defaults';
import type {
	AxisBasedMarkersConfig,
	BarMarkerConfig,
	RuleMarkerConfig,
	TickMarkerConfig
} from '$lib/types/markers/common';

type Row = Record<string, unknown>;

/** The plot's markers, in drawing order, and its value scale, from running its whole pipeline over `props`. */
function run(props: Row) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend: null });
	const state = Pipeline.ofAxisKind(buildBulletDefaults<Row>()).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as unknown as {
		markers: AxisBasedMarkersConfig[];
		scales: Record<string, { domain?: number[] }>;
	};
	return {
		order: state.markers.map((m) => m.type),
		rules: state.markers.filter((m): m is RuleMarkerConfig => m.type === 'rule'),
		bars: state.markers.filter((m): m is BarMarkerConfig => m.type === 'bar'),
		ticks: state.markers.filter((m): m is TickMarkerConfig => m.type === 'tick'),
		scales: state.scales
	};
}

const rows = [
	{ c: 'a', v: 60, goal: 70, lo: 40, mid: 65, hi: 90 },
	{ c: 'b', v: 80, goal: 75, lo: 40, mid: 65, hi: 90 }
];
const props = { data: rows, x: 'v', y: 'c' };

describe('BulletPlot markers', () => {
	test('draws the ranges first, then the bars, then the targets', () => {
		const { order } = run({ ...props, target: 'goal', ranges: ['lo', 'mid', 'hi'] });
		expect(order.indexOf('rule')).toBeLessThan(order.indexOf('bar'));
		expect(order.indexOf('bar')).toBeLessThan(order.indexOf('tick'));
	});

	test('each range is a band from the baseline to its bound, the widest drawn first', () => {
		const { rules } = run({ ...props, target: 'goal', ranges: ['hi', 'lo', 'mid'] });
		const bands = rules.flatMap((r) => r.data) as Row[];
		expect(bands.filter((b) => b.category === 'a').map((b) => [b.from, b.to])).toEqual([
			[0, 90],
			[0, 65],
			[0, 40]
		]);
		// The smallest band is the darkest.
		const stroke = (to: number) => bands.find((b) => b.category === 'a' && b.to === to)?.stroke;
		expect(stroke(40)).toBe(DEFAULT_CONFIG.bullet.rangeColors[0]);
		expect(stroke(90)).toBe(DEFAULT_CONFIG.bullet.rangeColors[2]);
	});

	test('a number is the same bound for every category; a field or a function reads each row', () => {
		const numeric = run({ ...props, target: 72, ranges: [50, (row: Row) => Number(row.hi)] });
		expect(numeric.ticks[0].data).toEqual([
			{ category: 'a', end: 72 },
			{ category: 'b', end: 72 }
		]);
		const bands = numeric.rules.flatMap((r) => r.data) as Row[];
		expect(bands.map((b) => b.to)).toEqual([90, 50, 90, 50]);
	});

	test('the bars take the configured thickness, in px', () => {
		const { bars } = run({ ...props, target: 'goal' });
		expect(bars[0].thickness).toBe(DEFAULT_CONFIG.bullet.barThickness);
	});

	test('the target tick takes its length and width from the configuration', () => {
		const { ticks } = run({ ...props, target: 'goal' });
		expect(ticks[0].tickLength).toBe(DEFAULT_CONFIG.bullet.targetLength);
		expect(ticks[0].styles?.strokeWidth).toBe(DEFAULT_CONFIG.bullet.targetWidth);
	});

	test('without a target or ranges it is a plain bar plot', () => {
		const { order } = run(props);
		expect(order).not.toContain('rule');
		expect(order).not.toContain('tick');
	});

	test('the value axis reaches the largest range and target, not only the bars', () => {
		const { scales } = run({ ...props, target: 'goal', ranges: [120] });
		expect(scales.x.domain![1]).toBeGreaterThanOrEqual(120);
	});

	test('a row without a target has no tick', () => {
		const { ticks } = run({
			data: [rows[0], { ...rows[1], goal: null }],
			x: 'v',
			y: 'c',
			target: 'goal'
		});
		expect(ticks[0].data).toEqual([{ category: 'a', end: 70 }]);
	});

	test('styles.bar, styles.ranges and styles.target override the configured look', () => {
		const { rules, ticks, bars } = run({
			...props,
			target: 'goal',
			ranges: ['lo', 'hi'],
			styles: {
				bar: { thickness: 14 },
				ranges: { colors: ['#111111', '#222222'], width: 40 },
				target: { color: '#ff0000', width: 5, length: 30 }
			}
		});
		const bands = rules[0].data as Row[];
		expect(bands.map((b) => b.stroke)).toEqual(['#222222', '#111111', '#222222', '#111111']);
		expect(rules[0].styles?.strokeWidth).toBe(40);
		expect(bars[0].thickness).toBe(14);
		expect(ticks[0].tickLength).toBe(30);
		expect(ticks[0].styles).toMatchObject({ stroke: '#ff0000', strokeWidth: 5 });
	});
});
