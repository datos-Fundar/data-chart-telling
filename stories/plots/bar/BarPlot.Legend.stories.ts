import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { FEMALE_LIFE_EXPECTANCY_BY_PROVINCE, MALE_LIFE_EXPECTANCY_BY_PROVINCE, type ProvincePoint } from './data';
import BarValuesLegendDemo from './BarValuesLegendDemo.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Kept in its own file/docs page, separate from `BarPlot.Styles` — the
// legend-disabled demo mounts its own `BarPlot` alongside an interactive
// `LegendLayout`, which is enough extra composition that it's safer not to
// stack it onto that page's already many co-mounted `BarPlot` instances.

const meta = {
  title: 'Plots/BarPlot/Legend',
  component: BarPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 500,
  },
  argTypes: {
    width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
    height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
    series: { control: false },
    styles: { control: false },
  },
  parameters: {
    docs: { source: { name: 'BarPlot' } },
  },
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const FEMALE = {
  name: 'female',
  x: 'province',
  y: 'value',
  data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
} satisfies Series<ProvincePoint>;

const MALE = {
  name: 'male',
  x: 'province',
  y: 'value',
  data: MALE_LIFE_EXPECTANCY_BY_PROVINCE,
} satisfies Series<ProvincePoint>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled series dims its value labels too, not just its bars.
 * Toggling "Mujeres" or "Varones" off in the legend above fades that
 * series' labels along with its bars, instead of leaving the labels at full
 * opacity while the bars fade. Composed here with `provideLegendInteraction()`
 * + `LegendLayout` directly around `BarPlot` (no `BaseChart`) — the same
 * context wiring `BaseChart` uses internally, exposed for standalone
 * composition. See `BarValuesLegendDemo.svelte`.
 */
export const LegendDisabledDimsLabels: StoryObj = {
  render: () => ({ Component: BarValuesLegendDemo }),
};

/**
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that series off
 * in the legend would — reverting on mouse-leave. Hover a "female" or
 * "male" label to see the other series' bars and labels fade.
 */
export const HoverIsolate: Story = {
  args: {
    series: [FEMALE, MALE],
    styles: {
      values: {
        show: true,
        hoverIsolate: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
      },
    } satisfies AxisBasedStylesConfig,
  },
};
