import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '../../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `graticule` marker (svelteplot's own `Graticule`) — lon/lat gridlines
// drawn over the base map. Geo-only, so `GeoPlot` + `WORLD_COUNTRIES` stand
// in for the empty canvas the rest of `Markers/*` uses — see
// `Plots/GeoPlot/Markers/Graticule` for it paired with `sphere` on an
// orthographic globe.

const meta = {
	title: 'Markers/Geo/Graticule',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES
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

/** Default 10° step lon/lat gridlines. */
export const Basic: Story = {
	args: {
		markers: [{ type: 'graticule' }] satisfies GeoMarkersConfig[]
	}
};

/** `step` widens the grid; `styles` (a `StrokeStyle`) lightens and dashes it. */
export const CustomStyle: Story = {
	args: {
		markers: [
			{
				type: 'graticule',
				step: 20,
				styles: { stroke: '#94a3b8', strokeOpacity: 0.5, strokeDasharray: '2 2' }
			}
		] satisfies GeoMarkersConfig[]
	}
};
