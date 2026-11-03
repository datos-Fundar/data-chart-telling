import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/ranking/cleveland/Plot.svelte';
import { AGE_SHARES } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.stroke` and `styles.dot` are the connector and the dots every series is drawn with, each as it is or as a function of the series' name. A segment's stroke wins over `styles.connector`, which wins over `styles.stroke`.

const meta = {
	title: 'Plots/Ranking/ClevelandPlot/Styles/Basic',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
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
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Bigger dots, and a dashed connector between a category's dots. */
export const BiggerDots: Story = {
	args: {
		styles: {
			stroke: { strokeDasharray: '4 3' },
			dot: { dotRadius: 7 }
		}
	}
};

/** A function of the series' name sets the latest census apart: its dots are big, the earlier ones small and faint. */
export const LatestCensusApart: Story = {
	args: {
		styles: {
			dot: (name: string) =>
				name === '2022'
					? { dotRadius: 8 }
					: { dotRadius: 4, dotFillOpacity: 0.5, dotStrokeOpacity: 0.5 }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<ClevelandPlot
  width={940}
  height={400}
  data={AGE_SHARES}
  x="ageGroup"
  y="share"
  grouping="year"
  styles={{
    dot: (name) =>
      name === '2022'
        ? { dotRadius: 8 }
        : { dotRadius: 4, dotFillOpacity: 0.5, dotStrokeOpacity: 0.5 }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
