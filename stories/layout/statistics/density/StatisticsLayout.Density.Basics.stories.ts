import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import { COUNTRIES } from '../../../plots/correlation/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `statistics: [{ type: 'density' }]` is a 1D kernel density over the plot's
// `x` values (svelteplot's own `densityX` transform), drawn as an `area`
// marker: the curve's `x` is the value, its `y` the density. The density axis
// shares the plot's `y` scale, so the host here plots every row at `y = 0` -
// a rug along the baseline that the density curve rises above.

const rugData = COUNTRIES.map((d) => ({ ...d, rug: 0 }));

const meta = {
	title: 'Layout/Statistics/Density/Basics',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 360,
		data: rugData,
		x: 'lifeExpectancy',
		y: 'rug'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Gaussian kernel over country life expectancy, bandwidth picked by svelteplot from the data. */
export const Default: Story = {
	args: {
		statistics: [{ type: 'density' }]
	}
};

/** A narrower `bandwidth` and an `epanechnikov` kernel give a tighter, more detailed curve. */
export const KernelAndBandwidth: Story = {
	args: {
		statistics: [{ type: 'density', kernel: 'epanechnikov', bandwidth: 1.5 }]
	}
};

/** `styles.fill` and `styles.stroke` recolor the area; when `stroke` is unset it falls back to the source series' own color. */
export const CustomStyle: Story = {
	args: {
		statistics: [
			{
				type: 'density',
				bandwidth: 2,
				styles: { fill: '#7c3aed', fillOpacity: 0.25, stroke: '#7c3aed', strokeWidth: 2 }
			}
		]
	}
};

/** Per-region densities: `color` splits the rows into series, and the statistic follows that grouping, drawing one curve per region in that region's color. */
export const PerRegion: Story = {
	args: {
		color: 'region',
		statistics: [{ type: 'density', bandwidth: 2, styles: { fillOpacity: 0.15 } }]
	}
};
