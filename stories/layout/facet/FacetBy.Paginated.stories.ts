import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { createRawSnippet } from 'svelte';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import FacetThemeDemo from './FacetThemeDemo.svelte';
import { facetGroups } from '../../data/facet-groups';

/** `facet: { mode: 'paginated' }` - pages through the grid in fixed-size chunks with prev/next controls. */
const meta = {
	title: 'Layout/Facets/Paginated',
	component: BarPlot,
	parameters: { docs: { source: { name: 'BarPlot' } } },
	tags: ['autodocs'],
	args: {
		width: 720,
		height: 480,
		x: 'category',
		y: 'value',
		data: facetGroups(9),
		facet: { by: 'group', columns: 2, mode: 'paginated', pageSize: 4 }
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

/** A 2×2 grid per page with prev/next controls. */
export const Default: Story = {};

/**
 * `pageSize: 1` out of 9 total facets - the single cell per page fills the
 * whole chart area rather than being sized as if it were one of a 5-row grid.
 */
export const SingleFacet: Story = {
	args: { facet: { by: 'group', columns: 3, mode: 'paginated', pageSize: 1 } }
};

/**
 * `navLayout: 'below'` - prev/next buttons and the page indicator sit in a
 * row beneath the chart instead of overlaid on top of it.
 */
export const NavBelow: Story = {
	args: {
		facet: { by: 'group', columns: 3, mode: 'paginated', pageSize: 1, navLayout: 'below' }
	}
};

/** Fully custom `navButton` snippet replacing the default prev/next buttons. */
export const CustomButtons: Story = {
	args: {
		facet: {
			by: 'group',
			columns: 2,
			mode: 'paginated',
			pageSize: 4,
			navButton: createRawSnippet(
				(ctx: () => { direction: 'prev' | 'next'; disabled: boolean; onclick: () => void }) => ({
					render: () =>
						`<button type="button" ${ctx().disabled ? 'disabled' : ''} style="padding:0.3rem 0.7rem;border:none;border-radius:0.25rem;background:#16a34a;color:#fff;font-size:0.8rem;cursor:pointer;opacity:${ctx().disabled ? 0.35 : 1}">${ctx().direction === 'prev' ? '◀ Prev' : 'Next ▶'}</button>`,
					setup: (el) => {
						const onclick = () => ctx().onclick();
						el.addEventListener('click', onclick);
						return () => el.removeEventListener('click', onclick);
					}
				})
			)
		}
	}
};

/**
 * Same `setConfiguration({ facet: {...} })` theming mechanism as the rest of
 * the package - switch themes to see the indicator badge and pagination
 * buttons restyle.
 */
export const ThemeSwitcher: StoryObj = {
	render: () => ({ Component: FacetThemeDemo })
};
