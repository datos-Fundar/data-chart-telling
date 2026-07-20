import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { BasePlotStyles } from '$lib/types/plots/styles/common';
import {
  FEMALE_LIFE_EXPECTANCY,
  MALE_LIFE_EXPECTANCY,
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot/Styles',
  component: LinePlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 400,
  },
  argTypes: {
    width: {
      description: 'Plot width in pixels.',
      control: { type: 'range', min: 300, max: 950, step: 50 },
    },
    height: {
      description: 'Plot height in pixels.',
      control: { type: 'range', min: 200, max: 700, step: 50 },
    },
    series: {
      description: 'Data series to render.',
      control: false,
    },
    styles: {
      description: 'Rendering style overrides.',
      control: false,
    },
  },
  parameters: {
    docs: { source: { name: 'LinePlot' } },
  },
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No style overrides — the plot uses the configured theme defaults.
 */
export const Default: Story = {
  args: { 
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
  },
};

/**
 * Value labels enabled with default settings — `styles.values.show: true`
 * renders the numeric Y value at the **last** data point of each series.
 *
 * The default format is `"${seriesName} - ${value}"` and the default anchor
 * is `'start'`, which places the text to the right of the endpoint.
 */
export const ShowValues: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
    styles: {
      values: { show: true },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};

/**
 * Custom format — the `format(value, seriesName)` callback receives the
 * numeric Y value and the series name. Return any string to override the
 * default `"${seriesName} - ${value}"` label.
 */
export const CustomFormat: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
    styles: {
      values: {
        show: true,
        format: (v: number, name: string) => `${name} → ${v.toFixed(1)} yr`,
      },
    } satisfies BasePlotStyles,
    margins: { right: 120 },
  },
};

/**
 * Two series with default end-point labels — each series gets its own label
 * at its last data point, filled with the palette colour for that series.
 * The default `anchor: 'start'` places both labels to the right of their
 * respective endpoints.
 */
export const TwoSeriesWithLabels: Story = {
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
      }
    ],
    styles: {
      values: {
        show: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
      },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};

/**
 * Anchor `'start'` (explicit) — text appears to the right of the last data
 * point, aligned with the series line. This is the default when `anchor` is
 * omitted.
 */
export const AnchorStart: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
    styles: {
      values: {
        show: true,
        anchor: 'start',
        format: (v: number) => `${v.toFixed(1)} yr`,
      },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};

/**
 * Anchor `'outside'` — the label appears **above** the last data point,
 * centered on it. Useful when the label would otherwise overlap the line or
 * clip outside the right edge of the plot.
 */
export const AnchorOutside: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
    styles: {
      values: {
        show: true,
        anchor: 'outside',
        format: (v: number) => `${v.toFixed(1)} yr`,
      },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};

/**
 * Two series with `anchor: 'outside'` labels — both labels appear above
 * their respective last points. Because both series share the same last
 * x value (2020), the labels are stacked vertically, separated naturally
 * by the difference in y values (~5 years here).
 */
export const TwoSeriesLabelsOutside: Story = {
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
      }
    ],
    styles: {
      values: {
        show: true,
        anchor: 'outside',
        format: (v: number, name: string) => `${name}: ${v.toFixed(1)} yr`,
      },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};

/**
 * Custom offsets — `dx` and `dy` fine-tune the label position in pixels,
 * overriding the defaults computed from `anchor`. Useful for nudging a label
 * away from a marker or another series.
 *
 * Here `anchor: 'outside'` is combined with a larger `dy` to push the label
 * further above the endpoint.
 */
export const CustomOffsets: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
    styles: {
      values: {
        show: true,
        anchor: 'outside',
        format: (v: number) => `${v.toFixed(1)} yr`,
        dy: -18,
      },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};

/**
 * Anchor `'middle'` — the label is centered directly on the last data point
 * with no offset. Works best when there are no dots at the endpoint, or
 * combined with `dy` to shift the text slightly.
 */
export const AnchorMiddle: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
    styles: {
      values: {
        show: true,
        anchor: 'middle',
        format: (v: number) => `${v.toFixed(1)} yr`,
        dy: 18,
      },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};

/**
 * Anchor `'end'` — text appears to the **left** of the last data point,
 * toward the chart's zero side. Mirror image of the default `'start'`.
 */
export const AnchorEnd: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
    styles: {
      values: {
        show: true,
        anchor: 'end',
        dy: -18,
        format: (v: number) => `${v.toFixed(1)} yr`,
      },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};

/**
 * Custom text anchor and line anchor — bypasses the `anchor` shorthand and
 * sets svelteplot's low-level `textAnchor` / `lineAnchor` directly. The label
 * is right-aligned (`textAnchor: 'end'`) and sits above the point
 * (`lineAnchor: 'bottom'`), with a nudge via `dy`.
 */
export const LowLevelTextPlacement: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      }
    ],
    styles: {
      values: {
        show: true,
        format: (v: number) => `${v.toFixed(1)} yr`,
        textAnchor: 'end',
        lineAnchor: 'bottom',
        dy: -10,
        dx: 0,
      },
    } satisfies BasePlotStyles,
    margins: { right: 80 },
  },
};
