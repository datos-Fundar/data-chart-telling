import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { isAntarcticPart, provinceName } from '../../common/argentinaMainland';
import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import { WIND_VECTORS } from '$datasets';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `vector` marker (svelteplot's own `Vector`) - an arrow/spike per row,
// sized by `length` and oriented by `rotate`. Geo-only, so `GeoPlot` stands
// in for the empty canvas the rest of `Markers/*` uses - see
// the other stories in this file for every `shape` variant.

const meta = {
	title: 'Markers/Vector',
	component: GeoPlot,
	tags: ['autodocs'],
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;

// Each story renders its own plot (the same marker works on any plot kind), so the
// host, its base args and its story type are declared per host below.
type GeoPlotStory = StoryObj<typeof GeoPlot>;
const renderGeoPlot: GeoPlotStory['render'] = (args) => ({ Component: GeoPlot, props: args });

const GEO_PLOT_ARGS = {
	width: 940,
	height: 500,
	data: ARGENTINA_PROVINCES,
	featureId: provinceName,
	excludeParts: isAntarcticPart,
	coordinates: { projection: { type: 'mercator', domain: 'data' } },
	scales: { length: { range: [10, 70] } },
	styles: { fill: '#e2e8f0', stroke: '#94a3b8' }
} satisfies GeoPlotStory['args'];

/** `length`/`rotate` accessors size/orient each arrow from the row's own magnitude/direction fields. */
export const Basic: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction'
			}
		] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** Basic arrows - no `shape` set, so each defaults to `'arrow-filled'`. `length`/`rotate` accessors size/orient each arrow from the row's own magnitude/direction fields. */
export const DefaultFilledArrows: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction'
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** Open arrow - `shape: 'arrow'` draws a thin stroked shaft with an open arrowhead, instead of the default filled triangle. */
export const OpenArrow: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction',
				shape: 'arrow'
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** Spike shape - `shape: 'spike'` draws a thin triangular spike instead of an arrowhead, anchored at its base. */
export const SpikeShape: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction',
				shape: 'spike',
				anchor: 'start',
				styles: { stroke: '#7c3aed' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** Filled arrow, custom color - `shape: 'arrow-filled'` (the default) with a custom fill/stroke instead of the theme's own. */
export const CustomFilledArrow: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'vector',
				data: WIND_VECTORS,
				x: 'lon',
				y: 'lat',
				length: 'magnitude',
				rotate: 'direction',
				shape: 'arrow-filled',
				styles: { fill: '#0891b2', stroke: '#164e63', strokeWidth: 1 }
			}
		] satisfies GeoMarkersConfig[]
	}
};
