import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import LegendHorizontalDemo from './LegendHorizontalDemo.svelte';
import LegendNavThemeDemo from './LegendNavThemeDemo.svelte';
import LegendBadgeCustomStyleDemo from './LegendBadgeCustomStyleDemo.svelte';
import type { LegendSection } from '$lib/types/layout/legend';

/**
 * `Legend` renders one or more sections side by side — discrete (swatch +
 * label, for categorical series) or continuous (a gradient bar, for a
 * value-coloured scale like a heatmap). Charts pass it whatever `LegendSection[]`
 * matches their encoding; it never needs to know where the colours came from.
 */
const meta = {
	title: 'Layout/Legend',
	component: LegendLayout,
	tags: ['autodocs']
} satisfies Meta<typeof LegendLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One discrete section: a swatch + label per category. */
export const SingleDiscrete: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicador',
				items: [
					{ name: 'PBI', label: 'PBI', color: '#4f46e5', symbol: 'line' },
					{ name: 'Empleo', label: 'Empleo', color: '#e6580d', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** One continuous section: a gradient bar with min/max labels and ticks. */
export const SingleContinuous: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: 'Porcentaje',
				min: 0,
				max: 0.2,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [0.05, 0.1, 0.15],
				format: (v) => `${(v * 100).toFixed(0)}%`,
				width: 220
			}
		] satisfies LegendSection[]
	}
};

/** Two discrete sections side by side — e.g. one per encoding dimension. */
export const MultipleDiscrete: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Región',
				items: [
					{ name: 'Norte', color: '#4f46e5', symbol: 'square' },
					{ name: 'Sur', color: '#e6580d', symbol: 'square' }
				]
			},
			{
				type: 'discrete',
				title: 'Escenario',
				items: [
					{ name: 'Base', color: '#16a34a', symbol: 'line' },
					{ name: 'Proyectado', color: '#dc2626', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** A discrete and a continuous section mixed in the same legend. */
export const DiscreteAndContinuous: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicador',
				items: [
					{ name: 'PBI', color: '#4f46e5', symbol: 'line' },
					{ name: 'Empleo', color: '#e6580d', symbol: 'line' }
				]
			},
			{
				type: 'continuous',
				title: 'Porcentaje',
				min: 0,
				max: 0.2,
				ticks: [0.1],
				format: (v) => `${(v * 100).toFixed(0)}%`,
				width: 180
			}
		] satisfies LegendSection[]
	}
};

/**
 * `interactive: { enabled: true }` makes each item clickable: click to dim
 * it (and, inside a real chart, its series) via `interactive.disabledStyle`,
 * click again to restore it. Omitting `disabledStyle` falls back to the
 * package's default dim opacity (`cfg.legend.disabledOpacity`).
 *
 * The default `interactive.legendStyle: 'badge'` draws each item as a pill
 * filled with its series color, its symbol icon and label auto-contrasted
 * against that fill, and an eye icon that crosses out alongside the opacity
 * dim once toggled off.
 */
export const InteractiveDiscrete: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicador (click para ocultar)',
				interactive: { enabled: true, disabledStyle: { opacity: 0.15 } },
				items: [
					{ name: 'PBI', label: 'PBI', color: '#4f46e5', symbol: 'line' },
					{ name: 'Empleo', label: 'Empleo', color: '#e6580d', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** `interactive.legendStyle: 'basic'` opts an interactive section back into the plain swatch + label look. */
export const InteractiveDiscreteBasic: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicador (click para ocultar)',
				interactive: { enabled: true, legendStyle: 'basic', disabledStyle: { opacity: 0.15 } },
				items: [
					{ name: 'PBI', label: 'PBI', color: '#4f46e5', symbol: 'line' },
					{ name: 'Empleo', label: 'Empleo', color: '#e6580d', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** `interactive.showIcon: false` drops the symbol icon from a `'badge'` pill, leaving just the label and the eye. */
export const InteractiveDiscreteNoIcon: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicador (click para ocultar)',
				interactive: { enabled: true, showIcon: false, disabledStyle: { opacity: 0.15 } },
				items: [
					{ name: 'PBI', label: 'PBI', color: '#4f46e5', symbol: 'line' },
					{ name: 'Empleo', label: 'Empleo', color: '#e6580d', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/**
 * `.dct-discrete__badge` needs no dedicated config prop to restyle — it's a
 * plain CSS class on the pill, so shadow/border/hover (or anything else) is
 * just a `:global(.dct-discrete__badge) { ... }` rule in a consumer
 * stylesheet, same as targeting any other element you don't own the markup
 * of. Toggle the buttons below to compare.
 */
export const InteractiveDiscreteBadgeCustomCss: StoryObj = {
	render: () => ({ Component: LegendBadgeCustomStyleDemo })
};

/**
 * `interactive: { enabled: true }` on a continuous section adds drag handles
 * at each edge. `mode: 'filter'` (the default) keeps the gradient's original
 * min/max — narrowing the range only excludes values, it never recolors
 * what's left.
 */
export const InteractiveContinuousFilter: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: "Porcentaje (mode: 'filter')",
				interactive: { enabled: true, mode: 'filter' },
				min: 0,
				max: 0.2,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [0.05, 0.1, 0.15],
				format: (v) => `${(v * 100).toFixed(0)}%`,
				width: 220
			}
		] satisfies LegendSection[]
	}
};

/** Same drag interaction, but `mode: 'rescale'` reprojects the ramp onto the narrowed range. */
export const InteractiveContinuousRescale: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: "Porcentaje (mode: 'rescale')",
				interactive: { enabled: true, mode: 'rescale' },
				min: 0,
				max: 0.2,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [0.05, 0.1, 0.15],
				format: (v) => `${(v * 100).toFixed(0)}%`,
				width: 220
			}
		] satisfies LegendSection[]
	}
};

