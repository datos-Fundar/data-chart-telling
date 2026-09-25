import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import LegendHorizontalDemo, { jurisdictionItems } from './LegendHorizontalDemo.svelte';
import LegendNavThemeDemo from './LegendNavThemeDemo.svelte';
import { renderSource } from '../../common/docsSource';

/** `layout: { type: 'horizontal', maxRows }` wrapping and pagination. */
const meta = {
	title: 'Layout/Legend/Paginated',
	component: LegendLayout,
	tags: ['autodocs'],
	parameters: {
		docs: { source: { name: 'LegendLayout' } }
	}
} satisfies Meta<typeof LegendLayout>;

export default meta;

/**
 * A `layout: { type: 'horizontal' }` section narrower than its items need.
 * `maxRows` defaults to 1, so as soon as items would wrap to a second row the
 * section paginates instead — one jurisdiction visible per page, prev/next
 * arrows to browse the rest.
 */
export const HorizontalPaginatedDefaultMaxRows: StoryObj = {
	render: () => ({
		Component: LegendHorizontalDemo,
		props: { itemCount: 24, maxRows: 1, width: 800 }
	}),
	parameters: {
		docs: {
			source: {
				code: renderSource('LegendLayout', {
					sections: [
						{
							type: 'discrete',
							title: 'Jurisdiction',
							items: jurisdictionItems(24),
							layout: { type: 'horizontal', maxRows: 1 }
						}
					]
				})
			}
		}
	}
};

/**
 * `maxRows: 2` — the section grows to two wrapped rows before it paginates,
 * so each page holds two rows' worth of items (the last page may hold fewer,
 * however many rows are left over). This is the exact case reported: a full
 * discrete legend whose items wrap into several rows, capped to a page height
 * instead of pushing the chart down.
 */
export const HorizontalPaginatedTwoRows: StoryObj = {
	render: () => ({
		Component: LegendHorizontalDemo,
		props: { itemCount: 24, maxRows: 2, width: 460 }
	}),
	parameters: {
		docs: {
			source: {
				code: renderSource('LegendLayout', {
					sections: [
						{
							type: 'discrete',
							title: 'Jurisdiction',
							items: jurisdictionItems(24),
							layout: { type: 'horizontal', maxRows: 2 }
						}
					]
				})
			}
		}
	}
};

/** `interactive: true` still click-to-toggles items on whichever page is showing. */
export const HorizontalPaginatedInteractive: StoryObj = {
	render: () => ({
		Component: LegendHorizontalDemo,
		props: { itemCount: 24, maxRows: 1, width: 460, interactive: true }
	}),
	parameters: {
		docs: {
			source: {
				code: renderSource('LegendLayout', {
					sections: [
						{
							type: 'discrete',
							title: 'Jurisdiction',
							items: jurisdictionItems(24),
							interactive: { enabled: true },
							layout: { type: 'horizontal', maxRows: 1 }
						}
					]
				})
			}
		}
	}
};

/** Fully custom `navButton` snippet replacing the section's default arrow buttons. */
export const HorizontalPaginatedCustomNavButton: StoryObj = {
	render: () => ({
		Component: LegendHorizontalDemo,
		props: { itemCount: 24, maxRows: 1, width: 460, customNavButton: true }
	}),
	parameters: {
		docs: {
			source: {
				code: renderSource('LegendLayout', {
					sections: [
						{
							type: 'discrete',
							title: 'Jurisdiction',
							items: jurisdictionItems(24),
							layout: { type: 'horizontal', maxRows: 1 },
							navButton: () => {
								/* custom prev/next snippet */
							}
						}
					]
				})
			}
		}
	}
};

/**
 * Same `setConfiguration({ legend: { navButton: {...} } })` theming mechanism
 * as the rest of the package — switch themes to see the pagination arrows
 * restyle (compare with `Layout/Facets`' `PaginatedThemeSwitcher`, which
 * themes the equivalent facet buttons).
 */
export const HorizontalPaginatedNavThemeSwitcher: StoryObj = {
	render: () => ({ Component: LegendNavThemeDemo }),
	parameters: {
		docs: {
			source: {
				code: renderSource('LegendLayout', {
					sections: [
						{
							type: 'discrete',
							title: 'Jurisdiction',
							items: jurisdictionItems(24),
							layout: { type: 'horizontal', maxRows: 1 }
						}
					]
				})
			}
		}
	}
};
