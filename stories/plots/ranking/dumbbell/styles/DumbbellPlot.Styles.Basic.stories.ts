import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import { PROVINCE_VALUES } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.stroke` and `styles.dot` are the connector and the dots every series is drawn with, each as it is or as a function of the series' name. A segment's stroke wins over `styles.connector`, which wins over `styles.stroke`.

const meta = {
	title: 'Plots/Ranking/DumbbellPlot/Styles/Basic',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
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
			description:
				'`styles.stroke` and `styles.dot`: a style, or a function of the series name returning one.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A thicker, dashed connector and bigger dots. */
export const DashedConnectors: Story = {
	args: {
		styles: {
			stroke: { strokeWidth: 3, strokeDasharray: '5 4' },
			dot: { dotRadius: 7 }
		}
	}
};

/** A function of the series' name sets one sex's dots apart: women's are big, men's small and faint. */
export const OneSexApart: Story = {
	args: {
		styles: {
			dot: (name: string) =>
				name === 'female'
					? { dotRadius: 8 }
					: { dotRadius: 4, dotFillOpacity: 0.5, dotStrokeOpacity: 0.5 }
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<DumbbellPlot
  width={940}
  height={400}
  data={PROVINCE_VALUES}
  x="province"
  y="value"
  color="sex"
  styles={{
    dot: (name) =>
      name === 'female'
        ? { dotRadius: 8 }
        : { dotRadius: 4, dotFillOpacity: 0.5, dotStrokeOpacity: 0.5 }
  }}
/>`,
				language: 'html'
			}
		}
	}
};
