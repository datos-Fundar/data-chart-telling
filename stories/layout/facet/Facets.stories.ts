import type { Meta, StoryObj } from '@storybook/svelte-vite';
import FacetDemo from './FacetDemo.svelte';

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
