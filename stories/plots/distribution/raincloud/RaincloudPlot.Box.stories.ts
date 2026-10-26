import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import type { RaincloudPlotStylesConfig } from '$lib/types/plots/distribution/raincloud/props';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.box` sets the box: `false` leaves it out, a number sets its width in
// pixels, and an object picks where it sits (`position`) and which of its parts
// show (`quartiles`, `median`, `whiskers`, `caps`, `outliers`).

const meta = {
	title: 'Plots/Distribution/RaincloudPlot/Box',
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

/** By default the box sits in the gap between the cloud and the rain. */
export const Between: Story = {};

/** `position: 'cloud'` draws the box over the density, next to its base. */
export const OverCloud: Story = {
	args: {
		styles: { box: { position: 'cloud' } } satisfies RaincloudPlotStylesConfig
	}
};

/** `position: 'rain'` draws the box over the dots. */
export const OverRain: Story = {
	args: {
		styles: { box: { position: 'rain', width: 14 } } satisfies RaincloudPlotStylesConfig
	}
};

/** `whiskers: false` keeps only the box and its median. */
export const NoWhiskers: Story = {
	args: {
		styles: { box: { whiskers: false } } satisfies RaincloudPlotStylesConfig
	}
};

/** `quartiles: false` drops the box itself, leaving the whiskers and the median. */
export const NoQuartiles: Story = {
	args: {
		styles: { box: { quartiles: false } } satisfies RaincloudPlotStylesConfig
	}
};

/** `caps` closes each whisker with a tick, and `outliers` marks the values past them. */
export const CapsAndOutliers: Story = {
	args: {
		styles: { box: { caps: true, outliers: true } } satisfies RaincloudPlotStylesConfig
	}
};

/** `box: false` leaves the box out. */
export const None: Story = {
	args: {
		styles: { box: false } satisfies RaincloudPlotStylesConfig
	}
};
