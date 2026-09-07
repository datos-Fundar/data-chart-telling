import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AMERICAS, COUNTRIES } from './data';
import ScatterValuesLegendDemo from './ScatterValuesLegendDemo.svelte';
import ScatterOmitLegendDemo from './ScatterOmitLegendDemo.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Kept in its own file/docs page, separate from `ScatterPlot.Styles` — the
// legend-disabled demo mounts its own `ScatterPlot` alongside an interactive
// `LegendLayout`, which is enough extra composition that it's safer not to
// stack it onto that page's already many co-mounted `ScatterPlot` instances.

const meta = {
  title: 'Plots/ScatterPlot/Legend',
  component: ScatterPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 500,
    data: AMERICAS,
    x: 'gdpPerCapita',
    y: 'lifeExpectancy',
  },
  argTypes: {
    width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
    height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
    data: { control: false },
    styles: { description: 'Rendering style overrides.', control: false },
  },
  parameters: {
    docs: { source: { name: 'ScatterPlot' } },
  },
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled series dims its value labels too, not just its dots.
 * Toggling "Americas" or "Europe" off in the legend above fades that
 * region's point labels along with its dots, instead of leaving the labels
 * at full opacity while the dots fade. Composed here with
 * `provideLegendInteraction()` + `LegendLayout` directly around
 * `ScatterPlot` (no `BaseChart`) — the same context wiring `BaseChart` uses
 * internally, exposed for standalone composition. See
 * `ScatterValuesLegendDemo.svelte`.
 */
export const LegendDisabledDimsLabels: StoryObj = {
  render: () => ({ Component: ScatterValuesLegendDemo }),
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off region from the plot and rescales both axes. See `ScatterOmitLegendDemo.svelte`. */
export const LegendOmitRescalesDomain: StoryObj = {
  render: () => ({ Component: ScatterOmitLegendDemo }),
};

/**
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that series off
 * in the legend would — reverting on mouse-leave. Hover a country's label
 * to see every other region's dots and labels fade.
 */
export const HoverIsolate: Story = {
  args: {
    data: COUNTRIES,
    z: 'region',
    styles: {
      values: {
        show: true,
        hoverIsolate: true,
        format: (v: number) => v.toFixed(0),
      },
    } satisfies AxisBasedStylesConfig,
  },
};
