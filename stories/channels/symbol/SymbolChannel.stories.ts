import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The `symbol` channel: a categorical shape mapping, independent of `color`.
// Unlike `opacity`/`r`, a resolved shape name is a recognized literal (same
// escape hatch a resolved CSS color string gets), so it works as a live
// per-row accessor with no bucketing - ScatterPlot's own dots are the only
// default mark with a shape concept.

const meta = {
	title: 'Channels/Symbol',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		r: 6,
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `symbol: 'region'` gives every region its own shape, on top of `color`
 * already grouping by the same field - shape becomes a second, redundant-but-
 * legible encoding of the same category (useful for grayscale/print, or
 * alongside a colorblind-unfriendly palette).
 */
export const Default: Story = {
	args: {
		symbol: 'region'
	}
};

/**
 * `scales.symbol.range` picks a different set of shapes entirely - `diamond`/
 * `star`/`cross`, instead of `Default`'s implicit `circle`/`square`/`triangle`
 * cycle - genuinely distinct shapes.
 */
export const CustomShapes: Story = {
	args: {
		symbol: 'region',
		scales: {
			symbol: { range: ['diamond', 'star', 'cross'] }
		}
	}
};
