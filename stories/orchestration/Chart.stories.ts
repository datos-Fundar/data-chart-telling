import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Interchange from './Interchange.svelte';
import Napoleon from './Napoleon.svelte';

/**
 * `BaseChart` is the plot-agnostic orchestrator that the LineChart / BarChart /
 * HeatmapChart kinds are built on. These stories exercise it directly (through a
 * wrapper that owns the demo state) to show that container + timeline + facet +
 * legend are reusable across any leaf plot.
 */
const meta = {
	title: 'Orchestration/BaseChart (orchestrator)',
	component: Interchange,
	parameters: { layout: 'padded' }
} satisfies Meta<typeof Interchange>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InterchangeablePlots: Story = {};

/**
 * `BaseChart`'s `plot` snippet doesn't require one of this package's own plot
 * kinds — anything that accepts `{ data, width, height }` fits. Here it's
 * svelteplot's raw `<Plot>`, hand-assembled with marks (`Geo`, `Trail`,
 * blur-masked `<defs>`) this package doesn't wrap at all, yet it still gets a
 * title/subtitle/caption, a discrete legend and a scrubbable timeline for
 * free from the same chrome every other chart in this file uses.
 */
export const SvelteplotCompatibility: Story = {
	render: () => ({ Component: Napoleon })
};
