import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { FEMALE_LIFE_EXPECTANCY } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/LinePlot/Styles/Frame',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 700, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false
		},
		styles: {
			description: 'Rendering style overrides.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * `styles.frame: true` draws a plain border around the plot's own content
 * box - purely decorative, svelteplot's `Frame` mark. `true` uses its own
 * defaults (a thin `currentColor` stroke, no fill). Available on every plot
 * kind via `styles.frame`, not just `LinePlot`.
 */
export const FrameDefault: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		styles: {
			frame: true
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * `styles.frame` as an object overrides the border's look field-by-field -
 * same style fields as a segment/cell's own fill+stroke bag, plus `inset*`
 * to pull the frame in from the content box's own edges.
 */
export const FrameCustomStyle: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		styles: {
			frame: {
				stroke: '#6366f1',
				strokeWidth: 2,
				fill: '#6366f1',
				fillOpacity: 0.04,
				borderRadius: 8,
				inset: 4
			}
		} satisfies AxisBasedStylesConfig
	}
};
