import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.area` is the area every series is drawn with, as it is or as a function of the series' name; a segment restyles a stretch of it over this. An outline (`strokeWidth`) takes the series' color unless `stroke` says another.

const meta = {
	title: 'Plots/Ranking/BarPlot/Styles/Basic',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		series: [
			{ name: 'female', x: 'province', y: 'value', data: FEMALE_PROVINCE_VALUES },
			{ name: 'male', x: 'province', y: 'value', data: MALE_PROVINCE_VALUES }
		]
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
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One style for every series: translucent bars with an outline. */
export const TranslucentBars: Story = {
	args: {
		styles: { area: { fillOpacity: 0.6, strokeWidth: 1 } }
	}
};

/** A function of the series' name sets one series apart: female bars are solid, male ones faint. */
export const OneSexApart: Story = {
	args: {
		styles: {
			area: (name: string) => (name === 'female' ? { fillOpacity: 1 } : { fillOpacity: 0.3 })
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<BarPlot
  width={940}
  height={500}
  series={[
{ name: 'female', x: 'province', y: 'value', data: FEMALE_PROVINCE_VALUES },
{ name: 'male', x: 'province', y: 'value', data: MALE_PROVINCE_VALUES }
]}
  styles={{
    area: (name) => (name === 'female' ? { fillOpacity: 1 } : { fillOpacity: 0.3 })
  }}
/>`,
				language: 'html'
			}
		}
	}
};
