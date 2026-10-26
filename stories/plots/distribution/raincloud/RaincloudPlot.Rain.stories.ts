import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import type { RaincloudPlotStylesConfig } from '$lib/types/plots/distribution/raincloud/props';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.rain` sets the dots, one per value: their radius (`r`) and opacity.
// `false` leaves them out. A `jitterX` (or `jitterY`) in `transforms` sets how
// they scatter across the band: its `seed`, `distribution` and `width`, in
// bands.

const meta = {
	title: 'Plots/Distribution/RaincloudPlot/Rain',
	component: RaincloudPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'sepalLength'
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 500, step: 50 }
		},
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'RaincloudPlot' } }
	}
} satisfies Meta<typeof RaincloudPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Bigger, fainter dots. */
export const Dots: Story = {
	args: {
		styles: { rain: { r: 4, opacity: 0.4 } } satisfies RaincloudPlotStylesConfig
	}
};

/** Another `seed` scatters the dots differently, the same way on every render. */
export const Seed: Story = {
	args: {
		transforms: [{ type: 'jitterX', seed: 7 }]
	}
};

/** A `normal` jitter gathers the dots toward the middle of their stretch. */
export const NormalJitter: Story = {
	args: {
		transforms: [{ type: 'jitterX', distribution: 'normal', std: 0.06 }]
	}
};

/** `rain: false` leaves the dots out: half violins with a box. */
export const None: Story = {
	args: {
		styles: { rain: false, box: { position: 'cloud' } } satisfies RaincloudPlotStylesConfig
	}
};
