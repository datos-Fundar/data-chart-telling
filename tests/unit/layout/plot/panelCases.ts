import { vi, expect } from 'vitest';
import GenericCore from '$lib/layout/plot/Core.svelte';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import { buildAreaDefaults } from '$lib/plots/evolution/area/defaults';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { buildScatterDefaults } from '$lib/plots/correlation/scatter/defaults';
import { buildHistogramDefaults } from '$lib/plots/distribution/histogram/defaults';
import { buildDensityDefaults } from '$lib/plots/distribution/density/defaults';
import { buildHeatmapDefaults } from '$lib/plots/correlation/heatmap/defaults';
import { buildPyramidDefaults } from '$lib/plots/distribution/pyramid/defaults';
import { buildViolinDefaults } from '$lib/plots/distribution/violin/defaults';
import { buildRaincloudDefaults } from '$lib/plots/distribution/raincloud/defaults';
import { buildBoxDefaults } from '$lib/plots/distribution/box/defaults';
import { buildLollipopDefaults } from '$lib/plots/ranking/lollipop/defaults';
import { buildDumbbellDefaults } from '$lib/plots/ranking/dumbbell/defaults';
import { buildClevelandDefaults } from '$lib/plots/ranking/cleveland/defaults';
import { buildBulletDefaults } from '$lib/plots/ranking/bullet/defaults';
import { buildSlopeDefaults } from '$lib/plots/evolution/slope/defaults';
import { buildSparklineDefaults } from '$lib/plots/evolution/sparkline/defaults';
import { buildForestDefaults } from '$lib/plots/ranking/forest/defaults';
import type { FacetConfig } from '$lib/types/layout/facet';

export const [
	LineCore,
	AreaCore,
	BarCore,
	ScatterCore,
	HistogramCore,
	HeatmapCore,
	PyramidCore,
	BoxCore,
	LollipopCore,
	DumbbellCore,
	ClevelandCore,
	ForestCore,
	BulletCore,
	SlopeCore,
	SparklineCore,
	DensityCore,
	ViolinCore,
	RaincloudCore
] = Array(18).fill(GenericCore);

export type Row = { year: number; region: string; sector: string; value: number };

