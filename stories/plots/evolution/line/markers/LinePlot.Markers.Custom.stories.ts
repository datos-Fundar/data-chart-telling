import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { MarkerTransform } from '$lib/types/transforms';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE } from '$datasets';

type YearPoint = { year: number; value: number };

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Evolution/LinePlot/Markers/Custom',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 700, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		markers: {
			description: 'Marker annotations.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A dot and a label on a series' peak: a `selectMaxY` (or `selectMinY`)
 * transform keeps one row per series - or per segment, with `scope: 'segment'`.
 */
function peakMarkers(
	where: { series: string; scope?: 'series' | 'segment' },
	mode: 'max' | 'min' = 'max'
): AxisBasedMarkersConfig[] {
	const transforms: MarkerTransform[] = [{ type: mode === 'max' ? 'selectMaxY' : 'selectMinY' }];
	const common = { ...where, x: 'year', y: 'value', transforms };
	return [
		{ type: 'dot', ...common },
		{
			type: 'text',
			...common,
			text: mode === 'max' ? 'Max' : 'Min',
			styles: { fontWeight: 'bold', dy: -15 }
		}
	];
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * DotMarker places a dot at every data point in the series.
 */
export const WithDotMarker: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		],
		markers: [
			{
				type: 'dot',
				series: 'female',
				x: (d: YearPoint) => d.year,
				y: (d: YearPoint) => d.value
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * TextMarker renders a value label at every data point in the series.
 */
export const WithTextMarker: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		],
		markers: [
			{
				type: 'text',
				series: 'female',
				x: (d: YearPoint) => d.year,
				y: (d: YearPoint) => d.value,
				text: (d: YearPoint) => String(d.value),
				styles: {
					dy: -10
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * A `selectMaxY`/`selectMinY` transform on a `dot` and a `text` marker
 * highlights the max or min value of the series - use the `mode` control to
 * switch between them.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WithPeakMarker: any = {
	args: {
		width: 940,
		height: 400,
		mode: 'max',
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE
			}
		]
	},
	argTypes: {
		mode: {
			description: 'Peak detection mode - finds the maximum or minimum value.',
			control: { type: 'inline-radio' },
			options: ['max', 'min']
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	render: ({ mode, ...args }: any) => ({
		Component: LinePlot,
		props: {
			...args,
			markers: peakMarkers({ series: 'female' }, mode)
		}
	})
};

// ── WithMarkerStrategies data ──────────────────────────────────────────────────

const SERIES1: YearPoint[] = [
	{ year: 2018, value: 30 },
	{ year: 2019, value: 35 },
	{ year: 2020, value: 28 },
	{ year: 2021, value: 40 },
	{ year: 2022, value: 38 }
];

const SERIES2: YearPoint[] = [
	{ year: 2018, value: 50 },
	{ year: 2019, value: 55 },
	{ year: 2020, value: 48 },
	{ year: 2021, value: 65 },
	{ year: 2022, value: 62 }
];

const SERIES3: YearPoint[] = [
	{ year: 2018, value: 20 },
	{ year: 2019, value: 28 },
	{ year: 2020, value: 15 },
	{ year: 2021, value: 32 },
	{ year: 2022, value: 25 }
];

const SERIES4: YearPoint[] = [
	{ year: 2018, value: 60 },
	{ year: 2019, value: 70 },
	{ year: 2020, value: 45 },
	{ year: 2021, value: 58 },
	{ year: 2022, value: 68 }
];

const STRATEGIES_SEGMENTS: SegmentsConfig<LineSegmentStyle> = {
	series1: [{ styles: {} }],
	series2: [{ styles: {} }],
	series3: [
		{ areas: [{ x: { to: 2020 } }], styles: {} },
		{ areas: [{ x: { from: 2020 } }], styles: { stroke: { strokeDasharray: '6 4' } } }
	],
	series4: [
		{ areas: [{ x: { to: 2020 } }], styles: {} },
		{ areas: [{ x: { from: 2020 } }], styles: { stroke: { strokeDasharray: '6 4' } } }
	]
};

/** A bullet in the palette's `i`-th color, matching the series drawn in it. */
const swatch = (i: number) => `<span style="color: ${DEFAULT_CONFIG.palette[i]}">●</span>`;

export const WithMarkerStrategies: Story = {
	args: {
		series: [
			{ name: 'series1', x: 'year', y: 'value', data: SERIES1 },
			{ name: 'series2', x: 'year', y: 'value', data: SERIES2 },
			{ name: 'series3', x: 'year', y: 'value', data: SERIES3 },
			{ name: 'series4', x: 'year', y: 'value', data: SERIES4 }
		],
		segments: STRATEGIES_SEGMENTS,
		markers: [
			...peakMarkers({ series: 'series2' }),
			...peakMarkers({ series: 'series3', scope: 'segment' }),
			...peakMarkers({ series: 'series4', scope: 'series' })
		]
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Marker strategies: series-level and segment-level peak detection.',
					'',
					`- ${swatch(0)} series1: No peak marker`,
					`- ${swatch(1)} series2: Peak marker for entire series`,
					`- ${swatch(2)} series3: Peak marker per segment (\`scope: 'segment'\`)`,
					`- ${swatch(3)} series4: Peak marker for entire series despite multiple segments`
				].join('\n')
			}
		}
	}
};
