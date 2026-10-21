import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import { ENERGY_MIX } from '../../data/energy-mix';
import { WEIGHT_FREQUENCY, WEIGHT_PEAK_TOTAL } from '../../data/weight-frequency';

/** Half the tallest total, rounded up to a hundred, so the centered stack fills the axis. */
const HALF_PEAK = Math.ceil(WEIGHT_PEAK_TOTAL / 2 / 100) * 100;

// ── Meta ──────────────────────────────────────────────────────────────────────
// A stack's `offset` moves the whole stack: `normalize` scales every column to
// a share of 1 (so the y domain is 0 to 1), `center` puts each column's midline
// on zero, so the total runs from minus half to plus half. `order` reorders the
// layers before they stack: `sum` puts the smallest total at the base, and
// `reverse` flips whatever order comes out of it. The stack's own options are
// flat next to its channels, as in svelteplot.

const meta = {
	title: 'Transforms/Stack/Offsets',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: ENERGY_MIX,
		x: 'year',
		y: 'share',
		color: 'source',
		segments: { default: [{ styles: { fillOpacity: 0.85 } }] }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		color: { control: false },
		transforms: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `offset: 'normalize'` divides each year's stack by its total, so every column reaches 1 and the layers read as shares. */
export const Normalize: Story = {
	args: {
		transforms: [{ type: 'stackY', offset: 'normalize' }]
	}
};

/** `offset: 'center'` centers each weight bin's stack on zero: the two sexes' curves spread out above and below one midline, a mirrored silhouette. */
export const Center: Story = {
	args: {
		data: WEIGHT_FREQUENCY,
		x: 'weight',
		y: 'frequency',
		color: 'sex',
		scales: {
			x: { domain: [30, 150], label: 'Weight (kg)' },
			y: { domain: [-HALF_PEAK, HALF_PEAK], label: 'Frequency' }
		},
		transforms: [{ type: 'stackY', offset: 'center' }]
	}
};

/** `order: 'sum'` stacks the smallest total at the base and the largest on top, in ascending order of each layer's own sum. */
export const OrderBySum: Story = {
	args: {
		transforms: [{ type: 'stackY', order: 'sum' }]
	}
};

/** `order: 'sum', reverse: true` flips the sum order: the largest layer at the base, the smallest on top. */
export const OrderBySumReversed: Story = {
	args: {
		transforms: [{ type: 'stackY', order: 'sum', reverse: true }]
	}
};

/** `reverse: true` alone flips the input order: the first group, which is on the base by default, goes on top. */
export const Reversed: Story = {
	args: {
		transforms: [{ type: 'stackY', reverse: true }]
	}
};
