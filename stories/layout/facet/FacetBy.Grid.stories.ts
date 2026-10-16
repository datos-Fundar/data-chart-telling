import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { facetGroups } from '../../data/facet-groups';

/**
 * `facet: { by, columns }` - every facet renders at once, arranged in a
 * `columns`-wide responsive grid.
 */
const meta = {
	title: 'Layout/Facets/Grid',
	component: BarPlot,
	parameters: { docs: { source: { name: 'BarPlot' } } },
	tags: ['autodocs'],
	args: { width: 720, height: 480, x: 'category', y: 'value' },
	argTypes: {
		width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 300, max: 800, step: 20 } },
		data: { control: false },
		facet: { control: false }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two groups, two columns - side by side. */
export const TwoSideBySide: Story = {
	args: {
		data: facetGroups(2),
		facet: { by: 'group', columns: 2 }
	}
};

/** Two groups, one column - stacked vertically. */
export const TwoStacked: Story = {
	args: {
		data: facetGroups(2),
		facet: { by: 'group', columns: 1 }
	}
};

/** Four groups in a 2×2 grid. */
export const Four: Story = {
	args: {
		data: facetGroups(4),
		facet: { by: 'group', columns: 2 }
	}
};

/** Six groups in a 3×2 grid. */
export const Six: Story = {
	args: {
		data: facetGroups(6),
		facet: { by: 'group', columns: 3 }
	}
};

/** Nine groups in a 3×3 grid. */
export const Nine: Story = {
	args: {
		data: facetGroups(9),
		facet: { by: 'group', columns: 3 }
	}
};

/** Nine groups in a 3×3 grid. */
export const OuterAxes: Story = {
	args: {
		data: facetGroups(9),
		facet: { by: 'group', columns: 3, axes: 'outer' }
	}
};
