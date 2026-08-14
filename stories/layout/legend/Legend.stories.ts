import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
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
  tags: ['autodocs'],
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
          { name: 'Empleo', label: 'Empleo', color: '#e6580d', symbol: 'line' },
        ],
      },
    ] satisfies LegendSection[],
  },
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
        width: 220,
      },
    ] satisfies LegendSection[],
  },
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
          { name: 'Sur', color: '#e6580d', symbol: 'square' },
        ],
      },
      {
        type: 'discrete',
        title: 'Escenario',
        items: [
          { name: 'Base', color: '#16a34a', symbol: 'line' },
          { name: 'Proyectado', color: '#dc2626', symbol: 'line' },
        ],
      },
    ] satisfies LegendSection[],
  },
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
          { name: 'Empleo', color: '#e6580d', symbol: 'line' },
        ],
      },
      {
        type: 'continuous',
        title: 'Porcentaje',
        min: 0,
        max: 0.2,
        ticks: [0.1],
        format: (v) => `${(v * 100).toFixed(0)}%`,
        width: 180,
      },
    ] satisfies LegendSection[],
  },
};

/**
 * `interactive: true` makes each item clickable — click to dim it (and,
 * inside a real chart, its series) via `disabledStyle`; click again to
 * restore it. Omitting `disabledStyle` falls back to the package's default
 * dim opacity (`cfg.legend.disabledOpacity`).
 */
export const InteractiveDiscrete: Story = {
  args: {
    sections: [
      {
        type: 'discrete',
        title: 'Indicador (click para ocultar)',
        interactive: true,
        disabledStyle: { opacity: 0.15 },
        items: [
          { name: 'PBI', label: 'PBI', color: '#4f46e5', symbol: 'line' },
          { name: 'Empleo', label: 'Empleo', color: '#e6580d', symbol: 'line' },
        ],
      },
    ] satisfies LegendSection[],
  },
};

/**
 * `interactive: true` on a continuous section adds drag handles at each
 * edge. `mode: 'filter'` (the default) keeps the gradient's original
 * min/max — narrowing the range only excludes values, it never recolors
 * what's left.
 */
export const InteractiveContinuousFilter: Story = {
  args: {
    sections: [
      {
        type: 'continuous',
        title: "Porcentaje (mode: 'filter')",
        interactive: true,
        mode: 'filter',
        min: 0,
        max: 0.2,
        colorMin: '#e0e7ff',
        colorMax: '#4f46e5',
        ticks: [0.05, 0.1, 0.15],
        format: (v) => `${(v * 100).toFixed(0)}%`,
        width: 220,
      },
    ] satisfies LegendSection[],
  },
};

/** Same drag interaction, but `mode: 'rescale'` reprojects the ramp onto the narrowed range. */
export const InteractiveContinuousRescale: Story = {
  args: {
    sections: [
      {
        type: 'continuous',
        title: "Porcentaje (mode: 'rescale')",
        interactive: true,
        mode: 'rescale',
        min: 0,
        max: 0.2,
        colorMin: '#e0e7ff',
        colorMax: '#4f46e5',
        ticks: [0.05, 0.1, 0.15],
        format: (v) => `${(v * 100).toFixed(0)}%`,
        width: 220,
      },
    ] satisfies LegendSection[],
  },
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
          { name: '4', color: '#4f46e5', symbol: 'square' },
        ],
      },
    ] satisfies LegendSection[],
  },
};
