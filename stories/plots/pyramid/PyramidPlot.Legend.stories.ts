import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../data/population-pyramid';
import PyramidValuesLegendDemo from './PyramidValuesLegendDemo.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Kept in its own file/docs page, separate from `PyramidPlot.Styles` — the
// legend-disabled demo mounts its own `PyramidPlot` alongside an interactive
// `LegendLayout`, which is enough extra composition that it's safer not to
// stack it onto that page's already many co-mounted `PyramidPlot` instances.

const meta = {
  title: 'Plots/PyramidPlot/Legend',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    styles: { control: false },
  },
  parameters: {
    docs: { source: { name: 'PyramidPlot' } },
  },
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const DATA = POPULATION_PYRAMID.filter((d) => d.year === 2022);

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled side dims its value labels too, not just its bars.
 * Toggling "Mujeres" or "Varones" off in the legend above fades that
 * side's labels along with its bars, instead of leaving the labels at full
 * opacity while the bars fade. Composed here with `provideLegendInteraction()`
 * + `LegendLayout` directly around `PyramidPlot` (no `BaseChart`) — the same
 * context wiring `BaseChart` uses internally, exposed for standalone
 * composition. See `PyramidValuesLegendDemo.svelte`.
 */
export const LegendDisabledDimsLabels: StoryObj = {
  render: () => ({ Component: PyramidValuesLegendDemo }),
};

/**
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that side off in
 * the legend would — reverting on mouse-leave. Hover a "Mujeres" or
 * "Varones" label to see the other side's bars and labels fade.
 */
export const HoverIsolate: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: { domain: [-6, 6] },
      y: { domain: AGE_GROUPS },
    },
    styles: {
      values: { show: true, hoverIsolate: true, format: (v: number) => `${v.toFixed(1)}%` },
    } satisfies AxisBasedStylesConfig,
  },
};
