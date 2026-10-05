import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/area/Plot.svelte';
import { HEIGHT_DENSITY, type HeightDensity } from '../../data/height-density';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering an area shows its nearest point's tooltip, through the same
// `tooltip` prop every other plot kind takes.

const meta = {
	title: 'Plots/AreaPlot/Tooltip',
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
		tooltip: {
			description: 'Tooltip runtime configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No tooltip — hovering produces no floating label, the default when `tooltip` is omitted. */
export const NoTooltip: Story = {
	args: {
		tooltip: undefined
	}
};

/** The `format` callback gets the nearest hovered row and returns its label. */
export const BasicTooltip: Story = {
	args: {
		tooltip: {
			facetId: '',
			sync: false,
			format: (row) => {
				const { height, density } = row as HeightDensity;
				return `${height} cm — ${density.toFixed(2)}%`;
			}
		}
	}
};
