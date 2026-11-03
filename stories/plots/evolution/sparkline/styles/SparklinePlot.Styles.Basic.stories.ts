import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import { REGION_VALUES } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.stroke` and `styles.dot` are the line and the dots every series is drawn with, each as it is or as a function of the series' name; a segment restyles a stretch of it over these.

const meta = {
	title: 'Plots/Evolution/SparklinePlot/Styles/Basic',
	component: SparklinePlot,
	tags: ['autodocs'],
	args: {
		width: 400,
		height: 160,
		data: REGION_VALUES,
		x: 'date',
		y: 'value',
		color: 'region',
		legend: true
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
			description:
				'`styles.stroke` and `styles.dot`: a style, or a function of the series name returning one.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'SparklinePlot' } }
	}
} satisfies Meta<typeof SparklinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A thicker line for every series, in place of the sparkline's thin one. */
export const ThickerLines: Story = {
	args: {
		styles: { stroke: { strokeWidth: 3 } }
	}
};

/** A function of the series' name sets one region apart: the Buenos Aires area is solid, the others thin and dashed. */
export const OneRegionApart: Story = {
	args: {
		styles: {
			stroke: (name: string) =>
				name === 'GBA' ? { strokeWidth: 3 } : { strokeWidth: 1, strokeDasharray: '3 3' }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<SparklinePlot
  width={400}
  height={160}
  data={REGION_VALUES}
  x="date"
  y="value"
  color="region"
  legend={true}
  styles={{
    stroke: (name) =>
      name === 'GBA' ? { strokeWidth: 3 } : { strokeWidth: 1, strokeDasharray: '3 3' }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
