import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { GeoSegmentStyle } from '$lib/types/plots/segments/common';
import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// GeoPlot's `segments` uses the same `Segments`/`Segment` types every other
// plot kind does, but keyed by *feature id* instead of series name - e.g.
// `segments['Buenos Aires']` styles just that one feature, the same way
// `segments.female` styles a whole series elsewhere. A feature is atomic (no
// x/y sub-ranges), so every `segments` entry here is a flat style patch, not
// an `areas`-restricted one.

const meta = {
	title: 'Plots/GeoPlot/Segments',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: ARGENTINA_PROVINCES,
		featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
		coordinates: { projection: { type: argentinaBicontinental } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		scales: { control: false },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Highlight one feature by id - `segments['Buenos Aires']` styles just that
 * province; `default` sets the baseline every other feature falls back to.
 */
export const HighlightOneProvince: Story = {
	args: {
		segments: {
			'Buenos Aires': [{ styles: { fill: 'tomato' } }],
			default: [{ styles: { fill: '#cbd5e1', fillOpacity: 0.6 } }]
		} satisfies SegmentsConfig<GeoSegmentStyle>
	}
};

/** Highlight several features - one entry per feature id, each with its own style. */
export const HighlightSeveralProvinces: Story = {
	args: {
		segments: {
			'Buenos Aires': [{ styles: { fill: '#1d4ed8' } }],
			Córdoba: [{ styles: { fill: '#f59e0b' } }],
			Mendoza: [{ styles: { fill: '#16a34a' } }],
			default: [{ styles: { fill: '#e2e8f0' } }]
		} satisfies SegmentsConfig<GeoSegmentStyle>
	}
};

/**
 * `default` merges with a feature-specific entry - the feature-specific
 * style only needs to override what differs (here just `fillOpacity`); the
 * stroke set on `default` still applies.
 */
export const DefaultMergesWithFeatureStyle: Story = {
	args: {
		segments: {
			default: [{ styles: { fill: '#94a3b8', stroke: '#1e293b', strokeWidth: 1 } }],
			Mendoza: [{ styles: { fillOpacity: 0.3 } }]
		} satisfies SegmentsConfig<GeoSegmentStyle>
	}
};

/** Border emphasis - a feature-specific `stroke`/`strokeWidth` draws attention to one province's outline without changing its fill. */
export const HighlightWithStroke: Story = {
	args: {
		segments: {
			Chubut: [{ styles: { stroke: '#dc2626', strokeWidth: 3 } }],
			default: [{ styles: { fill: '#e2e8f0', stroke: '#94a3b8', strokeWidth: 0.5 } }]
		} satisfies SegmentsConfig<GeoSegmentStyle>
	}
};
