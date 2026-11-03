import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import { HEIGHTS } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.area` is the area every series is drawn with, as it is or as a function of the series' name; a segment restyles a stretch of it over this. An outline (`strokeWidth`) takes the series' color unless `stroke` says another.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Styles/Basic',
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
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One style for every group: translucent curves. */
export const TranslucentCurves: Story = {
	args: {
		styles: { area: { fillOpacity: 0.3 } }
	}
};

/** A function of the group's name draws one group's curve with a dashed outline. */
export const OneGroupDashed: Story = {
	args: {
		styles: {
			area: (name: string) =>
				name === 'male'
					? { fillOpacity: 0.3 }
					: { fillOpacity: 0.1, strokeWidth: 2, strokeDasharray: '5 4' }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<DensityPlot
  width={940}
  height={400}
  data={HEIGHTS}
  x="height"
  grouping="group"
  styles={{
    area: (name) =>
      name === 'male'
        ? { fillOpacity: 0.3 }
        : { fillOpacity: 0.1, strokeWidth: 2, strokeDasharray: '5 4' }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
