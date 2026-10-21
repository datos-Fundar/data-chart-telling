import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import PanelRunProbe from './PanelRunProbe.svelte';
import TimelineRunProbe from './TimelineRunProbe.svelte';
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
import { buildBoxDefaults } from '$lib/plots/distribution/box/defaults';
import { buildLollipopDefaults } from '$lib/plots/ranking/lollipop/defaults';
import { buildDumbbellDefaults } from '$lib/plots/ranking/dumbbell/defaults';
import { buildClevelandDefaults } from '$lib/plots/ranking/cleveland/defaults';
import { buildBulletDefaults } from '$lib/plots/ranking/bullet/defaults';
import { buildSlopeDefaults } from '$lib/plots/evolution/slope/defaults';
import { buildSparklineDefaults } from '$lib/plots/evolution/sparkline/defaults';
import { buildForestDefaults } from '$lib/plots/ranking/forest/defaults';
import type { FacetConfig } from '$lib/types/layout/facet';

const [
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
	ViolinCore
] = Array(17).fill(GenericCore);

type Row = { year: number; region: string; sector: string; value: number };

const ROWS: Row[] = ['North', 'South', 'Center'].flatMap((region, r) =>
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
type Case = {
	name: string;
	Core: any;
	buildDefaults: any;
	core: Record<string, unknown>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const BOX = { data: ROWS, width: 720, height: 360 };

const CASES: Case[] = [
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
	}
];

const FACETS: [string, FacetConfig<Row>][] = [
	['by region', { by: 'region' }],
	['rows x cols, free', { rows: 'region', cols: 'year', scales: 'free' }]
];

/** The rendered SVGs, with generated ids left out. */
function svgMarkup(container: Element): string {
	return [...container.querySelectorAll('.dct-plot svg')]
		.map((svg) => svg.outerHTML)
		.join('\n')
		.replace(/\s(id|clip-path|mask|href|xlink:href)="[^"]*"/g, '')
		.replace(/url\(#[^)]*\)/g, 'url()');
}

/** How long a grid waits after its cells' last report before it pins their margins aligned (`GridAlignment`). */
const ALIGN_DELAY = 150;

/** Waits for `count` plots, then for their markup to hold still past the grid's alignment delay. */
async function settled(container: Element, count: number): Promise<string> {
	await vi.waitFor(() => expect(container.querySelectorAll('.dct-plot svg').length).toBe(count));
	let last = '';
	await vi.waitFor(
		async () => {
			last = svgMarkup(container);
			await new Promise((r) => setTimeout(r, ALIGN_DELAY + 100));
			expect(svgMarkup(container)).toBe(last);
		},
		{ timeout: 8000, interval: 60 }
	);
	return last;
}

describe('Plot - one data run for every facet panel', () => {
	for (const c of CASES) {
		for (const [facetName, facet] of FACETS) {
			const panels = facet.by ? 3 : 9;
			test(`${c.name}, ${facetName}: draws what a run per facet draws`, async () => {
				let runs = 0;
				const once = await render(PanelRunProbe, {
					Core: c.Core,
					core: c.core,
					buildDefaults: c.buildDefaults,
					facet,
					once: true,
					onDataRun: () => runs++
				});
				const onceMarkup = await settled(once.container, panels);
				once.unmount();

				const perFacet = await render(PanelRunProbe, {
					Core: c.Core,
					core: c.core,
					buildDefaults: c.buildDefaults,
					facet,
					once: false
				});
				const perFacetMarkup = await settled(perFacet.container, panels);
				perFacet.unmount();

				expect(onceMarkup).toBe(perFacetMarkup);
				// Without a timeline, the run over every row is the only one.
				expect(runs).toBe(1);
			});
		}
	}
});

describe('Plot - a series keeps its color in every facet panel', () => {
	/** Each line's stroke, per panel, in render order. */
	const strokes = (container: Element) =>
		[...container.querySelectorAll('.dct-plot svg')].map((svg) =>
			[...svg.querySelectorAll('g.lines path')].map((path) => (path as SVGElement).style.stroke)
		);

	test('a panel with only one series draws it in its own color, not the first one', async () => {
		const facet: FacetConfig<Row> = { rows: 'region', cols: 'sector' };
		const core = { ...BOX, x: 'year', y: 'value', color: 'sector' };
		const props = { Core: LineCore, core, buildDefaults: buildLineDefaults, facet };

		const once = await render(PanelRunProbe, { ...props, once: true });
		await settled(once.container, 6);
		const onceStrokes = strokes(once.container);
		once.unmount();
		const perFacet = await render(PanelRunProbe, { ...props, once: false });
		await settled(perFacet.container, 6);
		const perFacetStrokes = strokes(perFacet.container);
		perFacet.unmount();

		// Panels go row by row: North/Agriculture, North/Industry, South/Agriculture, ...
		const agro = onceStrokes[0][0];
		const industria = onceStrokes[1][0];
		expect(agro).not.toBe(industria);
		expect(onceStrokes.map((panel) => panel[0])).toEqual([
			agro,
			industria,
			agro,
			industria,
			agro,
			industria
		]);
		// A run per facet colors each panel's only series alike.
		expect(new Set(perFacetStrokes.map((panel) => panel[0])).size).toBe(1);
	});
});

describe('Plot - data runs with a timeline', () => {
	test('one run over every row for the frame, then one per step, not one per panel', async () => {
		let runs = 0;
		const onDataRun = () => runs++;
		const view = await render(TimelineRunProbe, { progress: 0, onDataRun });
		await settled(view.container, 3);
		expect(runs).toBe(2);
		await view.rerender({ progress: 1, onDataRun });
		await settled(view.container, 3);
		expect(runs).toBe(3);
		view.unmount();
	});
});

describe('Plot - data runs with a legend', () => {
	const legend = (mode: 'dim' | 'omit') => [
		{
			type: 'discrete',
			interactive: { enabled: true, disabled: { mode, style: { opacity: 0.1 } } },
			items: [
				{ name: 'Agriculture', symbol: 'line' },
				{ name: 'Industry', symbol: 'line' }
			]
		}
	];
	const linesPerPanel = (container: Element) =>
		[...container.querySelectorAll('.dct-plot svg')].map((svg) => [
			...svg.querySelectorAll<SVGPathElement>('g.lines path')
		]);
	const toggle = (container: Element, name: string) =>
		(
			[...container.querySelectorAll('[role="button"], button')].find((el) =>
				el.textContent?.includes(name)
			) as HTMLElement
		).click();

	async function renderWith(mode: 'dim' | 'omit', count: { runs: number }) {
		const view = await render(PanelRunProbe, {
			Core: LineCore,
			core: { ...BOX, x: 'year', y: 'value', color: 'sector' },
			buildDefaults: buildLineDefaults,
			facet: { by: 'region' },
			once: true,
			legend: legend(mode),
			onDataRun: () => count.runs++
		});
		await vi.waitFor(() => expect(linesPerPanel(view.container).flat().length).toBe(6));
		return view;
	}

	test('dimming a series runs no data phases again: every panel dims it', async () => {
		const count = { runs: 0 };
		const view = await renderWith('dim', count);
		expect(count.runs).toBe(1);
		toggle(view.container, 'Industry');
		await vi.waitFor(() => {
			for (const lines of linesPerPanel(view.container)) {
				expect(lines.map((p) => p.style.strokeOpacity)).toEqual(['1', '0.1']);
			}
		});
		expect(count.runs).toBe(1);
		view.unmount();
	});

	test('omitting a series runs the data phases once more, for every panel', async () => {
		const count = { runs: 0 };
		const view = await renderWith('omit', count);
		toggle(view.container, 'Industry');
		await vi.waitFor(() =>
			expect(linesPerPanel(view.container).map((l) => l.length)).toEqual([1, 1, 1])
		);
		expect(count.runs).toBe(2);
		view.unmount();
	});
});
