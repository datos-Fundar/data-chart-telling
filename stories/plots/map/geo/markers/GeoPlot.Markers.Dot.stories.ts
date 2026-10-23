import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { countryPopulation } from '../channels';
import { WEATHER_STATIONS, type WeatherStation } from '$datasets';

// `x`/`y`/`value` below use the field-key shorthand (`'lon'` instead of
// `(d) => (d as WeatherStation).lon`) - see `DotMarkerConfig`'s own doc.

// ── Meta ──────────────────────────────────────────────────────────────────────
// `dot` places point markers by longitude/latitude - mirrors svelteplot's
// `dot/weather` example: one dot per weather station, sized/colored by
// temperature.

const meta = {
	title: 'Plots/Map/GeoPlot/Markers/Dot',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'mercator' },
		color: countryPopulation
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Basic dots - one fixed-size, fixed-color dot per weather station. */
export const Basic: Story = {
	args: {
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
		markers: [
			{ type: 'dot', data: WEATHER_STATIONS, x: 'lon', y: 'lat' }
		] satisfies GeoMarkersConfig[]
	}
};

/** Sized by value - `r` maps each station's temperature to the dot's radius, so hotter cities draw a bigger circle. */
export const SizedByTemperature: Story = {
	args: {
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: 'lon',
				y: 'lat',
				r: (d) => (d as WeatherStation).tempC,
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
export const ColoredByTemperature: Story = {
	args: {
		styles: { stroke: '#94a3b8' },
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: 'lon',
				y: 'lat',
				r: (d) => (d as WeatherStation).tempC,
				color: 'tempC',
				scales: { color: { scheme: ['#3b82f6', '#dc2626'] } },
				styles: { dotStroke: '#1e293b' }
			}
		] satisfies GeoMarkersConfig[]
	}
};
