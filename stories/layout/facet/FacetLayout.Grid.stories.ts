import type { Meta, StoryObj } from '@storybook/svelte-vite';
import FacetDemo, { dataForGroupCount } from './FacetDemo.svelte';
import { renderSource } from '../../common/docsSource';

// `FacetDemo` renders through a wrapper, so `parameters.docs.source.code`
// overrides the "show code" panel with the real `<FacetLayout>` call via
// `renderSource` — see `stories/common/docsSource.ts`.
function gridSource(groupCount: number, columns: number) {
  return renderSource('FacetLayout', { data: dataForGroupCount(groupCount), by: 'group', columns });
}

/**
 * `mode: 'grid'` (the default) — every facet renders at once, arranged in a
 * `columns`-wide responsive grid.
 */
const meta = {
  title: 'Layout/Facets/Grid',
  component: FacetDemo,
  tags: ['autodocs'],
  args: { width: 720, height: 480 },
  argTypes: {
    width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 300, max: 800, step: 20 } },
    groupCount: { control: false },
    columns: { control: false },
  },
} satisfies Meta<typeof FacetDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two groups, two columns — side by side. */
export const TwoSideBySide: Story = {
  args: { groupCount: 2, columns: 2 },
  parameters: { docs: { source: { code: gridSource(2, 2) } } },
};

/** Two groups, one column — stacked vertically. */
export const TwoStacked: Story = {
  args: { groupCount: 2, columns: 1 },
  parameters: { docs: { source: { code: gridSource(2, 1) } } },
};

/** Four groups in a 2×2 grid. */
export const Four: Story = {
  args: { groupCount: 4, columns: 2 },
  parameters: { docs: { source: { code: gridSource(4, 2) } } },
};

/** Six groups in a 3×2 grid. */
export const Six: Story = {
  args: { groupCount: 6, columns: 3 },
  parameters: { docs: { source: { code: gridSource(6, 3) } } },
};

/** Nine groups in a 3×3 grid. */
export const Nine: Story = {
  args: { groupCount: 9, columns: 3 },
  parameters: { docs: { source: { code: gridSource(9, 3) } } },
};
