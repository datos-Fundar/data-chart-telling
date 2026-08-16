import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { YearPoint } from '../data';
import {
  FEMALE_LIFE_EXPECTANCY,
  MALE_LIFE_EXPECTANCY,
} from '../data';
import {
  FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
  MALE_LIFE_EXPECTANCY_BY_PROVINCE,
} from '../../bar/data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot/Styles/Values',
  component: LinePlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 400,
  },
  argTypes: {
    width: {
      description: 'Plot width in pixels.',
      control: { type: 'range', min: 300, max: 940, step: 50 },
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
 * No style overrides, the plot uses the configured theme defaults.
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
 * Value labels enabled with default settings, `styles.values.show: true`
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
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Custom format, the `format(value, seriesName)` callback receives the
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
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Two series with default end-point labels, each series gets its own label
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
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Anchor `'start'` (explicit), text appears to the right of the last data
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
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Anchor `'outside'`, the label appears **above** the last data point,
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
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Two series with `anchor: 'outside'` labels, both labels appear above
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
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Custom offsets, `dx` and `dy` fine-tune the label position in pixels,
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
        fontStyle: { dy: -18 },
      },
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Anchor `'middle'`, the label is centered directly on the last data point
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
        fontStyle: { dy: 18 },
      },
    } satisfies AxisBasedStylesConfig,
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
        format: (v: number) => `${v.toFixed(1)} yr`,
        fontStyle: { dy: -18 },
      },
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Custom text anchor and line anchor, bypasses the `anchor` shorthand and
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
        fontStyle: {
          textAnchor: 'end',
          lineAnchor: 'bottom',
          dy: -10,
          dx: 0,
        },
      },
    } satisfies AxisBasedStylesConfig,
  },
};

// ── Declutter ───────────────────────────────────────────────────────────────

function provinceTrajectory(shape: YearPoint[], targetLastValue: number): YearPoint[] {
  const offset = targetLastValue - shape[shape.length - 1].value;
  return shape.map((d) => ({ year: d.year, value: d.value + offset }));
}

function provinceValue(list: { province: string; value: number }[], province: string): number {
  return list.find((d) => d.province === province)!.value;
}

const MALE_CLUSTER_COMPRESSION = 0.3;

function compressTowardMean(values: number[], factor: number): number[] {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.map((v) => mean + (v - mean) * factor);
}

const OVERLAP_DEMO_PROVINCES: { label: string; sex: 'male' | 'female'; province: string }[] = [
  // Cluster A. male, mid-range: compressed toward its own mean below, so it
  // overlaps far more aggressively than its real spread would.
  { label: 'Tucumán · M', sex: 'male', province: 'Tucumán' },
  { label: 'Santa Fe · M', sex: 'male', province: 'Santa Fe' },
  { label: 'Córdoba · M', sex: 'male', province: 'Córdoba' },
  { label: 'Buenos Aires · M', sex: 'male', province: 'Buenos Aires' },
  // Cluster B. female, upper-range: real spread, overlaps internally, well
  // clear of A.
  { label: 'Tucumán · F', sex: 'female', province: 'Tucumán' },
  { label: 'Santa Fe · F', sex: 'female', province: 'Santa Fe' },
  { label: 'Córdoba · F', sex: 'female', province: 'Córdoba' },
  { label: 'Buenos Aires · F', sex: 'female', province: 'Buenos Aires' },
  // Isolated. far below both clusters, needs no decluttering.
  { label: 'La Rioja · M', sex: 'male', province: 'La Rioja' },
];

const MALE_CLUSTER_PROVINCES = ['Tucumán', 'Santa Fe', 'Córdoba', 'Buenos Aires'];
const MALE_CLUSTER_REAL_VALUES = MALE_CLUSTER_PROVINCES.map((p) => provinceValue(MALE_LIFE_EXPECTANCY_BY_PROVINCE, p));
const MALE_CLUSTER_COMPRESSED_VALUES = compressTowardMean(MALE_CLUSTER_REAL_VALUES, MALE_CLUSTER_COMPRESSION);
const MALE_CLUSTER_TARGETS = new Map(
  MALE_CLUSTER_PROVINCES.map((province, i) => [province, MALE_CLUSTER_COMPRESSED_VALUES[i]]),
);

const OVERLAP_DEMO_SERIES = OVERLAP_DEMO_PROVINCES.map(({ label, sex, province }) => {
  const shape = sex === 'female' ? FEMALE_LIFE_EXPECTANCY : MALE_LIFE_EXPECTANCY;
  const target =
    (sex === 'male' ? MALE_CLUSTER_TARGETS.get(province) : undefined) ??
    provinceValue(
      sex === 'female' ? FEMALE_LIFE_EXPECTANCY_BY_PROVINCE : MALE_LIFE_EXPECTANCY_BY_PROVINCE,
      province,
    );
  return {
    name: label,
    x: 'year' as const,
    y: 'value' as const,
    data: provinceTrajectory(shape, target),
  };
});

