import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `box` marker (svelteplot's own `BoxX`/`BoxY`) - quartiles/median/outliers
// per category. Orientation is automatic: `BoxX` when `x` is the quantitative
// axis and `y` the categorical one, `BoxY` otherwise. `x`/`y` map straight
// onto the plot's own axes either way. `bar`/`rule`/`dot`/
// `tickMedian`/`tickMinMax` are svelteplot's own per-sub-mark options,
// forwarded as-is - there's no shared `styles` object for `box` (unlike
// every other marker here). Instead, `bar` is the shared style baseline every
// other sub-mark inherits from by default (fill/fillOpacity/stroke/
// strokeWidth/strokeOpacity/opacity, plus insetLeft/insetRight averaged into
// each tick's own `inset`) - change `bar.fillOpacity` and `rule`/`dot`/both
// ticks fade along with it, unless that sub-mark's own options object
// overrides the specific field. `tickMedian`'s own `stroke` is the one
// exception: it defaults to whichever of white/black contrasts more (WCAG)
// against `bar.fill` instead of matching it, so the median stands out while
// `rule`/`dot`/`tickMinMax` blend into the box the way a traditional box
// plot's do. `tickMedian`/`tickMinMax` both default to *shown* even when left
// unset (this package's own default - svelteplot itself defaults
// `tickMinMax` off). `bar.fill` itself defaults to this package's own
// `cfg.palette[0]` when unset. Hosted on `ScatterPlot` - a more natural fit
// for country-level data than a line chart, even though the marker itself
// doesn't depend on the host kind. Demoed on an empty canvas with a
// categorical axis so only the marker itself is on screen - same convention
// as `Markers/Bar` (an empty host avoids drawing an unrelated default series
// through the marker's own, separately-grouped rows).

const REGION_DOMAIN = ['Americas', 'Europe', 'Asia', 'Africa'];

const meta = {
	title: 'Markers/Box',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'region',
		y: 'gdpPerCapita',
		scales: { x: { domain: REGION_DOMAIN }, y: { domain: [0, 110] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default orientation (`BoxY`) - GDP per capita distribution by region. No `bar`/tick options at all: the fill falls back to this package's own default (`cfg.palette[0]`), and both ticks show at their own default styling (median contrasting, min/max matching the fill). */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** A quantitative `x` with a categorical `y` picks `BoxX` - the same data, laid out horizontally instead. */
export const Horizontal: Story = {
	args: {
		x: 'gdpPerCapita',
		y: 'region',
		scales: { x: { domain: [0, 110] }, y: { type: 'band', domain: REGION_DOMAIN } },
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'gdpPerCapita',
				y: 'region'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `tickMinMax` as an options object adds `strokeWidth: 3` on top of its own default styling (matching `bar.fill`), independent of the median tick's own default styling. */
export const WithMinMaxTicks: Story = {
	args: {
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				tickMinMax: { strokeWidth: 3 },
				bar: { fill: '#7c3aed' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `tickMedian` and `tickMinMax` styled independently on top of their own defaults - the median tick is explicitly thicker (`strokeWidth: 3`, still auto-contrasting) to stand out from the min/max ticks (plain `true`, at their own default width, matching `bar.fill`). */
export const WithMedianAndMinMaxTicks: Story = {
	args: {
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				tickMedian: { strokeWidth: 3 },
				tickMinMax: true,
				bar: { fill: '#7c3aed' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `bar: { insetLeft, insetRight }` (pixels - svelteplot's own unit for its
 * `bar` option) narrows the IQR box within its own category band, leaving
 * visible padding between adjacent boxes without touching the band scale's
 * own spacing. `tickMedian`/`tickMinMax` narrow along with it automatically -
 * both default their own `inset` from `bar.insetLeft`/`insetRight` (averaged
 * into one symmetric value) unless their own options object sets one
 * explicitly. Neither tick needs its own `stroke` either - both default
 * against `bar.fill` on their own.
 */
export const CustomWidth: Story = {
	args: {
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				bar: { fill: '#7c3aed', insetLeft: 40, insetRight: 40 },
				tickMedian: { strokeWidth: 3 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `bar.fillOpacity` cascades to every other sub-mark by default - `rule`'s
 * `strokeOpacity`, `dot`'s own `fillOpacity`, and both ticks' `strokeOpacity`
 * all fade to match, with no field set anywhere except on `bar` itself.
 */
export const OpacityCascade: Story = {
	args: {
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				bar: { fill: '#7c3aed', fillOpacity: 0.3 },
				tickMinMax: { strokeOpacity: 1 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `dot` styles the outlier points (rows outside 1.5× the IQR - here, Norway's
 * GDP per capita stands out within Europe) - an explicit `fill` overrides the
 * default of matching `bar.fill`, flagging outliers in their own color
 * instead of blending into the box. `fillOpacity: 1` also overrides its own
 * default of inheriting `bar.fillOpacity` (0.3 here) - without it, the
 * outlier would render as a translucent orange instead of a solid one.
 */
export const OutlierDotStyle: Story = {
	args: {
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				dot: { fill: '#f97316', fillOpacity: 1 },
				bar: { fill: '#7c3aed', fillOpacity: 0.3 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `fill: null` gives outlier dots a hollow marker with just a stroke -
 * **not** `fill: 'none'`: svelteplot's own color-scale check
 * (`isColorOrNull`) only recognizes real CSS colors or the literal value
 * `null` as "don't scale this"; the *string* `'none'` isn't one of those, so
 * it gets run through the plot's own color scale instead of staying literal,
 * landing on an arbitrary scale color rather than "no fill". `fillOpacity: 0`
 * is an equally valid alternative.
 */
export const HollowOutlierDots: Story = {
	args: {
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				dot: { fill: null, stroke: '#7c3aed', strokeWidth: 2 },
				bar: { fill: '#7c3aed', fillOpacity: 0.3 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * `sort: '-median'` (descending) reorders the box marker's own internal
 * row/element order - its own doc: "optional grouping sort; defaults to the
 * median". That alone doesn't reorder the *axis*: the category axis's own
 * left-to-right order always comes from the host plot's shared `scales.x`
 * (resolved once, independently of any marker - the same reason this whole
 * gallery pins `scales.x.domain` to begin with, since the host canvas is
 * otherwise empty). To actually see boxes laid out by descending median,
 * `scales.x.domain` is pinned here to that same order by hand (Europe,
 * Americas, Asia, Africa - the real descending-median order for this
 * dataset) rather than left to reflect `sort` automatically.
 */
export const CustomSort: Story = {
	args: {
		scales: { x: { domain: ['Europe', 'Americas', 'Asia', 'Africa'] }, y: { domain: [0, 110] } },
		markers: [
			{
				type: 'box',
				data: COUNTRIES,
				x: 'region',
				y: 'gdpPerCapita',
				sort: '-median',
				bar: { fill: '#7c3aed' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
