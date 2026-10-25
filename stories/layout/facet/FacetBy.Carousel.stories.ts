import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { createRawSnippet } from 'svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { diverseCountries } from '$datasets';

/** `facet: { mode: 'carousel' }` - `visible` facets show at a time; swipe/drag to browse the rest. */
const meta = {
	title: 'Layout/Facets/Carousel',
	component: BarPlot,
	parameters: { docs: { source: { name: 'BarPlot' } } },
	tags: ['autodocs'],
	args: {
		width: 720,
		height: 480,
		x: 'year',
		y: 'gdp',
		data: diverseCountries(6),
		facet: { by: 'country', columns: 3, mode: 'carousel', visible: 1 }
	},
	argTypes: {
		width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 300, max: 800, step: 20 } },
		data: { control: false },
		facet: { control: false }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One facet visible at a time. */
export const OneVisible: Story = {};

/** Two facets visible at once. */
export const TwoVisible: Story = {
	args: { facet: { by: 'country', columns: 3, mode: 'carousel', visible: 2 } }
};

/** Fully custom `indicator` snippet replacing the default badge. */
export const CustomIndicator: Story = {
	args: {
		facet: {
			by: 'country',
			columns: 3,
			mode: 'carousel',
			visible: 1,
			indicator: createRawSnippet((ctx: () => { current: number; total: number }) => ({
				render: () =>
					`<div style="padding:0.2rem 0.6rem;border-radius:0.25rem;background:#16a34a;color:#fff;font-size:0.8rem;font-weight:600">★ ${ctx().current} of ${ctx().total}</div>`
			}))
		}
	}
};
