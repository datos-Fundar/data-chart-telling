import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildSlopeDefaults } from '$lib/plots/evolution/slope/defaults';
import type {
	AxisBasedMarkersConfig,
	DotMarkerConfig,
	LineMarkerConfig,
	TextMarkerConfig
} from '$lib/types/markers/common';

type Row = Record<string, unknown>;

/** The plot's markers, in drawing order, and its x scale, from running its whole pipeline over `props`. */
function run(props: Row) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend: null });
	const pipeline = Pipeline.ofAxisKind(buildSlopeDefaults<Row>());
	const state = pipeline.run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as unknown as {
		markers: AxisBasedMarkersConfig[];
		scales: Record<string, { domain?: unknown[]; axisDisplay?: string }>;
	};
	return {
		lines: state.markers.filter((m): m is LineMarkerConfig => m.type === 'line'),
		dots: state.markers.filter((m): m is DotMarkerConfig => m.type === 'dot'),
		texts: state.markers.filter((m): m is TextMarkerConfig => m.type === 'text'),
		scales: state.scales,
		hover: pipeline.hoverStrategy(props)
	};
}

const rows = [
	{ moment: 'before', who: 'a', v: 3 },
	{ moment: 'after', who: 'a', v: 5 },
	{ moment: 'before', who: 'b', v: 6 },
	{ moment: 'after', who: 'b', v: 2 }
];
const props = { data: rows, x: 'moment', y: 'v', color: 'who' };

describe('SlopePlot markers', () => {
	test('draws a line and a dot marker per series, with the configured sizes', () => {
		const { lines, dots } = run(props);
		expect(lines).toHaveLength(2);
		expect(dots).toHaveLength(2);
		expect(lines[0].styles?.strokeWidth).toBe(DEFAULT_CONFIG.slope.strokeWidth);
		expect(dots[0].styles?.dotRadius).toBe(DEFAULT_CONFIG.slope.dotRadius);
	});

	test("a segment's own dots and stroke win over the defaults", () => {
		const { lines, dots } = run({
			...props,
			segments: { a: [{ styles: { dots: { dotRadius: 9 }, stroke: { strokeWidth: 4 } } }] }
		});
		expect(dots.map((d) => d.styles?.dotRadius).sort()).toEqual([
			DEFAULT_CONFIG.slope.dotRadius,
			9
		]);
		expect(lines.map((l) => l.styles?.strokeWidth).sort()).toEqual([
			DEFAULT_CONFIG.slope.strokeWidth,
			4
		]);
	});

	test('keeps the positions in the order of the data', () => {
		expect(run(props).scales.x.domain).toEqual(['before', 'after']);
	});

	test('hides the value axis, which the labels stand for', () => {
		expect(run(props).scales.y.axisDisplay).toBe('none');
	});

	test('labels nothing until the values are shown', () => {
		expect(run(props).texts).toHaveLength(0);
	});

	test('labels the first positions before their dots and the last ones after', () => {
		const { texts } = run({ ...props, styles: { values: { show: true } } });
		expect(texts).toHaveLength(2);
		const [before, after] = [...texts].sort((a, b) => (a.styles?.dx ?? 0) - (b.styles?.dx ?? 0));
		expect(before.styles?.textAnchor).toBe('end');
		expect(before.data?.map((d) => (d as Row).v)).toEqual([3, 6]);
		expect(after.styles?.textAnchor).toBe('start');
		expect(after.data?.map((d) => (d as Row).v)).toEqual([5, 2]);
	});

	test('anchor `end` swaps the sides, the labels sitting between the dots', () => {
		const { texts } = run({ ...props, styles: { values: { show: true, anchor: 'end' } } });
		const byAnchor = Object.fromEntries(
			texts.map((t) => [t.styles?.textAnchor, (t.data ?? []).map((d) => (d as Row).v)])
		);
		expect(byAnchor.start).toEqual([3, 6]);
		expect(byAnchor.end).toEqual([5, 2]);
	});

	test('hovers along the category axis', () => {
		expect(run(props).hover).toBe('x');
	});
});
