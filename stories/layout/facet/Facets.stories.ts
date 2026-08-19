import type { Meta, StoryObj } from '@storybook/svelte-vite';
import FacetDemo from './FacetDemo.svelte';
import FacetThemeDemo from './FacetThemeDemo.svelte';

/**
 * `FacetLayout` is the small-multiples layout: it splits data by a field,
 * arranges the groups in a responsive grid, and renders each one through a
 * plot-agnostic `cell` snippet. `columns` controls the grid shape — a fixed
 * number, or `{ desktop, mobile }` for a responsive layout.
 */
const meta = {
  title: 'Layout/Facets',
  component: FacetDemo,
  tags: ['autodocs'],
  args: { width: 720, height: 480 },
  argTypes: {
    width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 300, max: 800, step: 20 } },
    groupCount: { control: false },
    columns: { control: false },
    mode: { control: false },
    visible: { control: { type: 'range', min: 1, max: 4, step: 1 } },
    pageSize: { control: { type: 'range', min: 1, max: 9, step: 1 } },
    navLayout: { control: { type: 'radio' }, options: ['overlay', 'below'] },
  },
} satisfies Meta<typeof FacetDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two groups, two columns — side by side. */
export const TwoSideBySide: Story = {
  args: { groupCount: 2, columns: 2 },
};

/** Two groups, one column — stacked vertically. */
export const TwoStacked: Story = {
  args: { groupCount: 2, columns: 1 },
};

/** Four groups in a 2×2 grid. */
export const Four: Story = {
  args: { groupCount: 4, columns: 2 },
};

/** Six groups in a 3×2 grid. */
export const Six: Story = {
  args: { groupCount: 6, columns: 3 },
};

/** Nine groups in a 3×3 grid. */
export const Nine: Story = {
  args: { groupCount: 9, columns: 3 },
};

/** `mode: 'carousel'`, one facet visible at a time — swipe/drag to browse. */
export const Carousel: Story = {
  args: { groupCount: 6, columns: 3, mode: 'carousel', visible: 1 },
};

/** `mode: 'carousel'`, two facets visible at once. */
export const CarouselTwoVisible: Story = {
  args: { groupCount: 6, columns: 3, mode: 'carousel', visible: 2 },
};

/** `mode: 'paginated'`, a 2×2 grid per page with prev/next controls. */
export const Paginated: Story = {
  args: { groupCount: 9, columns: 2, mode: 'paginated', pageSize: 4 },
};

/**
 * `pageSize: 1` out of 9 total facets — the single cell per page fills the
 * whole chart area rather than being sized as if it were one of a 5-row
 * grid (the total-entries-based sizing bug this exercises).
 */
export const PaginatedSingleFacet: Story = {
  args: { groupCount: 9, columns: 3, mode: 'paginated', pageSize: 1 },
};

/**
 * `navLayout: 'below'` — prev/next buttons and the page indicator sit in a
 * row beneath the chart instead of overlaid on top of it.
 */
export const PaginatedNavBelow: Story = {
  args: { groupCount: 9, columns: 3, mode: 'paginated', pageSize: 1, navLayout: 'below' },
};

/**
 * Same `setConfiguration({ facet: {...} })` theming mechanism as the rest of the
 * package — switch themes to see the indicator badge and pagination buttons restyle.
 */
export const PaginatedThemeSwitcher: StoryObj = {
  render: () => ({ Component: FacetThemeDemo }),
};

/** Fully custom `indicator` snippet replacing the default badge. */
export const CarouselCustomIndicator: Story = {
  args: { groupCount: 6, columns: 3, mode: 'carousel', visible: 1, customIndicator: true },
};

/** Fully custom `navButton` snippet replacing the default prev/next buttons. */
export const PaginatedCustomButtons: Story = {
  args: { groupCount: 9, columns: 2, mode: 'paginated', pageSize: 4, customNavButton: true },
};
