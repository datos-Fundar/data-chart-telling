import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { HEIGHTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` labels every non-empty bin with its count. `layout` and its
// options place the label on its bar, the same way a bar plot's do.

const meta = {
	title: 'Plots/Distribution/HistogramPlot/Styles/Values',
	component: HistogramPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height'
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

/** `values.show: true` labels each bin with its count, just above its bar (the default: `layout: 'path'` beyond its top edge). */
export const ShowValues: Story = {
	args: {
		styles: { values: { show: true } } satisfies AxisBasedStylesConfig
	}
};

/** `layout: 'box'` with `anchor: 'top'` puts each count just inside the top of its bar, here in white to read against it. */
export const BoxTop: Story = {
	args: {
		styles: {
			values: { layout: 'box', anchor: 'top', fontStyle: { fill: 'white', fontWeight: 'bold' } }
		} satisfies AxisBasedStylesConfig
	}
};

/** `layout: 'box'` centres each count on its bar. */
export const BoxMiddle: Story = {
	args: {
		styles: {
			values: { layout: 'box', fontStyle: { fill: 'white' } }
		} satisfies AxisBasedStylesConfig
	}
};

/** `layout: 'box'` with `anchor: 'bottom'` puts each count at the base of its bar. */
export const BoxBottom: Story = {
	args: {
		styles: {
			values: { layout: 'box', anchor: 'bottom', fontStyle: { fill: 'white' } }
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
			values: { layout: 'box', fontStyle: { fill: 'white', fontSize: 10 } }
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
				layout: 'box',
				hoverIsolate: true,
				fontStyle: { fill: 'white', fontSize: 10 }
			}
		} satisfies AxisBasedStylesConfig
	}
};
