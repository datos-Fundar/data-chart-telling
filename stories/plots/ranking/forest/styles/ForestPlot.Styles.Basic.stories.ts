import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import { INFLATION_RANGES } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.stroke` and `styles.dot` are the connector and the dots every series is drawn with, each as it is or as a function of the series' name. A segment's stroke wins over `styles.connector`, which wins over `styles.stroke`.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Styles/Basic',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 480,
		data: INFLATION_RANGES,
		x: 'mean',
		y: 'period',
		lower: 'min',
		upper: 'max',
		color: 'region'
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
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Thicker stems and bigger dots for every region. */
export const ThickerStemsBiggerDots: Story = {
	args: {
		styles: { stroke: { strokeWidth: 3 }, dot: { dotRadius: 6 } }
	}
};

/** A function of the series' name sets one region apart: the Buenos Aires area is bold, the others thin and faint. */
export const OneRegionApart: Story = {
	args: {
		styles: {
			stroke: (name: string) =>
				name === 'GBA' ? { strokeWidth: 4 } : { strokeWidth: 1, strokeOpacity: 0.5 }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<ForestPlot
  width={940}
  height={480}
  data={INFLATION_RANGES}
  x="mean"
  y="period"
  lower="min"
  upper="max"
  color="region"
  styles={{
    stroke: (name) =>
      name === 'GBA' ? { strokeWidth: 4 } : { strokeWidth: 1, strokeOpacity: 0.5 }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
