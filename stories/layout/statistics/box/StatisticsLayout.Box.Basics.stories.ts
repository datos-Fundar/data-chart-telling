import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES } from '../../../plots/correlation/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `statistics: [{ type: 'box' }]` resolves straight to a `box` marker
// (svelteplot's own `BoxX`/`BoxY`), summarizing the plot's rows per category:
// one box per `x` value here. Its styling options are the same as the `box`
// marker's - `bar`/`rule`/`dot`/`tickMedian`/`tickMinMax` - and `bar.fill`
// falls back to the source series' own color, then to the theme's first
// palette color.

const REGION_DOMAIN = ['Americas', 'Europe', 'Asia', 'Africa'];

const meta = {
	title: 'Layout/Statistics/Box/Basics',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: COUNTRIES,
		x: 'region',
		y: 'gdpPerCapita',
		r: 3,
		scales: { x: { type: 'band', domain: REGION_DOMAIN }, y: { domain: [0, 110] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** GDP per capita distribution by region, drawn over the countries' own dots. */
export const Default: Story = {
	args: {
		statistics: [{ type: 'box' }]
	}
};

/** `bar.fill` recolors the box; `tickMedian` takes the same contrast default as the marker, so the median stays visible. */
export const CustomStyle: Story = {
	args: {
		statistics: [
			{
				type: 'box',
				bar: { fill: '#0f766e', fillOpacity: 0.3, stroke: '#0f766e' },
				tickMedian: { strokeWidth: 3 }
			}
		]
	}
};

/** `tickMinMax: false` hides the whisker caps; `dot: { fill: true }` colors the outliers with their box's own fill. */
export const HiddenWhiskers: Story = {
	args: {
		color: 'region',
		statistics: [{ type: 'box', tickMinMax: false, dot: { fill: true } }]
	}
};
