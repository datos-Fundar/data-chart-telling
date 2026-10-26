import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `scales` labels the axes, orders the categories and sets the room each
// raincloud gets: the value axis fits the values unless its `domain` is pinned,
// and the category axis' `paddingInner` sets how wide each band is.

const meta = {
	title: 'Plots/Distribution/RaincloudPlot/Scales',
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
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		scales: { control: false }
	},
	parameters: {
		docs: { source: { name: 'RaincloudPlot' } }
	}
} satisfies Meta<typeof RaincloudPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: {
		scales: {
			x: { label: 'Species' },
			y: { label: 'Sepal length (cm)' }
		} satisfies AxisBasedScalesConfig
	}
};

/** A `domain` on the category axis orders the rainclouds. */
export const CategoryOrder: Story = {
	args: {
		scales: {
			x: { domain: ['virginica', 'versicolor', 'setosa'] }
		} satisfies AxisBasedScalesConfig
	}
};

/** A pinned `y` domain from zero shows each raincloud against the full sepal length. */
export const FromZero: Story = {
	args: {
		scales: {
			y: { domain: [0, 8] }
		} satisfies AxisBasedScalesConfig
	}
};

/** A larger `paddingInner` narrows every band, and the cloud, box and rain inside it with it. */
export const NarrowBands: Story = {
	args: {
		scales: {
			x: { paddingInner: 0.5 }
		} satisfies AxisBasedScalesConfig
	}
};

/** On a horizontal raincloud, the category axis is `y`. */
export const Horizontal: Story = {
	args: {
		x: 'sepalLength',
		y: 'species',
		height: 460,
		scales: {
			x: { label: 'Sepal length (cm)' },
			y: { paddingInner: 0.1 }
		} satisfies AxisBasedScalesConfig
	}
};
