import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES_AT_2007 } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.dot` is the dot every series is drawn with, as it is or as a function of the series' name; a segment restyles a stretch of it over this.

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Styles/Basic',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life',
		color: 'continent'
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
			description: '`styles.dot`: a style, or a function of the series name returning one.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One style for every continent: bigger, translucent dots, which show where they overlap. */
export const BiggerTranslucentDots: Story = {
	args: {
		styles: { dot: { dotRadius: 7, dotFillOpacity: 0.55 } }
	}
};

/** A function of the series' name sets one continent apart: Africa's dots are big, the rest small and faint. */
export const OneContinentApart: Story = {
	args: {
		styles: {
			dot: (name: string) =>
				name === 'Africa'
					? { dotRadius: 8 }
					: { dotRadius: 4, dotFillOpacity: 0.45, dotStrokeOpacity: 0.45 }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<ScatterPlot
  width={940}
  height={500}
  data={COUNTRIES_AT_2007}
  x="gdp"
  y="life"
  color="continent"
  styles={{
    dot: (name) =>
      name === 'Africa'
        ? { dotRadius: 8 }
        : { dotRadius: 4, dotFillOpacity: 0.45, dotStrokeOpacity: 0.45 }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
