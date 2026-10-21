import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WEATHER_STATIONS, type WeatherStation } from '../../plots/map/geo/data';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `dot` marker (svelteplot's own `Dot`) - one point mark per row of its own
// `data`, independent of any plot series. Demoed on an empty `LinePlot`
// canvas (no data of its own, just an explicit `scales` domain) so only the
// marker itself is on screen - see `Plots/*/Markers` for markers used
// alongside real chart data.

const meta = {
	title: 'Markers/Dot',
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
	height: 460,
	data: [],
	x: 'x',
	y: 'y',
	scales: { x: { domain: [0, 10] }, y: { domain: [0, 10] } }
} satisfies LinePlotStory['args'];
const GEO_PLOT_ARGS = {
	width: 940,
	height: 500,
	data: WORLD_COUNTRIES,
	coordinates: { projection: 'mercator' }
} satisfies GeoPlotStory['args'];

const POINTS = [
	{ x: 2, y: 3 },
	{ x: 5, y: 7 },
	{ x: 8, y: 4 }
];

/** `data` drives one dot per row; `x`/`y` are field-key accessors, `r` a fixed radius. */
export const Basic: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [
			{ type: 'dot', data: POINTS, x: 'x', y: 'y', r: 8 }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `symbol` varies the point shape per row, cycling svelteplot's own default shape sequence. */
export const Symbols: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [
			{
				type: 'dot',
				data: [
					{ x: 2, y: 3, kind: 'a' },
					{ x: 5, y: 7, kind: 'b' },
					{ x: 8, y: 4, kind: 'c' }
				],
				x: 'x',
				y: 'y',
				r: 10,
				symbol: 'kind',
				styles: { dotFill: '#7c3aed' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `styles` fixes fill/stroke for every row, overriding the plot's own default color. */
export const CustomStyle: LinePlotStory = {
	render: renderLinePlot,
	args: {
		...LINE_PLOT_ARGS,
		markers: [
			{
				type: 'dot',
				data: POINTS,
				x: 'x',
				y: 'y',
				r: 10,
				styles: { dotFill: '#7c3aed', dotStroke: '#4c1d95', dotStrokeWidth: 2 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** Basic dots - one fixed-size, fixed-color dot per weather station. */
export const OnMap: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
		markers: [
			{ type: 'dot', data: WEATHER_STATIONS, x: 'lon', y: 'lat' }
		] satisfies GeoMarkersConfig[]
	}
};

/** Sized by value - `r` maps each station's temperature to the dot's radius, so hotter cities draw a bigger circle. */
export const SizedByTemperature: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: 'lon',
				y: 'lat',
				r: (d) => (d as WeatherStation).tempC / 2,
				styles: { dotFill: '#f97316', dotFillOpacity: 0.7, dotStroke: '#c2410c' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Colored by value - the marker's own `color` channel drives a ramp
 * (`scales.color`, its own independent ramp - not shared with the base
 * map's choropleth) so each dot's fill reflects its station's temperature,
 * mirroring `dot/weather`'s color-by-temperature encoding.
 */
export const ColoredByTemperature: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		styles: { fillOpacity: 0.3, stroke: '#94a3b8' },
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: 'lon',
				y: 'lat',
				r: 8,
				color: 'tempC',
				scales: { color: { scheme: ['#3b82f6', '#dc2626'] } },
				styles: { dotStroke: '#1e293b' }
			}
		] satisfies GeoMarkersConfig[]
	}
};
