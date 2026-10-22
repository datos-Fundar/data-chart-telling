import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES_AT_2007 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `r` sizes every dot by a per-row value, independent of the `color`-driven
// series color - the classic Gapminder-style bubble chart. A field key or
// accessor function is bound to its own auto sqrt scale (mirroring `x`/`y`'s
// own scales) - bubble *area*, not radius, ends up proportional to the
// value, so it's already the perceptually-correct mapping with no manual
// math needed. Only a literal number bypasses scaling (a fixed pixel
// radius, same as the default dot size).

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Bubble',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life',
		color: 'continent'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		data: { control: false },
		r: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `r` as a field key - population (millions) drives each bubble's radius through its own auto sqrt scale. */
export const BubblesByPopulation: Story = {
	args: {
		r: 'population'
	}
};

/** `r` combines with `segments` - the outlier bands from the Segments stories still apply on top of population-sized bubbles. */
export const BubbleWithSegments: Story = {
	args: {
		r: 'population',
		segments: {
			default: [{ styles: { dotFillOpacity: 0.75, dotStroke: '#111827', dotStrokeWidth: 0.75 } }]
		}
	}
};
