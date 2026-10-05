import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY, type YearPoint } from '../../plots/line/data';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WEATHER_STATIONS, type WeatherStation } from '../../plots/geo/data';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import LinePlot from '$lib/plots/line/Plot.svelte';
import PeakMarker from '$lib/markers/PeakMarker.svelte';
import GeoPlot from '$lib/plots/geo/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Three marker kinds that need real series data (or real pointer
// interaction) to mean anything, so they don't fit the empty-canvas pattern
// the rest of `Markers/*` uses. `delta` is LinePlot's own kind-specific
// marker (`AxisBasedMarkersConfig` only) — see `Markers/Delta`
// for every axis/target combination. `peak` is a hand-authored `component`
// marker (`PeakMarker.svelte`) — see `PeakWithModeControl` below for it
// alongside `DotMarker`/`TextMarker` and segment-scoped examples. `hover`
// needs real points to crosshair over — see `Plots/*/Markers/Hover` for
// every plot kind's own flavor (dot+label, area highlight, etc.).

const meta = {
	title: 'Markers/Custom',
	component: LinePlot,
	tags: ['autodocs'],
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;

// Each story renders its own plot (the same marker works on any plot kind), so the
// host, its base args and its story type are declared per host below.
type LinePlotStory = StoryObj<typeof LinePlot>;
const renderLinePlot: LinePlotStory['render'] = (args) => ({ Component: LinePlot, props: args });
type GeoPlotStory = StoryObj<typeof GeoPlot>;
const renderGeoPlot: GeoPlotStory['render'] = (args) => ({ Component: GeoPlot, props: args });

const LINE_PLOT_ARGS = {
	width: 940,
	height: 400,
	series: [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY }]
} satisfies LinePlotStory['args'];
const GEO_PLOT_ARGS = {
	width: 940,
	height: 500,
	data: WORLD_COUNTRIES,
	coordinates: { projection: 'mercator' },
	styles: { fill: '#e2e8f0', stroke: '#94a3b8' }
} satisfies GeoPlotStory['args'];

/** A `delta` marker computes and labels the gap between a series and a fixed axis value, at one X. */
export const Delta: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [
			{
				type: 'delta',
				axis: 'x',
				at: 2018,
				from: { type: 'series', series: 'female' },
				to: { type: 'axis', value: 80 },
				text: { dx: 16, lineAnchor: 'middle' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `PeakMarker`, a `component` marker, finds and labels the series' own max point — `mode: 'min'` finds the lowest instead. */
export const Peak: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [
			{
				type: 'component',
				series: 'female',
				component: PeakMarker,
				props: { xProp: 'year', yProp: 'value', mode: 'max', label: 'Max' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A `hover` marker draws an in-SVG dot, value label, and crosshair rule at the nearest point as the cursor moves — no floating HTML tooltip involved. */
export const Hover: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `DotMarker` (the same component `Markers/Dot` uses) places a dot at every row's lon/lat — an alternative to the built-in `dot` marker type. */
export const ComponentOnMap: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: (d: WeatherStation) => d.lon,
				y: (d: WeatherStation) => d.lat,
				styles: { dotFill: '#0891b2', dotRadius: 6 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** `DotMarker` places a dot at every row's lon/lat — an alternative to the built-in `dot` marker type when you want the exact same component other plot kinds use. */
export const DotPerLocation: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: (d: WeatherStation) => d.lon,
				y: (d: WeatherStation) => d.lat,
				styles: { dotFill: '#0891b2', dotRadius: 6 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** `TextMarker` renders a label at every row's lon/lat — here, each station's city name above its position. */
export const TextPerLocation: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: (d: WeatherStation) => d.lon,
				y: (d: WeatherStation) => d.lat,
				styles: { dotFill: '#0891b2', dotRadius: 4 }
			},
			{
				type: 'text',
				data: WEATHER_STATIONS,
				x: (d: WeatherStation) => d.lon,
				y: (d: WeatherStation) => d.lat,
				text: (d: WeatherStation) => d.city,
				styles: { dy: -10, fontWeight: 'bold' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * DotMarker places a dot at every data point in the series.
 */
export const DotPerDataPoint: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
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
export const TextPerDataPoint: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
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
 * PeakMarker highlights the max or min value of the series — use the `mode`
 * control to switch between peak detection strategies.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PeakWithModeControl: any = {
	args: {
		width: 940,
		height: 400,
		mode: 'max',
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		]
	},
	argTypes: {
		mode: {
			description: 'Peak detection mode — finds the maximum or minimum value.',
			control: { type: 'inline-radio' },
			options: ['max', 'min']
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	render: ({ mode, ...args }: any) => ({
		Component: LinePlot,
		props: {
			...args,
			markers: [
				{
					type: 'component',
					series: 'female',
					component: PeakMarker,
					props: {
						yProp: 'value',
						xProp: 'year',
						mode,
						label: mode === 'max' ? 'Max' : 'Min'
					}
				}
			] satisfies AxisBasedMarkersConfig[]
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

/**
 * Marker strategies: series-level and segment-level peak detection.
 * - 🔵 series1: No peak marker
 * - 🟠 series2: Peak marker for entire series
 * - 🟢 series3: Peak marker per segment (strategy: `'segment'`)
 * - 🔴 series4: Peak marker for entire series despite multiple segments
 */
export const WithMarkerStrategies: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		series: [
			{ name: 'series1', x: 'year', y: 'value', data: SERIES1 },
			{ name: 'series2', x: 'year', y: 'value', data: SERIES2 },
			{ name: 'series3', x: 'year', y: 'value', data: SERIES3 },
			{ name: 'series4', x: 'year', y: 'value', data: SERIES4 }
		],
		segments: STRATEGIES_SEGMENTS,
		markers: [
			{
				type: 'component',
				series: 'series2',
				component: PeakMarker,
				props: {
					yProp: 'value',
					xProp: 'year',
					mode: 'max',
					label: 'Max'
				}
			},
			{
				type: 'component',
				series: 'series3',
				component: PeakMarker,
				scope: 'segment',
				props: {
					yProp: 'value',
					xProp: 'year',
					mode: 'max',
					label: 'Max'
				}
			},
			{
				type: 'component',
				series: 'series4',
				component: PeakMarker,
				scope: 'series',
				props: {
					yProp: 'value',
					xProp: 'year',
					mode: 'max',
					label: 'Max'
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
