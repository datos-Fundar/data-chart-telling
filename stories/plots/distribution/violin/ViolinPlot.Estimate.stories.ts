import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ViolinPlot from '$lib/plots/distribution/violin/Plot.svelte';
import type { ViolinPlotStylesConfig } from '$lib/types/plots/distribution/violin/props';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles` sets how each violin is estimated (`kernel`, `bandwidth`, `trim`) and
// drawn (`scale`, `box`).

const meta = {
	title: 'Plots/Distribution/ViolinPlot/Estimate',
	component: ViolinPlot,
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
		docs: { source: { name: 'ViolinPlot' } }
	}
} satisfies Meta<typeof ViolinPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Silverman's rule picks each violin's bandwidth from its own values. */
export const Default: Story = {};

/** A small `bandwidth` follows the values closely, leaving a bump for each cluster. */
export const NarrowBandwidth: Story = {
	args: {
		styles: { bandwidth: 0.1 } satisfies ViolinPlotStylesConfig
	}
};

/** A large `bandwidth` smooths every violin into one broad shape. */
export const WideBandwidth: Story = {
	args: {
		styles: { bandwidth: 1 } satisfies ViolinPlotStylesConfig
	}
};

/** `scale: 'shared'` draws every violin on one density scale, so a violin with its values packed together is wider than a spread one. */
export const SharedScale: Story = {
	args: {
		styles: { scale: 'shared' } satisfies ViolinPlotStylesConfig
	}
};

/** `box: false` leaves the inner box out. */
export const WithoutBox: Story = {
	args: {
		styles: { box: false } satisfies ViolinPlotStylesConfig
	}
};

/** A number sets the box's width in pixels. */
export const WideBox: Story = {
	args: {
		styles: { box: 16 } satisfies ViolinPlotStylesConfig
	}
};

/** An object picks the box's parts: here, no whiskers, with caps and the values past them. */
export const BoxParts: Story = {
	args: {
		styles: {
			box: { whiskers: false, caps: true, outliers: true }
		} satisfies ViolinPlotStylesConfig
	}
};
