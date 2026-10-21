import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import type { BoxSummaryRow } from '$lib/types/plots/distribution/box/state';
import { BUENOS_AIRES_TRIPS } from '../../../data/commute-times';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a box shows its summary rather than every value inside it: the
// hovered row carries its `category`, `min`, `p25`, `median`, `p75`, `max`,
// `count` and `outliers`, through the same `tooltip` prop every other plot
// kind takes.

const meta = {
	title: 'Plots/Distribution/BoxPlot/Tooltip',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: BUENOS_AIRES_TRIPS,
		x: 'mode',
		y: 'minutes',
		color: 'mode'
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
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default text: the box's category, its five numbers from the top, and how many outliers it has. */
export const DefaultTooltip: Story = {
	args: {
		tooltip: { sync: false }
	}
};

/** The `format` callback gets the hovered box's summary and returns its label. */
export const CustomFormat: Story = {
	args: {
		tooltip: {
			sync: false,
			format: (row) => {
				const { category, median, p25, p75, count } = row as BoxSummaryRow;
				return `${category}: ${median} min (middle half ${p25}-${p75}), ${count} trips`;
			}
		}
	}
};
