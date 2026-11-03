import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import { PROVINCE_LIFE } from '$datasets';
// ── Meta ──────────────────────────────────────────────────────────────────────

// `styles.area` is the area every series is drawn with, as it is or as a function of the series' name; a segment restyles a stretch of it over this. An outline (`strokeWidth`) takes the series' color unless `stroke` says another.

const meta = {
	title: 'Plots/Ranking/BulletPlot/Styles/Basic',
	component: BulletPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_LIFE,
		x: 'female',
		y: 'province',
		scales: { x: { domain: [70, 85] } },
		target: 80,
		ranges: [76, 80, 85]
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
		docs: { source: { name: 'BulletPlot' } }
	}
} satisfies Meta<typeof BulletPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The bar that shows the value, translucent. */
export const TranslucentBars: Story = {
	args: {
		styles: { area: { fillOpacity: 0.6 } }
	}
};

/** The bar with an outline. */
export const OutlinedBars: Story = {
	args: {
		styles: { area: { strokeWidth: 1.5 } }
	}
};
