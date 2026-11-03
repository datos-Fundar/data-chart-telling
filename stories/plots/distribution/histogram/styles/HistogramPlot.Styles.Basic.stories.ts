import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import { HEIGHTS } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.area` is the area every series is drawn with, as it is or as a function of the series' name; a segment restyles a stretch of it over this. An outline (`strokeWidth`) takes the series' color unless `stroke` says another.

const meta = {
	title: 'Plots/Distribution/HistogramPlot/Styles/Basic',
	component: HistogramPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height',
		grouping: 'group'
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 100, max: 700, step: 50 }
		},
		styles: {
			description: '`styles.area`: a style, or a function of the series name returning one.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'HistogramPlot' } }
	}
} satisfies Meta<typeof HistogramPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One style for every group: translucent bins, so the group behind shows through where they overlap. */
export const TranslucentBins: Story = {
	args: {
		styles: { area: { fillOpacity: 0.55 } }
	}
};

/** A function of the group's name outlines one group's bins and leaves the other filled. */
export const OneGroupOutlined: Story = {
	args: {
		styles: {
			area: (name: string) =>
				name === 'male' ? { fillOpacity: 0.15, strokeWidth: 2 } : { fillOpacity: 0.6 }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<HistogramPlot
  width={940}
  height={400}
  data={HEIGHTS}
  x="height"
  grouping="group"
  styles={{
    area: (name) =>
      name === 'male'
        ? { fillOpacity: 0.15, strokeWidth: 2 }
        : { fillOpacity: 0.6 }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
