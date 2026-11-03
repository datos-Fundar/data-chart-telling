import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import { HEIGHT_DENSITY } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.area` is the area every series is drawn with, as it is or as a function of the series' name; a segment restyles a stretch of it over this. An outline (`strokeWidth`) takes the series' color unless `stroke` says another.

const meta = {
	title: 'Plots/Evolution/AreaPlot/Styles/Basic',
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
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One style for every series: translucent areas, so the one behind shows through where they overlap. */
export const TranslucentAreas: Story = {
	args: {
		styles: { area: { fillOpacity: 0.45 } }
	}
};

/** A function of the series' name sets one area apart: male is solid, female a faint outline. */
export const OneSexApart: Story = {
	args: {
		styles: {
			area: (name: string) =>
				name === 'male'
					? { fillOpacity: 0.7 }
					: { fillOpacity: 0.15, strokeWidth: 2, strokeDasharray: '4 4' }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<AreaPlot
  width={940}
  height={400}
  data={HEIGHT_DENSITY}
  x="height"
  y="density"
  color="sex"
  styles={{
    area: (name) =>
      name === 'male'
        ? { fillOpacity: 0.7 }
        : { fillOpacity: 0.15, strokeWidth: 2, strokeDasharray: '4 4' }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
