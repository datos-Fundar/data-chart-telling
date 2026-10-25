import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { diverseCountries } from '$datasets';

/**
 * `facet: { by, columns }` - every facet renders at once, arranged in a
 * `columns`-wide responsive grid.
 */
const meta = {
	title: 'Layout/Facets/Grid',
	component: BarPlot,
	parameters: { docs: { source: { name: 'BarPlot' } } },
	tags: ['autodocs'],
	args: { width: 720, height: 480, x: 'year', y: 'gdp' },
	argTypes: {
		width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 300, max: 800, step: 20 } },
		data: { control: false },
		facet: { control: false }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two countries, two columns - side by side. */
export const TwoSideBySide: Story = {
	args: {
		data: diverseCountries(2),
		facet: { by: 'country', columns: 2 }
	}
};

/** Two countries, one column - stacked vertically. */
export const TwoStacked: Story = {
	args: {
		data: diverseCountries(2),
		facet: { by: 'country', columns: 1 }
	}
};

/** Four countries in a 2×2 grid. */
export const Four: Story = {
	args: {
		data: diverseCountries(4),
		facet: { by: 'country', columns: 2 }
	}
};

/** Six countries in a 3×2 grid. */
export const Six: Story = {
	args: {
		data: diverseCountries(6),
		facet: { by: 'country', columns: 3 }
	}
};

/** Nine countries in a 3×3 grid. */
export const Nine: Story = {
	args: {
		data: diverseCountries(9),
		facet: { by: 'country', columns: 3 }
	}
};

/** Nine countries in a 3×3 grid. */
export const OuterAxes: Story = {
	args: {
		data: diverseCountries(9),
		facet: { by: 'country', columns: 3, axes: 'outer' }
	}
};