/**
 * A near-miss case for the grouping logic itself: a series whose *original*
 * last value sits comfortably outside cluster A (male), too far from
 * Tucumán · M to be grouped with it going in, but close enough that once
 * the cluster's own labels spread out, Tucumán · M's *decluttered* label
 * lands right on top of it. Grouping has to key off the post-declutter
 * (final) gap, not the original one, to catch this. See `declutter1D`'s
 * doc comment in `declutter.ts`.
 */
const NEAR_MISS_SERIES = {
  name: 'Formosa · M',
  x: 'year' as const,
  y: 'value' as const,
  data: provinceTrajectory(MALE_LIFE_EXPECTANCY, 77.3),
};

/**
 * End-of-line labels resolve overlap automatically, at real-world severity.
 * Nine series (see `OVERLAP_DEMO_SERIES` above) whose real end-of-period
 * values happen to form two separate four-way pileups (male mid-range,
 * female upper-range) plus one province sitting alone well below both. At
 * the default plot height, each pileup's labels would otherwise land closer
 * together than a label's own height; instead they spread apart just enough
 * to clear one another, independently of the other pileup, each reconnected
 * to its real end point with a thin leader line. The isolated series's
 * label, far from any neighbour, is untouched — nothing to resolve there.
 */
export const DeclutteredLabels: Story = {
  args: {
    series: OVERLAP_DEMO_SERIES,
    styles: {
      values: {
        show: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
      },
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Custom label and connector styling. `values.fontStyle` restyles the label
 * text (`fontWeight`, or `stroke`/`strokeWidth` for a text outline, …),
 * while `values.strokeStyle` is a completely separate style for the leader
 * line drawn between a displaced label and its data point — independent of
 * the label, and independent of the neutral grey/thin/solid default. Here
 * labels are bold with a subtle white outline for legibility over the
 * lines, and every connector renders as a dashed, dark slate line rather
 * than the default.
 */
export const DeclutteredLabelsCustomStyle: Story = {
  args: {
    series: OVERLAP_DEMO_SERIES,
    styles: {
      values: {
        show: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
        fontStyle: {
          fontWeight: 'bold',
          stroke: 'white',
          strokeWidth: 3,
          paintOrder: 'stroke',
        },
        strokeStyle: {
          stroke: '#1e293b',
          strokeWidth: 1.5,
          strokeDasharray: '2 3',
        },
      },
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Stress-tests a case the other stories don't otherwise exercise: a series
 * that starts out clear of a cluster, but ends up in collision range only
 * once that cluster's own labels have spread out. `Formosa · M` (see
 * `NEAR_MISS_SERIES` above) sits ~1.3 units below Tucumán · M's real value —
 * too far to be grouped with cluster A going in, but Tucumán · M's
 * decluttered label lands almost exactly where Formosa · M's already is.
 * Formosa · M correctly gets pulled into the same run, with its own leader
 * line and lane, aligned with (not overlapping) the other four.
 */
export const DeclutteredLabelsNearMissSeries: Story = {
  args: {
    series: [...OVERLAP_DEMO_SERIES, NEAR_MISS_SERIES],
    styles: {
      values: {
        show: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
      },
    } satisfies AxisBasedStylesConfig,
  },
};

const ALL_PROVINCES = ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Formosa', 'Tucumán', 'La Rioja'];
const BOUNDS_DEMO_REAL_VALUES = [
  ...ALL_PROVINCES.map((p) => provinceValue(MALE_LIFE_EXPECTANCY_BY_PROVINCE, p)),
  ...ALL_PROVINCES.map((p) => provinceValue(FEMALE_LIFE_EXPECTANCY_BY_PROVINCE, p)),
];
const BOUNDS_DEMO_TARGETS = compressTowardMean(BOUNDS_DEMO_REAL_VALUES, 0.12);
const BOUNDS_DEMO_SERIES = ALL_PROVINCES.flatMap((province, i) => [
  {
    name: `${province} · M`,
    x: 'year' as const,
    y: 'value' as const,
    data: provinceTrajectory(MALE_LIFE_EXPECTANCY, BOUNDS_DEMO_TARGETS[i]),
  },
  {
    name: `${province} · F`,
    x: 'year' as const,
    y: 'value' as const,
    data: provinceTrajectory(FEMALE_LIFE_EXPECTANCY, BOUNDS_DEMO_TARGETS[ALL_PROVINCES.length + i]),
  },
]);

/**
 * Twelve series compressed toward a single value, close enough together
 * that the plot's own top edge — not just neighbouring labels — constrains
 * how they can spread. Exercises `bounds`-aware clamping in `declutter1D`:
 * labels stay inside the plot's content box instead of spilling past it,
 * while a run's leader lines still fan out cleanly.
 *
 * 400px, not the package default, deliberately: twelve labels need at least
 * `11 * minGap` (~185px) of clearance to legibly separate at all, so a
 * shorter plot wouldn't be testing bounds-clamping so much as asking for
 * more vertical space than exists at any spacing — a real constraint, but a
 * different one than this story means to demonstrate.
 */
export const DeclutteredLabelsBoundedByPlot: Story = {
  args: {
    height: 400,
    series: BOUNDS_DEMO_SERIES,
    styles: {
      values: {
        show: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
      },
    } satisfies AxisBasedStylesConfig,
  },
};
