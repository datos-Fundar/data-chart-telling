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
		facet: { by: 'country', columns: 3, mode: 'carousel', visible: 1, navLayout: 'below' }
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

/** One facet visible at a time. `navLayout: 'below'` gives the badge a row under the panels instead of overlaying them. */
export const OneVisible: Story = {};

/** Two facets visible at once. */
export const TwoVisible: Story = {
	args: {
		facet: { by: 'country', columns: 3, mode: 'carousel', visible: 2, navLayout: 'below' }
	}
};

const overlay = (
	indicatorAt:
		| 'top-left'
		| 'top-middle'
		| 'top-right'
		| 'bottom-left'
		| 'bottom-middle'
		| 'bottom-right'
) => ({
	facet: {
		by: 'country',
		columns: 3,
		mode: 'carousel' as const,
		visible: 2,
		navLayout: 'overlay' as const,
		indicatorAt
	}
});

/** `navLayout: 'overlay'` (the default) lays the badge over the panels; `indicatorAt` picks where. This is the default, `'bottom-right'`. */
export const OverlayBottomRight: Story = { args: overlay('bottom-right') };

/** `indicatorAt: 'bottom-left'`. */
export const OverlayBottomLeft: Story = { args: overlay('bottom-left') };

/** `indicatorAt: 'bottom-middle'`. */
export const OverlayBottomMiddle: Story = { args: overlay('bottom-middle') };

/** `indicatorAt: 'top-middle'`. */
export const OverlayTopMiddle: Story = { args: overlay('top-middle') };

/** `indicatorAt: 'top-right'`. */
export const OverlayTopRight: Story = { args: overlay('top-right') };

/** `indicatorAt: 'top-left'`. */
export const OverlayTopLeft: Story = { args: overlay('top-left') };

/** `navLayout: 'above'` - the badge gets a row over the panels. */
export const NavAbove: Story = {
	args: { facet: { by: 'country', columns: 3, mode: 'carousel', visible: 2, navLayout: 'above' } }
};

/** `formatIndicator` gets the labels of the panels now shown: here, the two visible ones. */
export const FacetNamesInBadge: Story = {
	args: {
		facet: {
			by: 'country',
			columns: 3,
			mode: 'carousel',
			visible: 2,
			navLayout: 'below',
			formatIndicator: (current, total, values) => `${values.join(' · ')} - ${current}/${total}`
		}
	}
};

/** Fully custom `indicator` snippet replacing the default badge. */
export const CustomIndicator: Story = {
	args: {
		facet: {
			by: 'country',
			columns: 3,
			mode: 'carousel',
			visible: 1,
			navLayout: 'below',
			indicator: createRawSnippet((ctx: () => { current: number; total: number }) => ({
				render: () =>
					`<div style="padding:0.2rem 0.6rem;border-radius:0.25rem;background:#16a34a;color:#fff;font-size:0.8rem;font-weight:600">★ ${ctx().current} of ${ctx().total}</div>`
			}))
		}
	}
};
