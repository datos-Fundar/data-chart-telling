import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { Pipeline } from '$lib/phases/Pipeline';
import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
import { LegendState } from '$lib/layout/legend/LegendState.svelte';
import { buildLineDefaults } from '$lib/plots/evolution/line/defaults';
import { buildSlopeDefaults } from '$lib/plots/evolution/slope/defaults';
import { buildSparklineDefaults } from '$lib/plots/evolution/sparkline/defaults';
import { buildAreaDefaults } from '$lib/plots/evolution/area/defaults';
import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
import { buildBulletDefaults } from '$lib/plots/ranking/bullet/defaults';
import { buildPyramidDefaults } from '$lib/plots/distribution/pyramid/defaults';
import { buildHistogramDefaults } from '$lib/plots/distribution/histogram/defaults';
import { buildBoxDefaults } from '$lib/plots/distribution/box/defaults';
import { buildDensityDefaults } from '$lib/plots/distribution/density/defaults';
import { buildViolinDefaults } from '$lib/plots/distribution/violin/defaults';
import { buildHeatmapDefaults } from '$lib/plots/correlation/heatmap/defaults';
import { buildScatterDefaults } from '$lib/plots/correlation/scatter/defaults';
import { buildLollipopDefaults } from '$lib/plots/ranking/lollipop/defaults';
import { buildDumbbellDefaults } from '$lib/plots/ranking/dumbbell/defaults';
import { buildClevelandDefaults } from '$lib/plots/ranking/cleveland/defaults';
import { buildForestDefaults } from '$lib/plots/ranking/forest/defaults';
import { BasicStyles } from '$lib/layout/styles/BasicStyles';
import type { BasicStylesShape } from '$lib/types/layout/styles';
import type { DotMarkerConfig, RuleMarkerConfig } from '$lib/types/markers/common';

// `styles.stroke`, `styles.dot` and `styles.area` are the style every series is drawn with. Each plot
// kind says which of them its segment style is made of; a segment's own style wins over them, and a
// connector the author styles wins over `styles.stroke`.

type Row = Record<string, unknown>;

const AREA: BasicStylesShape = { flat: 'area' };
const LINE: BasicStylesShape = { nested: ['stroke', 'dot'] };

describe('what each plot kind makes its segment style of', () => {
	const kinds: [string, { data?: { segments?: { base?: BasicStylesShape } } }, BasicStylesShape][] =
		[
			['LinePlot', buildLineDefaults(), LINE],
			['SlopePlot', buildSlopeDefaults(), LINE],
			['SparklinePlot', buildSparklineDefaults(), LINE],
			['AreaPlot', buildAreaDefaults(), AREA],
			['BarPlot', buildBarDefaults(), AREA],
			['BulletPlot', buildBulletDefaults(), AREA],
			['PyramidPlot', buildPyramidDefaults(), AREA],
			['HistogramPlot', buildHistogramDefaults(), AREA],
			['BoxPlot', buildBoxDefaults(), AREA],
			['DensityPlot', buildDensityDefaults(), AREA],
			['ViolinPlot', buildViolinDefaults(), AREA],
			['HeatmapPlot', buildHeatmapDefaults(), AREA],
			['ScatterPlot', buildScatterDefaults(), { flat: 'dot' }],
			// The stem's stroke is read by the plot itself, under its connector.
			['LollipopPlot', buildLollipopDefaults(), { nested: ['dot'] }],
			['DumbbellPlot', buildDumbbellDefaults(), { nested: ['dot'] }],
			['ClevelandPlot', buildClevelandDefaults(), { nested: ['dot'] }],
			['ForestPlot', buildForestDefaults(), { nested: ['dot'] }]
		];

	test.each(kinds)('%s', (_name, defaults, shape) => {
		expect(defaults.data?.segments?.base).toEqual(shape);
	});
});

