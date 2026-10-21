import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { AreaStyle } from '$lib/types/plots/styling';
import { HEIGHT_DENSITY } from '../../../data/height-density';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyles part of a series' area: each segment's `areas` selects
// the rows it covers by x or y range, and its `styles` fill just that part.
// Keyed by series name (here `male`/`female`, the `color: 'sex'` groups).

const meta = {
	title: 'Plots/Evolution/AreaPlot/Segments',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHT_DENSITY,
		x: 'height',
		y: 'density',
		color: 'sex'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Men's tail above 185 cm in a stronger fill - the part of the curve past that height. */
export const TailHighlight: Story = {
	args: {
		segments: {
			male: [{ areas: [{ x: { from: 185 } }], styles: { fill: '#dc2626', fillOpacity: 0.6 } }]
		} satisfies SegmentsConfig<AreaStyle>
	}
};

/** Each series gets its own segment styles, so the male and female areas can differ in the same range. */
export const SeriesSpecific: Story = {
	args: {
		segments: {
			male: [{ areas: [{ x: { to: 165 } }], styles: { fill: '#0f766e' } }],
			female: [{ areas: [{ x: { from: 165 } }], styles: { fill: '#f59e0b' } }]
		} satisfies SegmentsConfig<AreaStyle>
	}
};
