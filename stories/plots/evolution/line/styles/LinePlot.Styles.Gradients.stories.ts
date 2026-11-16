import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { BUENOS_AIRES_TEMPERATURE } from '$datasets';

// `styles.stroke.stroke` takes a gradient as well as a color. Here the daily temperature of Buenos Aires in 2025.

const meta = {
	title: 'Plots/Evolution/LinePlot/Styles/Gradients',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: BUENOS_AIRES_TEMPERATURE,
		x: 'date',
		y: 'temp',
		scales: { x: { nice: false } }
	},
	argTypes: {
		styles: {
			description:
				'`styles.stroke`: a style, or a function of the series name returning one; its `stroke` a color or a gradient.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Stops `at` dates color the line by the season it is in: cyan in summer, magenta in winter, gold back in summer. */
export const BySeason: Story = {
	args: {
		styles: {
			stroke: {
				stroke: {
					gradient: [
						{ at: new Date(2025, 0, 15), color: '#06b6d4' },
						{ at: new Date(2025, 6, 1), color: '#d946ef' },
						{ at: new Date(2025, 11, 15), color: '#f59e0b' }
					]
				}
			}
		}
	}
};

/** Stops `at` values of y color it by how hot it is: red above 25 degrees, blue below 12, and between them a blend. */
export const ByTemperature: Story = {
	args: {
		styles: {
			stroke: {
				stroke: {
					gradient: [
						{ at: 25, color: '#dc2626' },
						{ at: 12, color: '#2563eb' }
					],
					axis: 'y'
				}
			}
		}
	}
};
