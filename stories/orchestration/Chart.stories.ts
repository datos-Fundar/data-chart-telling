import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Interchange from './Interchange.svelte';

/**
 * `Chart` is the plot-agnostic orchestrator that the LineChart / BarChart /
 * HeatmapChart kinds are built on. These stories exercise it directly (through a
 * wrapper that owns the demo state) to show that container + timeline + facet +
 * legend are reusable across any leaf plot.
 */
const meta = {
  title: 'Orchestration/Chart (orchestrator)',
  component: Interchange,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Interchange>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InterchangeablePlots: Story = {};
