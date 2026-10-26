import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import type { RaincloudPlotStylesConfig } from '$lib/types/plots/distribution/raincloud/props';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles` sets how each cloud is estimated (`kernel`, `bandwidth`, `trim`) and
// scaled (`scale`), as on a violin plot.

const meta = {
	title: 'Plots/Distribution/RaincloudPlot/Estimate',
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

/** Silverman's rule picks each cloud's bandwidth from its own values. */
export const Default: Story = {};

/** A small `bandwidth` follows the values closely, leaving a bump for each cluster of dots. */
export const NarrowBandwidth: Story = {
	args: {
		styles: { bandwidth: 0.1 } satisfies RaincloudPlotStylesConfig
	}
};

/** A large `bandwidth` smooths every cloud into one broad shape. */
export const WideBandwidth: Story = {
	args: {
		styles: { bandwidth: 1 } satisfies RaincloudPlotStylesConfig
	}
};

/** `trim: false` lets each cloud's tails fade out past its lowest and highest values. */
export const Untrimmed: Story = {
	args: {
		styles: { trim: false } satisfies RaincloudPlotStylesConfig
	}
};

/** `scale: 'shared'` draws every cloud on one density scale, so a cloud with its values packed together is wider than a spread one. */
export const SharedScale: Story = {
	args: {
		styles: { scale: 'shared' } satisfies RaincloudPlotStylesConfig
	}
};
