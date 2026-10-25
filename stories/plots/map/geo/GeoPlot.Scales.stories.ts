import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoScalesConfig, CoordinatesConfig } from '$lib/types/layout/coordinates';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { countryPopulation } from './channels';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `scales.color` configures the choropleth colour domain - the only scale a
// map has, since there's no x/y axis pair (see Coordinates for the
// projection stories, which used to live here before the coordinate system
// was split out into its own `coordinates` prop).

const meta = {
	title: 'Plots/Map/GeoPlot/Scales',
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
		scales: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Continuous color domain - `scales.color.domain` pins the choropleth ramp
 * to a fixed `[min, max]` range instead of auto-fitting to the visible
 * data's min/max (mirrors HeatmapPlot's `scales.color.domain`). Paired with a
 * `color` accessor (see the `Series` stories) so every country's estimated
 * population maps through the same fixed ramp.
 */
export const ExplicitColorDomain: Story = {
	args: {
		color: countryPopulation,
		scales: {
			color: { domain: [1_000_000, 1_400_000_000] }
		} satisfies GeoScalesConfig,
		coordinates: {
			projection: 'equal-earth'
		} satisfies CoordinatesConfig
	}
};
