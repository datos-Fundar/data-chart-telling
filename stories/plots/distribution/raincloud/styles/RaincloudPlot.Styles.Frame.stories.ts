import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.frame` draws a border around the plot's own content, the same as
// every other plot kind.

const meta = {
	title: 'Plots/Distribution/RaincloudPlot/Styles/Frame',
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
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'RaincloudPlot' } }
	}
} satisfies Meta<typeof RaincloudPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `frame: true` draws a plain border around the content box. */
export const Default: Story = {
	args: {
		styles: { frame: true } satisfies AxisBasedStylesConfig
	}
};

/** `frame` as an object overrides the border's look field by field. */
export const Custom: Story = {
	args: {
		styles: {
			frame: { stroke: '#7c3aed', strokeWidth: 2 }
		} satisfies AxisBasedStylesConfig
	}
};
