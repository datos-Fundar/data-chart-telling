import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { HEIGHT_DENSITY } from '../../../data/height-density';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Evolution/AreaPlot/Scales',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHT_DENSITY,
		x: 'height',
		y: 'density',
		color: 'sex'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		scales: {
			description: 'Per-axis scale configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: {
		scales: {
			x: { label: 'Height (cm)' },
			y: { label: 'Density (%)' }
		} satisfies AxisBasedScalesConfig
	}
};

/** A pinned `y` domain keeps the scale fixed regardless of the data. */
export const FixedYDomain: Story = {
	args: {
		scales: {
			y: { domain: [0, 8] }
		} satisfies AxisBasedScalesConfig
	}
};

/** A narrower `x` domain zooms into the range where most people fall. */
export const FixedXDomain: Story = {
	args: {
		scales: {
			x: { domain: [150, 190] }
		} satisfies AxisBasedScalesConfig
	}
};
