import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import LegendBadgeCustomStyleDemo from './LegendBadgeCustomStyleDemo.svelte';
import { renderSource } from '../../common/docsSource';
import type { LegendSection } from '$lib/types/layout/legend';

/** Click-to-toggle (discrete) and drag-to-narrow (continuous) interactivity. */
const meta = {
	title: 'Layout/Legend/Interactive',
	component: LegendLayout,
	tags: ['autodocs'],
	parameters: {
		docs: { source: { name: 'LegendLayout' } }
	}
} satisfies Meta<typeof LegendLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `interactive: { enabled: true }` makes each item clickable: click to dim
 * it (and, inside a real chart, its series) via `interactive.disabled: {
 * mode: 'style', style }`, click again to restore it. Omitting `style` falls
 * back to the package's default dim opacity (`cfg.legend.disabledOpacity`).
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
				interactive: { enabled: true, disabled: { mode: 'style', style: { opacity: 0.15 } } },
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
				interactive: {
					enabled: true,
					legendStyle: 'basic',
					disabled: { mode: 'style', style: { opacity: 0.15 } }
				},
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
				interactive: {
					enabled: true,
					showIcon: false,
					disabled: { mode: 'style', style: { opacity: 0.15 } }
				},
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
	render: () => ({ Component: LegendBadgeCustomStyleDemo }),
	parameters: {
		docs: {
			source: {
				code: renderSource('LegendLayout', {
					sections: [
						{
							type: 'discrete',
							title: 'Indicador (click para ocultar)',
							interactive: { enabled: true, disabled: { mode: 'style', style: { opacity: 0.15 } } },
							items: [
								{ name: 'PBI', label: 'PBI', color: '#4f46e5', symbol: 'line' },
								{ name: 'Empleo', label: 'Empleo', color: '#e6580d', symbol: 'line' },
								{ name: 'Inflación', label: 'Inflación', color: '#16a34a', symbol: 'line' }
							]
						}
					]
				})
			}
		}
	}
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
