import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An `image` marker (svelteplot's own `Image`) - one image centered on each
// row's `x`/`y`. `src` is a URL or a per-row function; `width`/`height` are
// pixels (default 20), `r` a per-row circular clip radius that overrides both.
// The demo art is generated inline as data URIs so the story needs no network.

const REGION_COLORS: Record<string, string> = {
	Americas: '#ef4444',
	Europe: '#3b82f6',
	Asia: '#eab308',
	Africa: '#22c55e'
};

/** A small badge SVG (colored disc + initial) as a data URI. */
const badge = (d: { country: string; region: string }) =>
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">` +
			`<circle cx="20" cy="20" r="19" fill="${REGION_COLORS[d.region]}"/>` +
			`<text x="20" y="27" font-size="20" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#fff">${d.country[0]}</text>` +
			`</svg>`
	);

const meta = {
	title: 'Markers/Image',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy'
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

/** A per-row `src`, at the default 20px size. */
export const Basic: Story = {
	args: {
		markers: [
			{ type: 'image', x: 'gdpPerCapita', y: 'lifeExpectancy', src: badge }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `width`/`height` size every image; `title` adds a native hover tooltip. */
export const SizedWithTitle: Story = {
	args: {
		markers: [
			{
				type: 'image',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				src: badge,
				width: 32,
				height: 32,
				title: (d: { country: string }) => d.country
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `r` clips each image to a circle and sets its size from the row - here, scaled by svelteplot's own `r` scale from population. */
export const ClippedByRadius: Story = {
	args: {
		markers: [
			{
				type: 'image',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				src: badge,
				r: 'population'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