describe('BasicStyles.of', () => {
	test('is nothing without a style the shape is made of', () => {
		expect(BasicStyles.of({ area: { fill: 'red' } }, LINE)).toBeUndefined();
		expect(BasicStyles.of({ stroke: { strokeWidth: 2 } }, undefined)).toBeUndefined();
		expect(BasicStyles.of(undefined, LINE)).toBeUndefined();
	});

	test('nests each style under its own name, or is the style itself', () => {
		const styles = { stroke: { strokeWidth: 2 }, dot: { dotRadius: 3 }, area: { fill: 'red' } };
		expect(BasicStyles.of(styles, LINE)?.('a')).toEqual({
			stroke: { strokeWidth: 2 },
			dot: { dotRadius: 3 }
		});
		expect(BasicStyles.of(styles, AREA)?.('a')).toEqual({ fill: 'red' });
		expect(BasicStyles.of(styles, { flat: 'dot' })?.('a')).toEqual({ dotRadius: 3 });
	});

	test('asks a function of the series for its own style, and drops what it leaves unset', () => {
		const of = BasicStyles.of(
			{ stroke: (name: string) => (name === 'b' ? { strokeWidth: 5 } : undefined) },
			LINE
		);
		expect(of?.('a')).toBeUndefined();
		expect(of?.('b')).toEqual({ stroke: { strokeWidth: 5 } });
	});

	test('a function has nothing to say without a series', () => {
		expect(BasicStyles.read(() => ({ strokeWidth: 5 }), undefined)).toBeUndefined();
		expect(BasicStyles.read({ strokeWidth: 5 }, undefined)).toEqual({ strokeWidth: 5 });
	});
});

