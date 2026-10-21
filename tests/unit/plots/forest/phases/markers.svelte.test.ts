import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildForestDefaults } from '$lib/plots/forest/defaults';
import type {
	DotMarkerConfig,
	RuleMarkerConfig,
	TickMarkerConfig
} from '$lib/types/markers/common';

type Row = Record<string, unknown>;

/** The plot's own connector, cap and dot markers, and its value scale, from running its whole pipeline over `props`. */
function run(props: Row) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend: null });
	const state = Pipeline.ofAxisKind(buildForestDefaults<Row>()).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as unknown as { markers: { type: string }[]; scales: Record<string, { domain?: number[] }> };
	return {
		rules: state.markers.filter((m): m is RuleMarkerConfig => m.type === 'rule'),
		ticks: state.markers.filter((m): m is TickMarkerConfig => m.type === 'tick'),
		dots: state.markers.filter((m): m is DotMarkerConfig => m.type === 'dot'),
		scales: state.scales
	};
}

const rows = [
	{ c: 'a', v: 0.8, lo: 0.5, hi: 1.1 },
	{ c: 'b', v: 1.4, lo: 0.9, hi: 2.1 },
	{ c: 'c', v: 0.3, lo: -0.2, hi: 0.7 }
];
const props = { data: rows, x: 'c', y: 'v', lower: 'lo', upper: 'hi' };

describe('ForestPlot markers', () => {
	test('each row is a stem from its lower to its upper end, and a dot at its value', () => {
		const { rules, dots } = run(props);
		const stems = rules.flatMap((r) => r.data) as Row[];
		expect(stems.map((s) => [s.category, s.from, s.to])).toEqual([
			['a', 0.5, 1.1],
			['b', 0.9, 2.1],
			['c', -0.2, 0.7]
		]);
		expect(dots).toHaveLength(1);
		expect(dots[0].styles?.dotRadius).toBe(DEFAULT_CONFIG.forest.dotRadius);
	});

	test('error is the half-width around the value; lower and upper win where set', () => {
		const around = run({
			data: rows.map((r) => ({ ...r, e: 0.25 })),
			x: 'c',
			y: 'v',
			error: 'e'
		});
		const round = (n: unknown) => Math.round(Number(n) * 100) / 100;
		expect(
			(around.rules.flatMap((r) => r.data) as Row[]).map((s) => [round(s.from), round(s.to)])
		).toEqual([
			[0.55, 1.05],
			[1.15, 1.65],
			[0.05, 0.55]
		]);
		const mixed = run({
			data: rows.map((r) => ({ ...r, e: 0.25 })),
			x: 'c',
			y: 'v',
			error: 'e',
			upper: 'hi'
		});
		expect((mixed.rules.flatMap((r) => r.data) as Row[])[0]).toMatchObject({ from: 0.55, to: 1.1 });
	});

	test('a row with no interval is a dot alone', () => {
		const { rules } = run({ data: [{ c: 'a', v: 0.8 }], x: 'c', y: 'v', lower: 'lo', upper: 'hi' });
		expect((rules.flatMap((r) => r.data) as Row[])[0]).toMatchObject({ from: 0.8, to: 0.8 });
	});

	test('the value axis is fitted to the intervals, unless the author pins it', () => {
		const [lo, hi] = run(props).scales.y.domain!;
		expect(lo).toBeLessThanOrEqual(-0.2);
		expect(hi).toBeGreaterThanOrEqual(2.1);
		expect(run({ ...props, scales: { y: { domain: [0, 5] } } }).scales.y.domain).toEqual([0, 5]);
	});

	test('caps are a tick at each end of each interval, which connector.caps turns off or resizes', () => {
		const { ticks } = run(props);
		const ends = ticks.flatMap((t) => (t.data as Row[]).map((d) => d.end));
		expect(ends.sort()).toEqual([-0.2, 0.5, 0.7, 0.9, 1.1, 2.1]);
		expect(ticks[0].tickLength).toBe(DEFAULT_CONFIG.connector.capLength);
		expect(run({ ...props, styles: { connector: { caps: false } } }).ticks).toHaveLength(0);
		expect(
			run({ ...props, styles: { connector: { caps: { length: 14 } } } }).ticks[0].tickLength
		).toBe(14);
	});
});
