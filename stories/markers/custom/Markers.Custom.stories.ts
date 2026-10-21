import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY, type YearPoint } from '../../plots/evolution/line/data';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WEATHER_STATIONS, type WeatherStation } from '../../plots/map/geo/data';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Marker kinds that need real series data (or real pointer interaction) to
// mean anything, so they don't fit the empty-canvas pattern the rest of
// `Markers/*` uses. `delta` is LinePlot's own kind-specific marker
// (`AxisBasedMarkersConfig` only) - see `Markers/Delta` for every axis/target
// combination. `hover` needs real points to crosshair over - see
// `Plots/*/Markers/Hover` for every plot kind's own flavor (dot+label, area
// highlight, etc.).

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

/** A `hover` marker draws an in-SVG dot, value label, and crosshair rule at the nearest point as the cursor moves - no floating HTML tooltip involved. */
export const Hover: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `DotMarker` (the same component `Markers/Dot` uses) places a dot at every row's lon/lat - an alternative to the built-in `dot` marker type. */
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

/** `DotMarker` places a dot at every row's lon/lat - an alternative to the built-in `dot` marker type when you want the exact same component other plot kinds use. */
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

/** `TextMarker` renders a label at every row's lon/lat - here, each station's city name above its position. */
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