/** A plot kind's own marks and processed groups, from running its whole pipeline over `props`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Defaults = any;

function run(defaults: Defaults, props: Row, legend: LegendState | null = null) {
	const interaction = new PlotInteraction(() => DEFAULT_CONFIG, { legend });
	return Pipeline.ofAxisKind(defaults).run(
		{ width: 400, height: 300, scales: {}, segments: {}, markers: [], ...props },
		{ cfg: DEFAULT_CONFIG, interaction }
	) as {
		markers: { type: string; styles?: Row }[];
		processedGroups: { series: { name: string }; visualSegments: { styles: Row }[] }[];
	};
}

const lineRows = ['a', 'b'].flatMap((g) => [1, 2, 3].map((x) => ({ x, y: x * 2, g })));

describe('styles on the plots whose segments are made of them', () => {
	test('a line takes stroke and dot, a function setting one series apart', () => {
		const { processedGroups } = run(buildLineDefaults(), {
			data: lineRows,
			x: 'x',
			y: 'y',
			color: 'g',
			styles: {
				stroke: (name: string) => (name === 'b' ? { strokeWidth: 8 } : { strokeWidth: 2 }),
				dot: { dotRadius: 3 }
			}
		});
		const [a, b] = processedGroups.map((g) => g.visualSegments[0].styles);
		expect(a).toEqual({ stroke: { strokeWidth: 2 }, dot: { dotRadius: 3 } });
		expect(b).toEqual({ stroke: { strokeWidth: 8 }, dot: { dotRadius: 3 } });
	});

	test('a segment wins over them, field by field', () => {
		const { processedGroups } = run(buildLineDefaults(), {
			data: lineRows,
			x: 'x',
			y: 'y',
			color: 'g',
			styles: { stroke: { strokeWidth: 8, strokeOpacity: 0.5 } },
			segments: { a: [{ styles: { stroke: { strokeWidth: 1 } } }] }
		});
		const [a, b] = processedGroups.map((g) => g.visualSegments[0].styles);
		expect(a).toEqual({ stroke: { strokeWidth: 1, strokeOpacity: 0.5 } });
		expect(b).toEqual({ stroke: { strokeWidth: 8, strokeOpacity: 0.5 } });
	});

	test.each([
		['an area', buildAreaDefaults()],
		['a bar', buildBarDefaults()],
		['a bullet', buildBulletDefaults()]
	])('%s takes the area', (_name, defaults) => {
		const { processedGroups } = run(defaults, {
			data: lineRows,
			x: 'x',
			y: 'y',
			color: 'g',
			styles: {
				area: (name: string) => (name === 'b' ? { fillOpacity: 0.3 } : { fillOpacity: 1 })
			},
			segments: { b: [{ styles: { stroke: 'red' } }] }
		});
		const [a, b] = processedGroups.map((g) => g.visualSegments[0].styles);
		expect(a).toMatchObject({ fillOpacity: 1 });
		expect(b).toMatchObject({ fillOpacity: 0.3, stroke: 'red' });
	});

	test('a scatter takes the dot', () => {
		const { processedGroups } = run(buildScatterDefaults(), {
			data: lineRows,
			x: 'x',
			y: 'y',
			color: 'g',
			styles: { dot: { dotRadius: 7 } }
		});
		expect(processedGroups[0].visualSegments[0].styles).toEqual({ dotRadius: 7 });
	});

	test('a style the plot is not made of is left out', () => {
		const { processedGroups } = run(buildBarDefaults(), {
			data: lineRows,
			x: 'x',
			y: 'y',
			color: 'g',
			styles: { stroke: { strokeWidth: 9 }, dot: { dotRadius: 9 } }
		});
		expect(processedGroups[0].visualSegments[0].styles).toEqual({});
	});

	test('a slope and a sparkline take them as a line does', () => {
		for (const defaults of [buildSlopeDefaults(), buildSparklineDefaults()]) {
			const { processedGroups } = run(defaults, {
				data: lineRows.filter((r) => r.x < 3),
				x: 'x',
				y: 'y',
				color: 'g',
				styles: { stroke: { strokeWidth: 6 } }
			});
			expect(processedGroups[0].visualSegments[0].styles).toMatchObject({
				stroke: { strokeWidth: 6 }
			});
		}
	});
});

describe('styles on the plots with connectors', () => {
	const rows = ['a', 'b'].flatMap((c, i) =>
		[1, 2].map((v) => ({ c: `${c}${v}`, v: v + i, g: i ? 'B' : 'A' }))
	);
	const stems = (defaults: Defaults, props: Row) => {
		const { markers } = run(defaults, { data: rows, x: 'c', y: 'v', color: 'g', ...props });
		return {
			stems: (markers.find((m): m is RuleMarkerConfig => m.type === 'rule')?.data ?? []) as Row[],
			dots: markers.filter((m): m is DotMarkerConfig => m.type === 'dot')
		};
	};

	test('styles.stroke styles every stem, a function of the series styling its own', () => {
		const { stems: drawn } = stems(buildLollipopDefaults(), {
			styles: { stroke: (name: string) => (name === 'B' ? { strokeWidth: 9 } : { strokeWidth: 2 }) }
		});
		expect(drawn.map((s) => s.strokeWidth)).toEqual([2, 2, 9, 9]);
	});

	test('keeps each stem the color of its series unless the style sets one', () => {
		const plain = stems(buildLollipopDefaults(), { styles: { stroke: { strokeWidth: 2 } } });
		const colored = stems(buildLollipopDefaults(), { styles: { stroke: { stroke: 'red' } } });
		expect(plain.stems[0].stroke).not.toBe(plain.stems[2].stroke);
		expect(colored.stems.map((s) => s.stroke)).toEqual(['red', 'red', 'red', 'red']);
	});

	test('styles.connector wins over it', () => {
		const { stems: drawn } = stems(buildLollipopDefaults(), {
			styles: {
				stroke: { strokeWidth: 2, strokeOpacity: 0.4, stroke: 'blue' },
				connector: { width: 7, color: 'green' }
			}
		});
		expect(drawn.every((s) => s.strokeWidth === 7)).toBe(true);
		expect(drawn.every((s) => s.stroke === 'green')).toBe(true);
		// What the connector leaves unset still comes from it.
		expect(drawn.every((s) => s.strokeOpacity === 0.4)).toBe(true);
	});

	test('a segment wins over styles.connector, as before', () => {
		const { stems: drawn } = stems(buildLollipopDefaults(), {
			styles: { stroke: { strokeWidth: 2 }, connector: { width: 7 } },
			segments: { A: [{ styles: { stroke: { strokeWidth: 4 } } }] }
		});
		expect(drawn.map((s) => s.strokeWidth)).toEqual([4, 4, 7, 7]);
	});

	test('a connector of several dots takes a style as it is, not a function of a series', () => {
		const rowsTwo = ['x', 'y'].flatMap((c) => ['A', 'B'].map((g, i) => ({ c, v: i + 1, g })));
		const run2 = (stroke: unknown) =>
			(run(buildDumbbellDefaults(), {
				data: rowsTwo,
				x: 'c',
				y: 'v',
				color: 'g',
				styles: { stroke }
			}).markers.find((m): m is RuleMarkerConfig => m.type === 'rule')?.data ?? []) as Row[];
		expect(run2({ strokeWidth: 6 }).every((s) => s.strokeWidth === 6)).toBe(true);
		expect(run2(() => ({ strokeWidth: 6 })).every((s) => s.strokeWidth === 6)).toBe(false);
	});

	describe('dashes and caps', () => {
		const patterns = (defaults: Defaults, props: Row) =>
			run(defaults, { data: rows, x: 'c', y: 'v', color: 'g', ...props })
				.markers.filter((m): m is RuleMarkerConfig => m.type === 'rule')
				.map((m) => m.styles ?? {});

		test('styles.stroke draws every connector dashed and capped', () => {
			expect(
				patterns(buildLollipopDefaults(), {
					styles: {
						stroke: { strokeDasharray: '4 4', strokeLinecap: 'round', strokeLinejoin: 'bevel' }
					}
				})
			).toEqual([{ strokeDasharray: '4 4', strokeLinecap: 'round', strokeLinejoin: 'bevel' }]);
		});

		test('a connector with none of them sets no pattern', () => {
			expect(patterns(buildLollipopDefaults(), { styles: { stroke: { strokeWidth: 3 } } })).toEqual(
				[{}]
			);
		});

		test('a function of the series gives each its own, one marker per pattern', () => {
			expect(
				patterns(buildLollipopDefaults(), {
					styles: {
						stroke: (name: string) =>
							name === 'B' ? { strokeDasharray: '2 2' } : { strokeLinecap: 'round' }
					}
				})
			).toEqual([{ strokeLinecap: 'round' }, { strokeDasharray: '2 2' }]);
		});

		test('a segment wins over it, field by field', () => {
			expect(
				patterns(buildLollipopDefaults(), {
					styles: { stroke: { strokeDasharray: '4 4', strokeLinecap: 'round' } },
					segments: { A: [{ styles: { stroke: { strokeDasharray: '1 1' } } }] }
				})
			).toEqual([
				{ strokeDasharray: '1 1', strokeLinecap: 'round' },
				{ strokeDasharray: '4 4', strokeLinecap: 'round' }
			]);
		});

		test('the arrows of a connector take them too', () => {
			const { markers } = run(buildDumbbellDefaults(), {
				data: ['x', 'y'].flatMap((c) => ['A', 'B'].map((g, i) => ({ c, v: i + 1, g }))),
				x: 'c',
				y: 'v',
				color: 'g',
				styles: {
					connector: { arrow: true },
					stroke: { strokeDasharray: '3 3', strokeLinecap: 'round' }
				}
			});
			const arrow = markers.find((m) => m.type === 'arrow') as { styles?: Row } | undefined;
			expect(arrow?.styles).toEqual({ strokeDasharray: '3 3', strokeLinecap: 'round' });
		});
	});

	test('styles.dot styles the dots, a segment winning over it', () => {
		const { dots } = stems(buildLollipopDefaults(), {
			styles: { dot: { dotRadius: 9 } },
			segments: { A: [{ styles: { dot: { dotRadius: 3 } } }] }
		});
		const radius = (series: string) => dots.find((d) => d.series === series)?.styles?.dotRadius;
		expect(radius('A')).toBe(3);
		expect(radius('B')).toBe(9);
	});
});

describe('the area of the plots that draw it', () => {
	const OUTLINE = {
		stroke: 'red',
		strokeWidth: 2,
		strokeOpacity: 0.8,
		strokeDasharray: '3 2',
		borderRadius: 4
	};
	const bars = lineRows.map((r) => ({ c: `c${r.x}`, v: r.y, g: r.g }));
	const outlineOf = (styles: Row | undefined) => ({
		stroke: styles?.stroke,
		strokeWidth: styles?.strokeWidth,
		strokeOpacity: styles?.strokeOpacity,
		strokeDasharray: styles?.strokeDasharray
	});

	test.each([
		['a bar', buildBarDefaults(), 'bar', { data: bars, x: 'c', y: 'v', color: 'g' }],
		[
			'a bullet',
			buildBulletDefaults(),
			'bar',
			{ data: bars, x: 'c', y: 'v', color: 'g', target: 3, ranges: [4, 8] }
		],
		['a pyramid', buildPyramidDefaults(), 'bar', { data: bars, x: 'v', y: 'c', color: 'g' }],
		['a histogram', buildHistogramDefaults(), 'rect', { data: lineRows, x: 'y', grouping: 'g' }]
	])('%s draws the outline of its area', (_name, defaults, type, props) => {
		const { markers } = run(defaults, { ...props, styles: { area: OUTLINE } });
		const drawn = markers.filter((m) => m.type === type && m.styles?.stroke !== undefined);
		expect(drawn.length).toBeGreaterThan(0);
		for (const marker of drawn) {
			expect(outlineOf(marker.styles)).toEqual({
				stroke: 'red',
				strokeWidth: 2,
				strokeOpacity: 0.8,
				strokeDasharray: '3 2'
			});
		}
	});

	test('a bar fades its outline with its fill when the legend dims its series', () => {
		const legend = new LegendState();
		legend.turnOff('b', { mode: 'dim' });
		const { markers } = run(
			buildBarDefaults(),
			{ data: bars, x: 'c', y: 'v', color: 'g', styles: { area: OUTLINE } },
			legend
		);
		const dimmed = DEFAULT_CONFIG.legend.disabledOpacity;
		const opacities = markers.filter((m) => m.type === 'bar').map((m) => m.styles?.strokeOpacity);
		expect(opacities).toContain(dimmed);
		expect(opacities).toContain(0.8);
	});

	test('a heatmap draws every cell with it, under its segments', () => {
		const cells = ['a', 'b'].flatMap((x) =>
			['p', 'q'].map((y, i) => ({ x, y, v: i + 1, g: 'one' }))
		);
		const { markers } = run(buildHeatmapDefaults(), {
			data: cells,
			x: 'x',
			y: 'y',
			color: 'v',
			styles: { area: { fillOpacity: 0.4, stroke: 'white', strokeWidth: 3 } },
			segments: { default: [{ areas: [{ x: { from: 'b' } }], styles: { fillOpacity: 0.9 } }] }
		});
		const opacities = markers.filter((m) => m.type === 'cell').map((m) => m.styles?.fillOpacity);
		expect(new Set(opacities)).toEqual(new Set([0.4, 0.9]));
		for (const m of markers.filter((m) => m.type === 'cell')) {
			expect(m.styles).toMatchObject({ stroke: 'white', strokeWidth: 3 });
		}
	});
});
