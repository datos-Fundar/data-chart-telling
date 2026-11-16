import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import { GOOGL_AUGUST_2026, HEIGHT_DENSITY } from '$datasets';

// `styles.area.fill` takes a gradient as well as a color: a stop with no color takes each series' own, and a gradient
// sets its own opacity.

/** What a share of Alphabet bought at the close of August 3, 2026 had gained or lost by each close of the month. */
const FIRST_CLOSE = GOOGL_AUGUST_2026[0].close;
const GAINS = GOOGL_AUGUST_2026.map((day) => ({
	date: day.date,
	gain: Math.round((day.close - FIRST_CLOSE) * 100) / 100
}));
const MOST = Math.max(...GAINS.map((day) => Math.abs(day.gain)));

const meta = {
	title: 'Plots/Evolution/AreaPlot/Styles/Gradients',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHT_DENSITY,
		x: 'height',
		y: 'density'
	},
	argTypes: {
		styles: {
			description:
				'`styles.area`: a style, or a function of the series name returning one; its `fill` a color or a gradient.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each area fades out from its top down (`axis: 'y'`), in its own series' color: the stops set only opacities. */
export const FadingAreas: Story = {
	args: {
		color: 'sex',
		styles: { area: { fill: { gradient: [{ opacity: 0.5 }, { opacity: 0 }], axis: 'y' } } }
	}
};

/** One series alone: the same fade under a single curve. */
export const SingleFading: Story = {
	args: {
		data: HEIGHT_DENSITY.filter((row) => row.sex === 'female'),
		styles: { area: { fill: { gradient: [{ opacity: 0.45 }, { opacity: 0 }], axis: 'y' } } }
	}
};

/**
 * Stops `at` values of the axis span the plot: the area is green above zero and red below it, fading to nothing at
 * zero, and the line over it switches color at zero at once - two stops at the same value.
 */
export const GainsAndLosses: Story = {
	args: {
		data: GAINS,
		x: 'date',
		y: 'gain',
		legend: false,
		styles: {
			area: {
				fill: {
					gradient: [
						{ at: MOST, color: '#16a34a', opacity: 0.35 },
						{ at: 0, color: '#16a34a', opacity: 0 },
						{ at: 0, color: '#dc2626', opacity: 0 },
						{ at: -MOST, color: '#dc2626', opacity: 0.35 }
					],
					axis: 'y'
				}
			}
		},
		markers: [
			{
				type: 'line',
				x: 'date',
				y: 'gain',
				styles: {
					stroke: {
						gradient: [
							{ at: 0, color: '#16a34a' },
							{ at: 0, color: '#dc2626' }
						],
						axis: 'y'
					},
					strokeWidth: 2
				}
			},
			{ type: 'rule', axis: 'y', value: 0, styles: { strokeOpacity: 0.3 } }
		]
	}
};
