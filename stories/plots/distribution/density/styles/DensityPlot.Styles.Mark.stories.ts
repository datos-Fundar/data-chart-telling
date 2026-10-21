import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import type { DensityPlotStylesConfig } from '$lib/types/plots/distribution/density/props';
import { HEIGHTS } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.mark` picks what draws each curve: a filled `'area'` (the default) or
// a `'line'`. `styles.curve` sets how the curve joins its points.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Styles/Mark',
	component: DensityPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height',
		grouping: 'group'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** A filled area per group, translucent so the group behind shows through. */
export const Area: Story = {
	args: {
		styles: { mark: 'area' } satisfies DensityPlotStylesConfig
	}
};

/** A line per group: the overlap between groups reads more cleanly. */
export const Line: Story = {
	args: {
		styles: { mark: 'line' } satisfies DensityPlotStylesConfig
	}
};

/** A segment restyles an area: here a fainter fill. */
export const Segments: Story = {
	args: {
		segments: { default: [{ styles: { fillOpacity: 0.3 } }] }
	}
};
