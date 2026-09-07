import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedStylesConfig, GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import {
  FEMALE_LIFE_EXPECTANCY,
  MALE_LIFE_EXPECTANCY,
  FEMALE_LIFE_EXPECTANCY_WITH_GAPS,
  MALE_LIFE_EXPECTANCY_WITH_GAPS,
} from './data';
import LineValuesLegendDemo from './LineValuesLegendDemo.svelte';
import LineGapsLegendDemo from './LineGapsLegendDemo.svelte';
import LineOmitLegendDemo from './LineOmitLegendDemo.svelte';
import LineOmitValuesGapsLegendDemo from './LineOmitValuesGapsLegendDemo.svelte';
import { renderSource } from '../../common/docsSource';

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
    width: 940,
    height: 400,
  },
  argTypes: {
    width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
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
  parameters: {
    docs: {
      source: {
        code: renderSource('LinePlot', {
          width: 950,
          height: 400,
          series: [
            { name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
            { name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY },
          ],
          styles: {
            values: {
              show: true,
              format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
            },
          },
        }),
      },
    },
  },
};

/**
 * A legend-disabled series also dims its gap-fill bridge, not just its real
 * line. Both `female` and `male` have a `styles.gaps.default.middle` bridge
 * filling their internal outage — toggling either off in the legend above
 * should fade its bridge right along with the rest of the line, instead of
 * leaving the dashed bridge at full opacity while the real line fades.
 */
export const LegendDisabledDimsGapBridge: StoryObj = {
  render: () => ({ Component: LineGapsLegendDemo }),
  parameters: {
    docs: {
      source: {
        code: renderSource('LinePlot', {
          width: 950,
          height: 400,
          series: [
            { name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS },
            { name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY_WITH_GAPS },
          ],
          styles: {
            gaps: { default: { middle: {} } },
          },
        }),
      },
    },
  },
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off series from the plot and rescales the y-axis. See `LineOmitLegendDemo.svelte`. */
export const LegendOmitRescalesDomain: StoryObj = {
  render: () => ({ Component: LineOmitLegendDemo }),
  parameters: {
    docs: {
      source: {
        code: renderSource('LinePlot', {
          width: 950,
          height: 400,
          series: [
            { name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
            { name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY },
          ],
        }),
      },
    },
  },
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
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * `styles.values.hoverIsolate` also dims a hovered-out series' gap-fill
 * bridge, not just its real line — mirrors `LegendDisabledDimsGapBridge`
 * above, but triggered by hovering a value label instead of clicking the
 * legend. Both `female` and `male` have a `styles.gaps.default.middle`
 * bridge filling their internal outage; hover either series' end-of-line
 * label to see the *other* series' bridge fade along with its line.
 */
export const HoverIsolateDimsGapBridge: StoryObj = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS,
      },
      {
        name: 'male',
        x: 'year',
        y: 'value',
        data: MALE_LIFE_EXPECTANCY_WITH_GAPS,
      },
    ],
    styles: {
      values: {
        show: true,
        hoverIsolate: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
      },
      gaps: { default: { middle: {} } } satisfies GapsConfig<LineSegmentStyle>,
    } satisfies GapsAwarePlotStylesConfig<LineSegmentStyle>,
  },
};

/** `interactive.disabled: { mode: 'omit' }` combined with value labels and a gap-fill bridge. See `LineOmitValuesGapsLegendDemo.svelte`. */
export const LegendOmitDropsLabelAndBridge: StoryObj = {
  render: () => ({ Component: LineOmitValuesGapsLegendDemo }),
  parameters: {
    docs: {
      source: {
        code: renderSource('LinePlot', {
          width: 950,
          height: 400,
          series: [
            { name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY_WITH_GAPS },
            { name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY_WITH_GAPS },
          ],
          styles: {
            values: {
              show: true,
              hoverIsolate: true,
              format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
            },
            gaps: { default: { middle: {} } },
          },
        }),
      },
    },
  },
};
