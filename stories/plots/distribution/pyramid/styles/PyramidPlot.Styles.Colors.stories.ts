import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { AGE_GROUPS, POPULATION_BY_AGE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Distribution/PyramidPlot/Styles/Colors',
	component: PyramidPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 520
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'PyramidPlot' } }
	}
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const DATA = POPULATION_BY_AGE.filter((d) => d.year === 2022);

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No style overrides - the plot uses the configured theme defaults.
 * The palette chooses colors for left/right (female/male) automatically.
 */
export const Default: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } }
	}
};

/**
 * Custom colors via `scales.color` - a `Record<string, string>` scheme maps
 * each series *name* directly to a color, overriding the default palette
 * cycling. Works regardless of which side a name lands on, and however many
 * series exist (not limited to exactly two).
 */
export const CustomColorsViaScalesColor: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: {
			y: { domain: AGE_GROUPS },
			color: { scheme: { Female: '#ff6b9d', Male: '#4ecdc4' } }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Custom colors via `segments` - keying a segment group by series name and
 * setting its own `style.fill` overrides that one series' color directly,
 * the same mechanism used for per-series styling everywhere else in this
 * package (see `Plots/PyramidPlot/Segments`).
 */
export const CustomColorsViaSegments: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		segments: {
			Female: [{ styles: { fill: '#9c27b0' } }],
			Male: [{ styles: { fill: '#ff9800' } }]
		}
	}
};
