import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlotFacetDemo from './GeoPlotFacetDemo.svelte';

/**
 * `GeoPlot`'s tile-layer basemap inside a faceted grid — every row × column
 * combination up to 3×3. Regression coverage for `clampBoundsToWorld` (see
 * `$lib/plots/utils/tiles`): a cell's *aspect ratio*, not its raw size,
 * determines how far the letterboxed margin around a tall/narrow country
 * like Argentina reaches once inverted back to lon/lat — and that reach must
 * never wrap all the way around to the data's own antipodal region (e.g.
 * Argentina's real-world regression: a 2×2 grid showing Australia). Check
 * every story here visually before publishing a change to tile-layer
 * sizing/clamping.
 */
const meta = {
  title: 'Plots/GeoPlot/Facet',
  component: GeoPlotFacetDemo,
  tags: ['autodocs'],
  args: { width: 900, height: 600 },
  argTypes: {
    width: { control: { type: 'range', min: 400, max: 1200, step: 20 } },
    height: { control: { type: 'range', min: 300, max: 900, step: 20 } },
    groupCount: { control: false },
    columns: { control: false },
  },
} satisfies Meta<typeof GeoPlotFacetDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 1 row × 1 column — a single map, no facet grid at all. */
export const Rows1Cols1: Story = { args: { groupCount: 1, columns: 1 } };

/** 1 row × 2 columns — two maps side by side. */
export const Rows1Cols2: Story = { args: { groupCount: 2, columns: 2 } };

/** 2 rows × 1 column — two maps stacked vertically. */
export const Rows2Cols1: Story = { args: { groupCount: 2, columns: 1 } };

/** 1 row × 3 columns. */
export const Rows1Cols3: Story = { args: { groupCount: 3, columns: 3 } };

/** 3 rows × 1 column. */
export const Rows3Cols1: Story = { args: { groupCount: 3, columns: 1 } };

/** 2 rows × 2 columns — the configuration that has broken repeatedly. */
export const Rows2Cols2: Story = { args: { groupCount: 4, columns: 2 } };

/** 2 rows × 3 columns. */
export const Rows2Cols3: Story = { args: { groupCount: 6, columns: 3 } };

/** 3 rows × 2 columns. */
export const Rows3Cols2: Story = { args: { groupCount: 6, columns: 2 } };

/** 3 rows × 3 columns. */
export const Rows3Cols3: Story = { args: { groupCount: 9, columns: 3 } };
