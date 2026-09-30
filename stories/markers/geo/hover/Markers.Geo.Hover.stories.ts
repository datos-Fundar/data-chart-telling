import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '../../../plots/geo/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `geo-hover` marker — the in-map hover highlight, restyling whichever
// feature is under the cursor. Its own `type: 'geo-hover'` tag (rather than
// the axis-based plots' `'hover'`) keeps the two config shapes unambiguous.
// Needs real distinct features to hover between, which `WORLD_COUNTRIES`
// already provides — see `Plots/GeoPlot/Markers/Hover` for more style
// variants.

const meta = {
	title: 'Markers/Geo/Hover',
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

/** Hover a country — it gets a neutral translucent fill (the shared `hover.area` theme default). Matching follows the browser's own SVG hit-testing. */
export const Basic: Story = {
	args: {
		markers: [{ type: 'geo-hover' }] satisfies GeoMarkersConfig[]
	}
};
