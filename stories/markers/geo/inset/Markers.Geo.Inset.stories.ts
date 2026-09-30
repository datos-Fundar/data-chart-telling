import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, type WorldCountryProps } from '../../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An `inset` marker — a small, independently-projected map panel anchored
// to a corner/edge of the plot, showing a filtered subset of the plot's own
// `data` at a different scale. Geo-only, so `GeoPlot` stands in for the
// empty canvas the rest of `Markers/*` uses — see `Plots/GeoPlot/Markers/Inset`
// for an explicit separate `data` dataset and split-geometry examples.

const meta = {
	title: 'Markers/Geo/Inset',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		featureId: (f) => (f.properties as WorldCountryProps).name
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

/** `location` anchors the inset to a corner/edge; `features` filters the plot's own `data` down to just the named feature, matched by `featureId`. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'inset',
				location: 'bottom-left',
				features: ['Argentina'],
				styles: { fill: '#7c3aed' }
			}
		] satisfies GeoMarkersConfig[]
	}
};
