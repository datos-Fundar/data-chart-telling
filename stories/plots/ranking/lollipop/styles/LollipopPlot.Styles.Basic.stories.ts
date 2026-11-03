import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import { PROVINCE_VALUES } from '$datasets';

const FEMALE = PROVINCE_VALUES.filter((row) => row.sex === 'female');
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.stroke` and `styles.dot` are the connector and the dots every series is drawn with, each as it is or as a function of the series' name. A segment's stroke wins over `styles.connector`, which wins over `styles.stroke`.

const meta = {
	title: 'Plots/Ranking/LollipopPlot/Styles/Basic',
	component: LollipopPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: FEMALE,
		x: 'province',
		y: 'value',
		scales: { y: { domain: [70, 85] } }
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
		docs: { source: { name: 'LollipopPlot' } }
	}
} satisfies Meta<typeof LollipopPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Dashed, rounded stems and bigger dots. */
export const DashedStemsBigDots: Story = {
	args: {
		styles: {
			stroke: { strokeWidth: 3, strokeDasharray: '4 3', strokeLinecap: 'round' },
			dot: { dotRadius: 7 }
		}
	}
};

/** `styles.connector` wins where both are set: the stems are 5px wide as the connector says, and take the dash and cap of `styles.stroke`, which it says nothing about. */
export const ConnectorWins: Story = {
	args: {
		styles: {
			stroke: { strokeWidth: 1, strokeDasharray: '2 3', strokeLinecap: 'round' },
			connector: { width: 5 }
		}
	}
};
