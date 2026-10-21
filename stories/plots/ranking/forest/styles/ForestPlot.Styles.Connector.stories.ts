import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import { INFLATION_RANGES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.connector` styles each stem: its `width`, `color` and `opacity`, and its
// `caps` - a short tick across each end, on by default for a forest plot - with the
// length they are given or the configuration's `connector.capLength`.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Styles/Connector',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 480,
		data: INFLATION_RANGES,
		x: 'mean',
		y: 'period',
		lower: 'min',
		upper: 'max',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `caps: false` leaves the stems open at their ends. */
export const NoCaps: Story = {
	args: {
		styles: { connector: { caps: false } } satisfies ConnectorBasedStylesConfig
	}
};

/** `caps: { length }` sets how long the caps are, in px. */
export const LongCaps: Story = {
	args: {
		styles: { connector: { caps: { length: 16 } } } satisfies ConnectorBasedStylesConfig
	}
};

/** A thicker, fainter stem makes the dots stand out. */
export const ThickStems: Story = {
	args: {
		styles: {
			connector: { width: 6, opacity: 0.35, caps: false }
		} satisfies ConnectorBasedStylesConfig
	}
};
