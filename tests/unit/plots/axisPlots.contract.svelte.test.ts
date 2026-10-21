import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import type { Component } from 'svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import ClevelandPlot from '$lib/plots/ranking/cleveland/Plot.svelte';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import { waitForSvg } from './_helpers/svg';

/**
 * What every axis-based plot kind must do with its markers, whatever its own
 * phases look like: a plot-level `statistics` entry derives a marker, an
 * author marker's own `.statistics` and `transforms` are resolved. Each case
 * renders the plot with and without the feature and compares what was drawn.
 */

const NUMERIC = Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: (i * 7) % 11, g: 'A' }));
const CATEGORIES = ['a', 'b', 'c', 'd', 'e'].map((x, i) => ({ x, y: i + 2, g: 'A' }));
/** Two series over the same categories: what a dumbbell joins. */
const DUAL = CATEGORIES.flatMap((d) => [
	{ ...d, g: 'before' },
	{ ...d, y: d.y + 3, g: 'after' }
]);
const PYRAMID = ['0-4', '5-9', '10-14', '15-19'].flatMap((age, i) => [
	{ age, pct: i + 1, sex: 'F' },
	{ age, pct: i + 2, sex: 'M' }
]);

type Kind = {
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Plot: Component<any>;
	props: Record<string, unknown>;
	/** Whether `x` is a numeric axis, so an author `rect` binned on `x` is meaningful. */
	numericX: boolean;
	/** Whether the plot accepts a top-level `statistics` prop. */
	plotStatistics: boolean;
	/** Whether a plot-level `stackY` is meaningful for the plot's own marks (a line doesn't stack). */
	stackable: boolean;
};

const KINDS: Kind[] = [
	{
		name: 'BarPlot',
		Plot: BarPlot,
		props: { data: CATEGORIES, x: 'x', y: 'y', scales: { x: { type: 'categorical' } } },
		numericX: false,
		plotStatistics: true,
		stackable: true
	},
	{
		name: 'LinePlot',
		Plot: LinePlot,
		props: { data: NUMERIC, x: 'x', y: 'y' },
		numericX: true,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'AreaPlot',
		Plot: AreaPlot,
		props: { data: NUMERIC, x: 'x', y: 'y' },
		numericX: true,
		plotStatistics: true,
		stackable: true
	},
	{
		name: 'ScatterPlot',
		Plot: ScatterPlot,
		props: { data: NUMERIC, x: 'x', y: 'y' },
		numericX: true,
		plotStatistics: true,
		stackable: true
	},
	{
		name: 'PyramidPlot',
		Plot: PyramidPlot,
		props: { data: PYRAMID, x: 'pct', y: 'age', color: 'sex' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'HistogramPlot',
		Plot: HistogramPlot,
		props: { data: NUMERIC, x: 'x' },
		numericX: true,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'DensityPlot',
		Plot: DensityPlot,
		props: { data: NUMERIC, x: 'x' },
		numericX: true,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'HeatmapPlot',
		Plot: HeatmapPlot,
		props: { data: NUMERIC.map((d) => ({ ...d, v: d.y })), x: 'x', y: 'g', color: 'v' },
		numericX: false,
		plotStatistics: false,
		stackable: false
	},
	{
		name: 'BoxPlot',
		Plot: BoxPlot,
		props: { data: CATEGORIES, x: 'x', y: 'y' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'LollipopPlot',
		Plot: LollipopPlot,
		props: { data: CATEGORIES, x: 'x', y: 'y' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'DumbbellPlot',
		Plot: DumbbellPlot,
		props: { data: DUAL, x: 'x', y: 'y', color: 'g' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'ClevelandPlot',
		Plot: ClevelandPlot,
		props: { data: CATEGORIES, x: 'x', y: 'y' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'BulletPlot',
		Plot: BulletPlot,
		props: { data: CATEGORIES, x: 'x', y: 'y' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'SlopePlot',
		Plot: SlopePlot,
		props: { data: CATEGORIES, x: 'x', y: 'y' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'SparklinePlot',
		Plot: SparklinePlot,
		props: { data: CATEGORIES, x: 'x', y: 'y' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	},
	{
		name: 'ForestPlot',
		Plot: ForestPlot,
		props: { data: CATEGORIES, x: 'x', y: 'y' },
		numericX: false,
		plotStatistics: true,
		stackable: false
	}
];

async function draw(kind: Kind, extra: Record<string, unknown> = {}): Promise<SVGElement> {
	const { container } = render(kind.Plot, { width: 400, height: 300, ...kind.props, ...extra });
	return waitForSvg(container);
}

/** Lines drawn: svelteplot's `Line` wraps each one in `g.lines`, drawn or not (a line over a band scale has no path). */
const countLines = (svg: SVGElement) => svg.querySelectorAll('g.lines').length;

/** Filled rects only - the plot's own background rects are transparent or black. */
const countRects = (svg: SVGElement) =>
	Array.from(svg.querySelectorAll('rect')).filter((r) => {
		const fill = getComputedStyle(r).fill;
		return fill !== 'rgba(0, 0, 0, 0)' && fill !== 'rgb(0, 0, 0)';
	}).length;

const MOVING_AVERAGE = { type: 'movingAverage' as const, k: 3 };

/** Two series of constant height 2 and 3 over the same `x`: stacked, the top reaches 5. */
const STACKABLE = [1, 2, 3].flatMap((x) => [
	{ x, y: 2, g: 'A' },
	{ x, y: 3, g: 'B' }
]);
/** The largest tick label on an axis, read past the locale's decimal comma and typographic minus. */
const maxTick = (svg: SVGElement, axis: 'x' | 'y') =>
	Math.max(
		...Array.from(svg.querySelectorAll(`g.axis-${axis} text`)).map((t) =>
			Number(t.textContent?.replace('\u2212', '-').replace(',', '.'))
		)
	);

describe.each(KINDS)('$name markers contract', (kind) => {
	test.runIf(kind.plotStatistics)('a plot-level statistic adds its derived marker', async () => {
		const base = countLines(await draw(kind));
		const withStat = countLines(await draw(kind, { statistics: [MOVING_AVERAGE] }));
		expect(withStat).toBeGreaterThan(base);
	});

	test("an author marker's own statistics expand next to it", async () => {
		const line = { type: 'line' as const, data: NUMERIC, x: 'x', y: 'y' };
		const base = countLines(await draw(kind, { markers: [line] }));
		const withStat = countLines(
			await draw(kind, { markers: [{ ...line, statistics: [MOVING_AVERAGE] }] })
		);
		expect(withStat).toBe(base + 1);
	});

	test.runIf(kind.numericX)("an author marker's own transforms run", async () => {
		const base = countRects(await draw(kind));
		const binned = {
			type: 'rect' as const,
			data: NUMERIC,
			x: 'x',
			transforms: [{ type: 'binX' as const, y: 'count', thresholds: [0, 6, 13] }]
		};
		const withBins = countRects(await draw(kind, { markers: [binned] }));
		expect(withBins).toBe(base + 2);
	});

	test.runIf(kind.stackable)('a plot-level stackY stacks the series', async () => {
		const svg = await draw(kind, {
			data: STACKABLE,
			x: 'x',
			y: 'y',
			color: 'g',
			transforms: [{ type: 'stackY' as const }]
		});
		expect(maxTick(svg, 'y')).toBeGreaterThanOrEqual(5);
	});
});
