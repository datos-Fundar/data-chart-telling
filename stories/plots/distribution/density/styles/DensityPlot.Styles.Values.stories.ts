import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { PlotRowContext } from '$lib';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import { HEIGHTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A density's estimate tells a reader little, so its value labels name each curve at its peak - or, for a single
// curve, write where its peak is. Adult heights, women and men.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Styles/Values',
	component: DensityPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height',
		grouping: 'group',
		styles: { area: { fillOpacity: 0.5 } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 100, max: 700, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `show: true` writes each curve's name over its peak, the legend's job done on the curves themselves. */
export const Default: Story = {
	args: { legend: false, styles: { area: { fillOpacity: 0.5 }, values: { show: true } } }
};

/** A single curve writes where its peak is: the most common height. */
export const PeakOfOneCurve: Story = {
	args: {
		grouping: undefined,
		styles: { area: { fillOpacity: 0.5 }, values: { show: true, suffix: ' cm' } }
	}
};

/** `layout: 'path'` writes each name along its own curve, at its peak (`offset: 'max'`, a density's default). */
export const AlongEachCurve: Story = {
	args: {
		legend: false,
		styles: {
			area: { fillOpacity: 0.5 },
			values: {
				layout: 'path',
				format: (_v: number, _number: unknown, { series }: PlotRowContext) =>
					series === 'female' ? 'Women' : 'Men'
			}
		}
	}
};
