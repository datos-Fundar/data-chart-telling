import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WORLD_TEMPERATURE } from '../../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `contour` marker (svelteplot's own `Contour`) — marching-squares
// contour lines/bands spatially interpolated from a scalar field. Geo-only,
// so `GeoPlot` stands in for the empty canvas the rest of `Markers/*` uses.
// `equirectangular` specifically (not `mercator`) — svelteplot's `Contour`
// always interpolates over plain linear x/y, which only lines up with the
// coastlines under that one projection — see `Plots/GeoPlot/Markers/Contour`
// for `behind`/`clip`/filled-band variants.

const meta = {
	title: 'Markers/Geo/Contour',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'equirectangular' },
		styles: { fillOpacity: 0, stroke: '#94a3b8' }
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

/** `value` is the scalar field's own field key; `stroke: 'value'` maps each contour level through the plot's color scale. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'contour',
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				thresholds: 9,
				stroke: 'value',
				styles: { strokeWidth: 1.5, strokeOpacity: 0.8 }
			}
		] satisfies GeoMarkersConfig[]
	}
};
