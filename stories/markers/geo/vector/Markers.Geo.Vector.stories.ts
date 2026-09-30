import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, POPULATION_SHIFT } from '../../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `vector` marker (svelteplot's own `Vector`) — an arrow/spike per row,
// sized by `length` and oriented by `rotate`. Geo-only, so `GeoPlot` stands
// in for the empty canvas the rest of `Markers/*` uses — see
// `Plots/GeoPlot/Markers/Vector` for every `shape` variant.

const meta = {
	title: 'Markers/Geo/Vector',
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

/** `length`/`rotate` accessors size/orient each arrow from the row's own magnitude/direction fields. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'vector',
				data: POPULATION_SHIFT,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction'
			}
		] satisfies GeoMarkersConfig[]
	}
};
