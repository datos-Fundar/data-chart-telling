import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES_AT_2007 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `statistics: [{ type: 'box' }]` resolves straight to a `box` marker
// (svelteplot's own `BoxX`/`BoxY`), summarizing the plot's rows per category:
// one box per `x` value here. Its styling options are the same as the `box`
// marker's - `bar`/`rule`/`dot`/`tickMedian`/`tickMinMax` - and `bar.fill`
// falls back to the source series' own color, then to the theme's first
// palette color.

const CONTINENT_DOMAIN = ['Americas', 'Europe', 'Asia', 'Africa'];

const meta = {
	title: 'Layout/Statistics/Box/Basics',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: COUNTRIES_AT_2007,
		x: 'continent',
		y: 'gdp',
		r: 3,
		scales: { x: { type: 'band', domain: CONTINENT_DOMAIN }, y: { domain: [0, 50_000] } }
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

/** GDP per capita distribution by continent, drawn over the countries' own dots. */
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
		color: 'continent',
		statistics: [{ type: 'box', tickMinMax: false, dot: { fill: true } }]
	}
};
