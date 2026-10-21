import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WEATHER_STATIONS } from '../../../plots/map/geo/data';
import { countryPopulation } from '../../../plots/map/geo/channels';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `dot` marker's own `color` + `scales.color` is independent of the plot's
// own channel (see `Channels/Color/Plot Level`) - it reads its own accessor
// and, when it sets no `scales` of its own, falls back to the plot's own
// ramp (see `Channels/Color/Independent Ramps`' `Default` story). Here the
// base map carries no color channel at all; only the weather-station dot
// markers (colored by temperature) do.

const meta = {
	title: 'Channels/Color/Marker Level/Dot',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'mercator' },
		color: countryPopulation,
		styles: { stroke: '#94a3b8' }
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

/**
 * The `dot` marker's own `color: 'tempC'` accessor drives its fill - the
 * default palette's own continuous ramp, since the marker sets no `scales`
 * of its own.
 */
export const Default: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: 'lon',
				y: 'lat',
				r: 8,
				color: 'tempC',
				styles: { dotStroke: '#1e293b' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** The marker's own `scales.color.scheme` swaps its ramp, independent of the plot's own (unset here). */
export const CustomScheme: Story = {
	args: {
		markers: [
			{
				type: 'dot',
				data: WEATHER_STATIONS,
				x: 'lon',
				y: 'lat',
				r: 8,
				color: 'tempC',
				scales: { color: { scheme: 'inferno' } },
				styles: { dotStroke: '#1e293b' }
			}
		] satisfies GeoMarkersConfig[]
	}
};