/** Four discrete items in two columns, to show the `columns` wrap. */
export const ManyItemsInColumns: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Ambientes',
				columns: 2,
				items: [
					{ name: '1', color: '#e0e7ff', symbol: 'square' },
					{ name: '2', color: '#a5b4fc', symbol: 'square' },
					{ name: '3', color: '#6366f1', symbol: 'square' },
					{ name: '4', color: '#4f46e5', symbol: 'square' }
				]
			}
		] satisfies LegendSection[]
	}
};

// ── layout: { type: 'horizontal' } ──────────────────────────────────────────
// A discrete section's items default to a single-column grid (`layout: {
// type: 'vertical' }`, stacking one per row). `layout: { type: 'horizontal' }`
// flows them left to right instead, wrapping to new rows as the container
// narrows — and once wrapped rows exceed `maxRows` (default 1), the section
// paginates rather than growing taller, surfacing small prev/next arrows.

/**
 * `layout: { type: 'horizontal' }` with few enough items to fit on one row —
 * no pagination arrows appear, since wrapped rows never exceed `maxRows`.
 */
export const HorizontalLayout: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicador',
				layout: { type: 'horizontal' },
				items: [
					{ name: 'PBI', color: '#4f46e5', symbol: 'line' },
					{ name: 'Empleo', color: '#e6580d', symbol: 'line' },
					{ name: 'Inflación', color: '#16a34a', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/**
 * The same `layout: { type: 'horizontal' }` section as `HorizontalLayout`,
 * now narrower than its items need. `maxRows` defaults to 1, so as soon as
 * items would wrap to a second row the section paginates instead — one
 * jurisdicción visible per page, prev/next arrows to browse the rest.
 */
export const HorizontalPaginatedDefaultMaxRows: StoryObj = {
	render: () => ({
		Component: LegendHorizontalDemo,
		props: { itemCount: 24, maxRows: 1, width: 800 }
	})
};

/**
 * `maxRows: 2` — the section grows to two wrapped rows before it paginates,
 * so each page holds two rows' worth of items (the last page may hold fewer,
 * however many rows are left over). This is the exact case reported: a full
 * discrete legend whose items wrap into several rows, capped to a page height
 * instead of pushing the chart down.
 */
export const HorizontalPaginatedTwoRows: StoryObj = {
	render: () => ({
		Component: LegendHorizontalDemo,
		props: { itemCount: 24, maxRows: 2, width: 460 }
	})
};

/** `interactive: true` still click-to-toggles items on whichever page is showing. */
export const HorizontalPaginatedInteractive: StoryObj = {
	render: () => ({
		Component: LegendHorizontalDemo,
		props: { itemCount: 24, maxRows: 1, width: 460, interactive: true }
	})
};

/** Fully custom `navButton` snippet replacing the section's default arrow buttons. */
export const HorizontalPaginatedCustomNavButton: StoryObj = {
	render: () => ({
		Component: LegendHorizontalDemo,
		props: { itemCount: 24, maxRows: 1, width: 460, customNavButton: true }
	})
};

/**
 * Same `setConfiguration({ legend: { navButton: {...} } })` theming mechanism
 * as the rest of the package — switch themes to see the pagination arrows
 * restyle (compare with `Layout/Facets`' `PaginatedThemeSwitcher`, which
 * themes the equivalent facet buttons).
 */
export const HorizontalPaginatedNavThemeSwitcher: StoryObj = {
	render: () => ({ Component: LegendNavThemeDemo })
};