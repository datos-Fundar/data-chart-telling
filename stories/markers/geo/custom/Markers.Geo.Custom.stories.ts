import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import DotMarker from '$lib/markers/DotMarker.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WEATHER_STATIONS, type WeatherStation } from '../../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `geo-component` marker mounts an arbitrary Svelte component as a mark —
// the geo analog of the axis-based `component` (see `Markers/Custom`'s own
// `Peak` story). The same generic mark components other plot kinds already
// use work here too: their `x`/`y` accessors just receive longitude/latitude
// instead of a linear axis value. See `Plots/GeoPlot/Markers/Custom` for
// `TextMarker` layered alongside it.

const meta = {
	title: 'Markers/Geo/Custom',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'mercator' },
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' }
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

/** `DotMarker` (the same component `Markers/Dot` uses) places a dot at every row's lon/lat — an alternative to the built-in `dot` marker type. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'geo-component',
				component: DotMarker,
				data: WEATHER_STATIONS,
				props: {
					x: (d: WeatherStation) => d.lon,
					y: (d: WeatherStation) => d.lat,
					styles: { dotFill: '#0891b2', dotRadius: 6 }
				}
			}
		] satisfies GeoMarkersConfig[]
	}
};
