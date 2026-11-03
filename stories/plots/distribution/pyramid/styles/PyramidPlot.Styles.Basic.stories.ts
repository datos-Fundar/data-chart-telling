import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import { AGE_GROUPS, POPULATION_BY_AGE } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.area` is the area every series is drawn with, as it is or as a function of the series' name; a segment restyles a stretch of it over this. An outline (`strokeWidth`) takes the series' color unless `stroke` says another.

const meta = {
	title: 'Plots/Distribution/PyramidPlot/Styles/Basic',
	component: PyramidPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 520,
		data: POPULATION_BY_AGE.filter((d) => d.year === 2022),
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { label: 'Grupo de edad', domain: AGE_GROUPS } }
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
		docs: { source: { name: 'PyramidPlot' } }
	}
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One style for every series: translucent bars with an outline. */
export const TranslucentBars: Story = {
	args: {
		styles: { area: { fillOpacity: 0.6, strokeWidth: 1 } }
	}
};

/** A function of the series' name sets one side apart: female bars are solid, male ones faint. */
export const OneSexApart: Story = {
	args: {
		styles: {
			area: (name: string) => (name === 'Female' ? { fillOpacity: 1 } : { fillOpacity: 0.35 })
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<PyramidPlot
  width={940}
  height={520}
  data={POPULATION_BY_AGE.filter((d) => d.year === 2022)}
  x="share"
  y="ageGroup"
  color="sex"
  scales={{ y: { label: 'Grupo de edad', domain: AGE_GROUPS } }}
  styles={{
    area: (name) => (name === 'Female' ? { fillOpacity: 1 } : { fillOpacity: 0.35 })
  }}
/>`,
				language: 'html'
			}
		}
	}
};
