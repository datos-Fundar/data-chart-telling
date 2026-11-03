import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import { AGE_SHARES } from '$datasets';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.stroke` and `styles.dot` are the line and the dots every series is drawn with, each as it is or as a function of the series' name; a segment restyles a stretch of it over these.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Styles/Basic',
	component: SlopePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: CENSUSES,
		x: 'year',
		y: 'share',
		color: 'ageGroup'
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
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One style for every series: thicker lines and bigger dots. Each series keeps its own color. */
export const EverySeriesAlike: Story = {
	args: {
		styles: { values: { show: true }, stroke: { strokeWidth: 4 }, dot: { dotRadius: 7 } }
	}
};

/** A function of the series' name sets one group apart: the oldest stays bold, the rest fade. */
export const OneGroupApart: Story = {
	args: {
		styles: {
			values: { show: true },
			stroke: (name: string) =>
				name === '65+' ? { strokeWidth: 5 } : { strokeWidth: 2, strokeOpacity: 0.4 },
			dot: (name: string) =>
				name === '65+'
					? { dotRadius: 8 }
					: { dotRadius: 4, dotFillOpacity: 0.4, dotStrokeOpacity: 0.4 }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<SlopePlot
  width={940}
  height={400}
  data={CENSUSES}
  x="year"
  y="share"
  color="ageGroup"
  styles={{
    values: { show: true },
    stroke: (name) =>
      name === '65+' ? { strokeWidth: 5 } : { strokeWidth: 2, strokeOpacity: 0.4 },
    dot: (name) =>
      name === '65+'
        ? { dotRadius: 8 }
        : { dotRadius: 4, dotFillOpacity: 0.4, dotStrokeOpacity: 0.4 }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
