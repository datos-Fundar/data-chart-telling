import type { Meta, StoryObj } from '@storybook/svelte-vite';
import FacetDemo, { dataForGroupCount } from './FacetDemo.svelte';
import FacetThemeDemo from './FacetThemeDemo.svelte';
import { renderSource } from '../../common/docsSource';

// `FacetDemo` renders through a wrapper, so `parameters.docs.source.code`
// overrides the "show code" panel with the real `<FacetLayout>` call via
// `renderSource` — see `stories/common/docsSource.ts`.
function paginatedSource(columns: number, pageSize: number, navLayout?: 'below') {
  return renderSource('FacetLayout', {
    data: dataForGroupCount(9),
    by: 'group',
    columns,
    mode: 'paginated',
    pageSize,
    ...(navLayout ? { navLayout } : {}),
  });
}

/** `mode: 'paginated'` — pages through the grid in fixed-size chunks with prev/next controls. */
const meta = {
  title: 'Layout/Facets/Paginated',
  component: FacetDemo,
  tags: ['autodocs'],
  args: { width: 720, height: 480, groupCount: 9, columns: 3, mode: 'paginated' as const },
  argTypes: {
    width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 300, max: 800, step: 20 } },
    groupCount: { control: false },
    columns: { control: false },
    mode: { control: false },
    pageSize: { control: { type: 'range', min: 1, max: 9, step: 1 } },
    navLayout: { control: { type: 'radio' }, options: ['overlay', 'below'] },
  },
} satisfies Meta<typeof FacetDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A 2×2 grid per page with prev/next controls. */
export const Default: Story = {
  args: { columns: 2, pageSize: 4 },
  parameters: { docs: { source: { code: paginatedSource(2, 4) } } },
};

/**
 * `pageSize: 1` out of 9 total facets — the single cell per page fills the
 * whole chart area rather than being sized as if it were one of a 5-row
 * grid (the total-entries-based sizing bug this exercises).
 */
export const SingleFacet: Story = {
  args: { pageSize: 1 },
  parameters: { docs: { source: { code: paginatedSource(3, 1) } } },
};

/**
 * `navLayout: 'below'` — prev/next buttons and the page indicator sit in a
 * row beneath the chart instead of overlaid on top of it.
 */
export const NavBelow: Story = {
  args: { pageSize: 1, navLayout: 'below' },
  parameters: { docs: { source: { code: paginatedSource(3, 1, 'below') } } },
};

/**
 * Same `setConfiguration({ facet: {...} })` theming mechanism as the rest of
 * the package — switch themes to see the indicator badge and pagination
 * buttons restyle.
 */
export const ThemeSwitcher: StoryObj = {
  render: () => ({ Component: FacetThemeDemo }),
};

/** Fully custom `navButton` snippet replacing the default prev/next buttons. */
export const CustomButtons: Story = {
  args: { columns: 2, pageSize: 4, customNavButton: true },
  parameters: { docs: { source: { code: paginatedSource(2, 4) } } },
};