export const ROWS: Row[] = ['North', 'South', 'Center'].flatMap((region, r) =>
	['Agriculture', 'Industry'].flatMap((sector, s) =>
		[2021, 2022, 2023].map((year, a) => ({
			year,
			region,
			sector,
			value: 3 + r * 7 + s * 4 + a * (r + 1)
		}))
	)
);

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Case = {
	name: string;
	Core: any;
	buildDefaults: any;
	core: Record<string, unknown>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const BOX = { data: ROWS, width: 720, height: 360 };

export const CASES: Case[] = [
	{
		name: 'line with a statistic and value labels',
		Core: LineCore,
		buildDefaults: buildLineDefaults,
		core: {
			...BOX,
			x: 'year',
			y: 'value',
			color: 'sector',
			statistics: [{ type: 'movingAverage', k: 2 }],
			styles: { values: { show: true } }
		}
	},
	{
		name: 'stacked area',
		Core: AreaCore,
		buildDefaults: buildAreaDefaults,
		core: { ...BOX, x: 'year', y: 'value', color: 'sector', transforms: [{ type: 'stackY' }] }
	},
	{
		name: 'stacked bar with value labels',
		Core: BarCore,
		buildDefaults: buildBarDefaults,
		core: {
			...BOX,
			x: 'year',
			y: 'value',
			color: 'sector',
			transforms: [{ type: 'stackY' }],
			styles: { values: { show: true } }
		}
	},
	{
		name: 'grouped bar',
		Core: BarCore,
		buildDefaults: buildBarDefaults,
		core: { ...BOX, x: 'year', y: 'value', color: 'sector' }
	},
	{
		name: 'scatter with an author marker',
		Core: ScatterCore,
		buildDefaults: buildScatterDefaults,
		core: {
			...BOX,
			x: 'year',
			y: 'value',
			color: 'sector',
			markers: [{ type: 'dot', transforms: [{ type: 'selectLast' }], styles: { r: 6 } }]
		}
	},
	{
		name: 'histogram',
		Core: HistogramCore,
		buildDefaults: buildHistogramDefaults,
		core: { ...BOX, x: 'value', color: 'sector' }
	},
	{
		name: 'heatmap',
		Core: HeatmapCore,
		buildDefaults: buildHeatmapDefaults,
		core: { ...BOX, x: 'year', y: 'sector', color: 'value' }
	},
	{
		name: 'pyramid',
		Core: PyramidCore,
		buildDefaults: buildPyramidDefaults,
		core: { ...BOX, x: 'value', y: 'year', color: 'sector' }
	},
	{
		name: 'box',
		Core: BoxCore,
		buildDefaults: buildBoxDefaults,
		core: { ...BOX, x: 'sector', y: 'value', color: 'sector' }
	},
	{
		name: 'lollipop',
		Core: LollipopCore,
		buildDefaults: buildLollipopDefaults,
		core: { ...BOX, x: 'sector', y: 'value', color: 'sector' }
	},
	{
		name: 'dumbbell',
		Core: DumbbellCore,
		buildDefaults: buildDumbbellDefaults,
		core: { ...BOX, x: 'year', y: 'value', color: 'sector' }
	},
	{
		name: 'cleveland',
		Core: ClevelandCore,
		buildDefaults: buildClevelandDefaults,
		core: { ...BOX, x: 'year', y: 'value', color: 'sector' }
	},
	{
		name: 'forest',
		Core: ForestCore,
		buildDefaults: buildForestDefaults,
		core: { ...BOX, x: 'sector', y: 'value', color: 'sector', lower: 'value', upper: 'value' }
	},
	{
		name: 'bullet',
		Core: BulletCore,
		buildDefaults: buildBulletDefaults,
		core: { ...BOX, x: 'sector', y: 'value', color: 'sector', target: 'value', ranges: [100] }
	},
	{
		name: 'slope',
		Core: SlopeCore,
		buildDefaults: buildSlopeDefaults,
		core: { ...BOX, x: 'year', y: 'value', color: 'sector' }
	},
	{
		name: 'sparkline',
		Core: SparklineCore,
		buildDefaults: buildSparklineDefaults,
		core: { ...BOX, x: 'year', y: 'value', color: 'sector' }
	},
	{
		name: 'density',
		Core: DensityCore,
		buildDefaults: buildDensityDefaults,
		core: { ...BOX, x: 'value', color: 'sector' }
	},
	{
		name: 'violin',
		Core: ViolinCore,
		buildDefaults: buildViolinDefaults,
		core: { ...BOX, x: 'sector', y: 'value', color: 'sector' }
	},
	{
		name: 'raincloud',
		Core: RaincloudCore,
		buildDefaults: buildRaincloudDefaults,
		core: { ...BOX, x: 'sector', y: 'value', color: 'sector' }
	}
];

export const FACETS: [string, FacetConfig<Row>][] = [
	['by region', { by: 'region' }],
	['rows x cols, free', { rows: 'region', cols: 'year', scales: 'free' }]
];

/** The rendered SVGs, with generated ids left out. */
export function svgMarkup(container: Element): string {
	return [...container.querySelectorAll('.dct-plot svg')]
		.map((svg) => svg.outerHTML)
		.join('\n')
		.replace(/\s(id|clip-path|mask|href|xlink:href)="[^"]*"/g, '')
		.replace(/url\(#[^)]*\)/g, 'url()');
}

/** How long a grid waits after its cells' last report before it pins their margins aligned (`GridAlignment`). */
export const ALIGN_DELAY = 150;

/** A CPU-starved CI runner renders these grids slowly, so the default test timeout is too short. */
export const SLOW_TEST = 90_000;

/** Waits for `count` plots, then for their markup to hold still past the grid's alignment delay. */
export async function settled(container: Element, count: number): Promise<string> {
	await vi.waitFor(() => expect(container.querySelectorAll('.dct-plot svg').length).toBe(count));
	let last = '';
	await vi.waitFor(
		async () => {
			last = svgMarkup(container);
			await new Promise((r) => setTimeout(r, ALIGN_DELAY + 100));
			expect(svgMarkup(container)).toBe(last);
		},
		{ timeout: 30000, interval: 60 }
	);
	return last;
}
