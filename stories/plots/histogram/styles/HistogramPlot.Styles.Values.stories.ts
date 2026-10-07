import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HistogramPlot from '$lib/plots/histogram/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { MEASUREMENTS } from '../../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` labels every non-empty bin with its count. `anchor` places
// the label along its bar, the same way a bar plot's does.

const meta = {
	title: 'Plots/HistogramPlot/Styles/Values',
	component: HistogramPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: MEASUREMENTS,
		x: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HistogramPlot' } }
	}
} satisfies Meta<typeof HistogramPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `values.show: true` labels each bin with its count, just above its bar (`anchor: 'outside'`, the default). */
export const ShowValues: Story = {
	args: {
		styles: { values: { show: true } } satisfies AxisBasedStylesConfig
	}
};

/** `anchor: 'start'` puts each count just inside the top of its bar, here in white to read against it. */
export const AnchorStart: Story = {
	args: {
		styles: {
			values: { show: true, anchor: 'start', fontStyle: { fill: 'white', fontWeight: 'bold' } }
		} satisfies AxisBasedStylesConfig
	}
};

/** `anchor: 'middle'` centres each count on its bar. */
export const AnchorMiddle: Story = {
	args: {
		styles: {
			values: { show: true, anchor: 'middle', fontStyle: { fill: 'white' } }
		} satisfies AxisBasedStylesConfig
	}
};

/** `anchor: 'end'` puts each count at the base of its bar. */
export const AnchorEnd: Story = {
	args: {
		styles: {
			values: { show: true, anchor: 'end', fontStyle: { fill: 'white' } }
		} satisfies AxisBasedStylesConfig
	}
};

/** `format(count, seriesName)` returns each label's text. */
export const CustomFormat: Story = {
	args: {
		styles: {
			values: { show: true, format: (count: number) => `n=${count}` }
		} satisfies AxisBasedStylesConfig
	}
};

/** Stacked groups (`transforms: [{ type: 'stackY' }]`): each group's count sits in the middle of its own piece of the bar. */
export const GroupedStacked: Story = {
	args: {
		grouping: 'group',
		transforms: [{ type: 'stackY' }],
		styles: {
			values: { show: true, anchor: 'middle', fontStyle: { fill: 'white', fontSize: 10 } }
		} satisfies AxisBasedStylesConfig
	}
};

/** `hoverIsolate: true` dims every other group while the pointer is over one of its counts. */
export const HoverIsolate: Story = {
	args: {
		grouping: 'group',
		transforms: [{ type: 'stackY' }],
		styles: {
			values: {
				show: true,
				anchor: 'middle',
				hoverIsolate: true,
				fontStyle: { fill: 'white', fontSize: 10 }
			}
		} satisfies AxisBasedStylesConfig
	}
};
