import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Interchange from './wrappers/Interchange.svelte';

/**
 * `Chart` is the plot-agnostic orchestrator that the LineChart / BarChart /
 * HeatmapChart kinds are built on. These stories exercise it directly (through a
 * wrapper that owns the demo state) to show that container + timeline + facet +
 * legend are reusable across any leaf plot.
 */
const meta = {
  title: 'Charts/Chart (orchestrator)',
  component: Interchange,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Interchange>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Same chrome, interchangeable leaf plot. Flip between LinePlot, BarPlot and
 * HeatmapPlot — the surrounding container/timeline/facet/legend never changes.
 */
export const InterchangeablePlots: Story = {};
