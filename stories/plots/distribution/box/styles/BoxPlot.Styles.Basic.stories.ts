import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import { IRIS } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.area` is the area every series is drawn with, as it is or as a function of the series' name; a segment restyles a stretch of it over this. An outline (`strokeWidth`) takes the series' color unless `stroke` says another.

const meta = {
	title: 'Plots/Distribution/BoxPlot/Styles/Basic',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'petalLength',
		color: 'species'
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
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One style for every species: translucent boxes. */
export const TranslucentBoxes: Story = {
	args: {
		styles: { area: { fillOpacity: 0.4 } }
	}
};

/** A function of the series' name sets one box apart: setosa is solid, the others faint. */
export const OneSpeciesApart: Story = {
	args: {
		styles: {
			area: (name: string) => (name === 'setosa' ? { fillOpacity: 1 } : { fillOpacity: 0.25 })
		}
	},
	parameters: {
		docs: {
			source: {
				code: `<BoxPlot
  width={940}
  height={400}
  data={IRIS}
  x="species"
  y="petalLength"
  color="species"
  styles={{
    area: (name) => (name === 'setosa' ? { fillOpacity: 1 } : { fillOpacity: 0.25 })
  }}
/>`,
				language: 'html'
			}
		}
	}
};
