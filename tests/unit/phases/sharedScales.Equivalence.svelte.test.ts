import { describe, test, expect } from 'vitest';
import { SharedScalesPhase } from '$lib/phases/sharedScales/SharedScalesPhase';
import { buildFacetPanels } from '$lib/layout/facet/config';
import { Pipeline } from '$lib/phases/Pipeline';
import { ScalesPhase } from '$lib/phases/scales/ScalesPhase';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';
import { MarkerAxisValues } from '$lib/phases/scales/MarkerAxisValues';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import { buildAreaDefaults } from '$lib/plots/evolution/area/defaults';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { buildScatterDefaults } from '$lib/plots/correlation/scatter/defaults';
import { buildHistogramDefaults } from '$lib/plots/distribution/histogram/defaults';
import { buildDensityDefaults } from '$lib/plots/distribution/density/defaults';
import { buildHeatmapDefaults } from '$lib/plots/correlation/heatmap/defaults';
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
import type { AxisPipelineProps } from '$lib/phases/Pipeline';
import type { SharedAxisValues } from '$lib/types/phases';
import type { FacetConfig } from '$lib/types/layout/facet';
import type { AxisPlotKind } from '$lib/types/phases';

type Row = { anio: number; region: string; sector: string; valor: number };

const ROWS: Row[] = ['Norte', 'Sur', 'Cuyo'].flatMap((region, r) =>
	['Agro', 'Industria'].flatMap((sector, s) =>
		[2021, 2022, 2023].map((anio, a) => ({
			anio,
			region,
			sector,
			valor: 3 + r * 7 + s * 4 + a * (r + 1)
		}))
	)
);

