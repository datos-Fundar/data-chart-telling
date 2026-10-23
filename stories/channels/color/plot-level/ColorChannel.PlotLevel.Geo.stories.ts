import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from '$datasets/argentina-provinces';
import { provincePopulation } from '../../../plots/map/geo/channels';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Same channel, different plot kind - GeoPlot has no x/y axis pair, but
// `color` + `scales.color` drive its default choropleth fill exactly the same
// way they drive HeatmapPlot's cells. See `Plots/GeoPlot/Styles` for the full
// set of ramp options.

const meta = {
	title: 'Channels/Color/Plot Level/Geo',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: ARGENTINA_PROVINCES,
		featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
		coordinates: { projection: { type: argentinaBicontinental } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `color` feeds each feature's population into the plot's own `scales.color`
 * ramp - no marker config needed, since GeoPlot's default `'geo'` marker
 * reads the plot-level channel automatically.
 */
export const Default: Story = {
	args: {
		color: provincePopulation
	}
};

/** `scales.color.scheme` swaps the ramp's colors without touching `color` itself. */
export const CustomScheme: Story = {
	args: {
		color: provincePopulation,
		scales: {
			color: {
				scheme: 'viridis'
			}
		}
	}
};
