import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { BasePlotStylesConfig } from '$lib/types/layout/styles';
import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from './data';
import LineValuesLegendDemo from './LineValuesLegendDemo.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Kept in its own file/docs page, separate from `LinePlot.Styles` — the
// legend-disabled demo mounts its own `LinePlot` alongside an interactive
// `LegendLayout`, which is enough extra composition that it's safer not to
// stack it onto that page's already many co-mounted `LinePlot` instances.

const meta = {
  title: 'Plots/LinePlot/Legend',
  component: LinePlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 400,
  },
  argTypes: {
    width: { control: { type: 'range', min: 300, max: 950, step: 50 } },
    height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
    series: { control: false },
    styles: { control: false },
  },
  parameters: {
    docs: { source: { name: 'LinePlot' } },
  },
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled series dims its value label too, not just its line.
 * Toggling "Mujeres" or "Varones" off in the legend above fades that
 * series' end-of-line label along with the line itself, instead of leaving
 * the label at full opacity while the line fades. Composed here with
 * `provideLegendInteraction()` + `LegendLayout` directly around `LinePlot`
 * (no `BaseChart`) — the same context wiring `BaseChart` uses internally,
 * exposed for standalone composition. See `LineValuesLegendDemo.svelte`.
 */
export const LegendDisabledDimsLabel: StoryObj = {
  render: () => ({ Component: LineValuesLegendDemo }),
};

/**
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that series off
 * in the legend would — reverting on mouse-leave. Hover either series'
 * end-of-line label to see the other line and label fade.
 */
export const HoverIsolate: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      },
      {
        name: 'male',
        x: 'year',
        y: 'value',
        data: MALE_LIFE_EXPECTANCY,
      },
    ],
    styles: {
      values: {
        show: true,
        hoverIsolate: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
      },
    } satisfies BasePlotStylesConfig,
  },
};
