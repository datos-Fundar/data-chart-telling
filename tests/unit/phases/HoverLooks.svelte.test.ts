import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import { buildAreaDefaults } from '$lib/plots/evolution/area/defaults';
import { buildSlopeDefaults } from '$lib/plots/evolution/slope/defaults';
import { buildSparklineDefaults } from '$lib/plots/evolution/sparkline/defaults';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { buildBulletDefaults } from '$lib/plots/ranking/bullet/defaults';
import { buildClevelandDefaults } from '$lib/plots/ranking/cleveland/defaults';
import { buildDumbbellDefaults } from '$lib/plots/ranking/dumbbell/defaults';
import { buildForestDefaults } from '$lib/plots/ranking/forest/defaults';
import { buildLollipopDefaults } from '$lib/plots/ranking/lollipop/defaults';
import { buildHeatmapDefaults } from '$lib/plots/correlation/heatmap/defaults';
import { buildScatterDefaults } from '$lib/plots/correlation/scatter/defaults';
import { buildBoxDefaults } from '$lib/plots/distribution/box/defaults';
import { buildViolinDefaults } from '$lib/plots/distribution/violin/defaults';
import { buildDensityDefaults } from '$lib/plots/distribution/density/defaults';
import { buildHistogramDefaults } from '$lib/plots/distribution/histogram/defaults';
import { buildPyramidDefaults } from '$lib/plots/distribution/pyramid/defaults';
import { buildTreemapDefaults } from '$lib/plots/part-of-a-whole/treemap/defaults';
import type { HoverStrategy } from '$lib/types/layout/hover';
import type { HoverLook } from '$lib/types/markers/common';
import type { AxisPlotDefaults } from '$lib/types/phases';

type Row = Record<string, unknown>;

/** A kind's own hover under its strategy, from running its whole pipeline over `props`, as `type:axis` names. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lookOf(kind: AxisPlotDefaults<any, any>, props: Row, strategy?: HoverStrategy) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG);
	const { hover } = Pipeline.ofAxisKind(kind).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as { hover: { strategy: HoverStrategy; look: (strategy: HoverStrategy) => HoverLook } };
	const look = hover.look(strategy ?? hover.strategy);
	const names = (list: HoverLook['back']) =>
		(list ?? []).map((m) => ('axis' in m && m.axis ? `${m.type}:${m.axis}` : m.type));
	return { back: names(look.back), front: names(look.front) };
}

const SERIES = [
	{ c: 'A', g: 'f', v: 1, lo: 0, hi: 2 },
	{ c: 'A', g: 'm', v: 3, lo: 2, hi: 4 },
	{ c: 'B', g: 'f', v: 2, lo: 1, hi: 3 },
	{ c: 'B', g: 'm', v: 4, lo: 3, hi: 5 }
];
const BY_CATEGORY = { data: SERIES, x: 'c', y: 'v', color: 'g' };
const VALUES = { data: SERIES, x: 'v' };
const EVOLUTION = {
	data: [1, 2, 3].flatMap((t) => ['f', 'm'].map((g) => ({ t, g, v: t * (g === 'f' ? 1 : 2) }))),
	x: 't',
	y: 'v',
	color: 'g'
};

describe("each plot kind's own hover", () => {
	test('line, area and density: a crosshair along the strategy, and a dot and a label', () => {
		const shared = { back: ['rule:x'], front: ['dot', 'text'] };
		expect(lookOf(buildLineDefaults<Row>(), EVOLUTION)).toEqual(shared);
		expect(lookOf(buildAreaDefaults<Row>(), EVOLUTION)).toEqual(shared);
		expect(lookOf(buildDensityDefaults<Row>(), VALUES)).toEqual(shared);
	});

	test('the shared crosshair follows the strategy in force, whatever the plot was given', () => {
		const line = buildLineDefaults<Row>();
		expect(lookOf(line, EVOLUTION, 'punctual').back).toEqual(['rule:x', 'rule:y']);
		expect(lookOf(line, EVOLUTION, 'y').back).toEqual(['rule:y']);
		expect(lookOf(line, EVOLUTION, 'series').back).toEqual([]);
	});

	test('treemap and heatmap only restyle their shapes', () => {
		const none = { back: [], front: [] };
		expect(
			lookOf(buildTreemapDefaults<Row>(), { data: SERIES, value: 'v', grouping: 'g.c' })
		).toEqual(none);
		expect(
			lookOf(buildHeatmapDefaults<Row>(), { data: SERIES, x: 'c', y: 'g', color: 'v' })
		).toEqual(none);
	});

	test('bar, bullet, box, violin and pyramid: the band of the hovered category behind it', () => {
		const behind = (axis: 'x' | 'y') => ({ back: [`band:${axis}`], front: [] });
		expect(lookOf(buildBarDefaults<Row>(), BY_CATEGORY)).toEqual(behind('x'));
		expect(lookOf(buildBarDefaults<Row>(), { ...BY_CATEGORY, x: 'v', y: 'c' })).toEqual(
			behind('y')
		);
		expect(lookOf(buildBulletDefaults<Row>(), { ...BY_CATEGORY, color: undefined })).toEqual(
			behind('x')
		);
		expect(lookOf(buildBoxDefaults<Row>(), BY_CATEGORY)).toEqual(behind('x'));
		expect(lookOf(buildViolinDefaults<Row>(), BY_CATEGORY)).toEqual(behind('x'));
		expect(
			lookOf(buildPyramidDefaults<Row>(), { data: SERIES, x: 'v', y: 'c', color: 'g' })
		).toEqual(behind('y'));
	});

	test("histogram: the hovered bin's span behind it", () => {
		expect(lookOf(buildHistogramDefaults<Row>(), VALUES)).toEqual({ back: ['rect'], front: [] });
	});

	test('scatter: a crosshair through the point, and its label', () => {
		expect(lookOf(buildScatterDefaults<Row>(), { data: SERIES, x: 'lo', y: 'v' })).toEqual({
			back: ['rule:x', 'rule:y'],
			front: ['text']
		});
	});

	test('slope and the Cleveland family: a rule along the value axis, and a dot and a label', () => {
		const valueRule = (axis: 'x' | 'y') => ({ back: [`rule:${axis}`], front: ['dot', 'text'] });
		expect(lookOf(buildSlopeDefaults<Row>(), EVOLUTION)).toEqual(valueRule('y'));
		expect(lookOf(buildClevelandDefaults<Row>(), BY_CATEGORY)).toEqual(valueRule('y'));
		expect(lookOf(buildDumbbellDefaults<Row>(), BY_CATEGORY)).toEqual(valueRule('y'));
		expect(lookOf(buildLollipopDefaults<Row>(), { ...BY_CATEGORY, color: undefined })).toEqual(
			valueRule('y')
		);
		expect(
			lookOf(buildForestDefaults<Row>(), { data: SERIES, x: 'v', y: 'c', lower: 'lo', upper: 'hi' })
		).toEqual(valueRule('x'));
	});

	test('sparkline: a dot', () => {
		expect(lookOf(buildSparklineDefaults<Row>(), EVOLUTION)).toEqual({ back: [], front: ['dot'] });
	});
});