/* eslint-disable @typescript-eslint/no-explicit-any */
type Case = {
	name: string;
	kind: AxisPlotKind<any, any>;
	props: AxisPipelineProps<Row>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */

const CASES: Case[] = [
	{
		name: 'line with a statistic',
		kind: buildLineDefaults<Row>(),
		props: { x: 'anio', y: 'valor', color: 'sector', statistics: [{ type: 'movingAverage', k: 2 }] }
	},
	{
		name: 'stacked area',
		kind: buildAreaDefaults<Row>(),
		props: { x: 'anio', y: 'valor', color: 'sector', transforms: [{ type: 'stackY' }] }
	},
	{
		name: 'stacked bar',
		kind: buildBarDefaults<Row>(),
		props: { x: 'anio', y: 'valor', color: 'sector', transforms: [{ type: 'stackY' }] }
	},
	{
		name: 'horizontal bar',
		kind: buildBarDefaults<Row>(),
		props: { x: 'valor', y: 'anio', color: 'sector', scales: { y: { type: 'categorical' } } }
	},
	{
		name: 'scatter',
		kind: buildScatterDefaults<Row>(),
		props: { x: 'anio', y: 'valor', color: 'sector' }
	},
	{
		name: 'histogram',
		kind: buildHistogramDefaults<Row>(),
		props: { x: 'valor', color: 'sector' }
	},
	{
		name: 'heatmap',
		kind: buildHeatmapDefaults<Row>(),
		props: { x: 'anio', y: 'sector', color: 'valor' }
	},
	{
		name: 'box',
		kind: buildBoxDefaults<Row>(),
		props: { x: 'sector', y: 'valor', color: 'sector' }
	},
	{
		name: 'lollipop',
		kind: buildLollipopDefaults<Row>(),
		props: { x: 'sector', y: 'valor', color: 'sector' }
	},
	{
		name: 'dumbbell',
		kind: buildDumbbellDefaults<Row>(),
		props: { x: 'anio', y: 'valor', color: 'sector' }
	},
	{
		name: 'cleveland',
		kind: buildClevelandDefaults<Row>(),
		props: { x: 'anio', y: 'valor', color: 'sector' }
	},
	{
		name: 'forest',
		kind: buildForestDefaults<Row>(),
		props: { x: 'sector', y: 'valor', color: 'sector', lower: 'valor', upper: 'valor' }
	},
	{
		name: 'bullet',
		kind: buildBulletDefaults<Row>(),
		props: { x: 'sector', y: 'valor', color: 'sector', target: 'valor', ranges: [100] }
	},
	{
		name: 'slope',
		kind: buildSlopeDefaults<Row>(),
		props: { x: 'anio', y: 'valor', color: 'sector' }
	},
	{
		name: 'sparkline',
		kind: buildSparklineDefaults<Row>(),
		props: { x: 'anio', y: 'valor', color: 'sector' }
	},
	{
		name: 'density',
		kind: buildDensityDefaults<Row>(),
		props: { x: 'valor', color: 'sector' }
	},
	{
		name: 'violin',
		kind: buildViolinDefaults<Row>(),
		props: { x: 'sector', y: 'valor', color: 'sector' }
	},
	{
		name: 'raincloud',
		kind: buildRaincloudDefaults<Row>(),
		props: { x: 'sector', y: 'valor', color: 'sector' }
	}
];

const FACETS: [string, FacetConfig<Row>][] = [
	['by, shared', { by: 'region' }],
	['by, free-y', { by: 'region', scales: 'free-y' }],
	['by, outer axes', { by: 'region', axes: 'outer' }],
	['rows x cols, free', { rows: 'region', cols: 'sector', scales: 'free' }],
	['rows x cols, free-x', { rows: 'region', cols: 'sector', scales: 'free-x' }]
];

/** Where one facet's rows sit, from a run of the data phases over only its rows - the way facets shared scales before one run served every panel. */
function perFacetValues(kind: Case['kind'], props: AxisPipelineProps<Row>) {
	const pipeline = Pipeline.ofAxisKind(kind);
	const scales = new ScalesPhase(kind.scales);
	return (rows: Row[]): SharedAxisValues => {
		const state = pipeline.runData(props, rows, undefined, null, DEFAULT_CONFIG) as never as {
			processedData: never;
			markers: never[];
			axes?: PlotAxes;
		};
		const values = (axis: 'x' | 'y') => [
			...ProcessedPositions.values(state.processedData, axis),
			...MarkerAxisValues.of(state.markers ?? [], axis)
		];
		return {
			x: values('x'),
			y: values('y'),
			band: [...(state.axes?.bands ?? [])],
			zero: scales.zeroAxes(state),
			dataOrder: scales.keepsDataOrder
		};
	};
}

/**
 * Each facet's shared x/y domains from a run per facet: a shared axis spans
 * every facet, a free one of a grid spans its column (x) or row (y), and a
 * free one of a wrapped facet has none.
 */
function perFacetShared(
	kind: Case['kind'],
	props: AxisPipelineProps<Row>,
	facet: FacetConfig<Row>
) {
	const panels = buildFacetPanels(facet, ROWS);
	const values = panels.map((panel) => perFacetValues(kind, props)(panel.rows));
	const mode = facet.scales ?? 'shared';
	const wrap = facet.by !== undefined;
	return (place: { row?: string; col?: string }) => {
		const out: Record<string, unknown> = {};
		for (const axis of ['x', 'y'] as const) {
			const free = mode === 'free' || mode === `free-${axis}`;
			if (free && wrap) continue;
			const line = axis === 'x' ? 'col' : 'row';
			const members = values.filter((_, i) => !free || panels[i][line] === place[line]);
			const scale = SharedScalesPhase.buildSharedAxisScale(members, axis);
			if (scale) out[axis] = scale;
		}
		return out;
	};
}

describe('shared scales from one run over every panel', () => {
	for (const c of CASES) {
		for (const [facetName, facet] of FACETS) {
			test(`${c.name}, ${facetName}: the same as one run per facet`, () => {
				const props = { ...c.props, data: ROWS, width: 400, height: 300 };
				const reference = perFacetShared(c.kind, props, facet);
				const { sharedScales } = Pipeline.ofAxisKind(c.kind).runData(
					props,
					ROWS,
					facet as never,
					null,
					DEFAULT_CONFIG
				) as { sharedScales: Record<string, { x?: unknown; y?: unknown }> };
				for (const panel of buildFacetPanels(facet, ROWS)) {
					const place = { row: panel.row, col: panel.col };
					const scales = sharedScales[panel.key];
					const positions = {
						...(scales?.x ? { x: scales.x } : {}),
						...(scales?.y ? { y: scales.y } : {})
					};
					expect(positions).toEqual(reference(place));
					if (facet.scales === undefined) expect(positions.x ?? positions.y).toBeDefined();
				}
			});
		}
	}
});
