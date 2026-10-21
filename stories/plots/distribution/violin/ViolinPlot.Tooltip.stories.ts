import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ViolinPlot from '$lib/plots/distribution/violin/Plot.svelte';
import { IRIS } from '$examples/datasets/iris-flower';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a violin reads its category's summary, as a box plot's tooltip does:
// the quartiles, the whisker ends and the values past them. `tooltip` turns it
// on and sets its anchor and strategy.

const meta = {
	title: 'Plots/Distribution/ViolinPlot/Tooltip',
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
		tooltip: {
			description: 'Tooltip runtime configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'ViolinPlot' } }
	}
} satisfies Meta<typeof ViolinPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default tooltip: the category's five numbers. */
export const Default: Story = {
	args: {
		tooltip: { sync: false }
	}
};

/** A custom `format` over the summary row. */
export const Custom: Story = {
	args: {
		tooltip: {
			sync: false,
			format: (row: Record<string, unknown>) =>
				`${String(row.category)}: median ${Number(row.median).toFixed(1)} (${String(row.count)} flowers)`
		}
	}
};
