import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { Series, ScalesConfig, AxisValue } from '$lib/types/plots/common';
import {
  FEMALE_LIFE_EXPECTANCY,
  LIFE_EXPECTANCY,
  type YearPoint,
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot/Scales',
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
    scales: {
      description: 'Per-axis scale configuration.',
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
 * No scale overrides — both axes are auto-fitted to the data extent.
 */
export const Default: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ]
  },
};

/**
 * Constrained Y domain — tightens the visible range to [78, 85], which is
 * narrower than the auto-fitted range (the 2008 value sits at 77.9 so
 * auto-fit adds space below it). All data points lie within [78, 85], so
 * no line is clipped at the frame boundary.
 *
 * Compare with `Default` to see how the trend appears more spread out when
 * the Y range is reduced.
 */
export const CustomYDomain: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { domain: [78, 85] },
    } satisfies ScalesConfig,
  },
};

/**
 * Constrained X domain — restricts both the visible range and the series
 * data to 2010–2020. The data is filtered to match the domain so the line
 * starts cleanly at the first in-range point (2010) rather than entering
 * the frame at an interpolated position from an earlier out-of-range point.
 */
export const CustomXDomain: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY.filter((d) => d.year >= 2010 && d.year <= 2020),
      } satisfies Series<YearPoint>,
    ],
    scales: {
      x: { domain: [2010, 2020] },
    } satisfies ScalesConfig,
  },
};

/**
 * Axis labels — a human-readable string appears alongside each axis.
 * Passing `false` to `label` suppresses the label svelteplot would infer
 * from the field name.
 */
export const WithAxisLabels: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      x: { label: 'Year' },
      y: { label: 'Life expectancy (years)' },
    } satisfies ScalesConfig,
    margins: { bottom: 50 },
  },
};

/**
 * Reversed Y axis — values increase downward instead of upward.
 * Useful for rankings, depth measurements, or other conventions where
 * a lower number means "better" or "further".
 */
export const ReversedY: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { reverse: true },
    } satisfies ScalesConfig,
  },
};

/**
 * Grid lines on the Y axis — adds horizontal reference lines at every
 * tick, making it easier to read off individual values without a ruler.
 */
export const WithGrid: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { grid: true },
    } satisfies ScalesConfig,
  },
};

/**
 * Explicit tick values — `ticks` pins exactly which values appear on the
 * X axis instead of the auto-computed interval. Useful to highlight
 * specific dates such as policy changes or census rounds.
 */
export const CustomTicks: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      x: { ticks: [2008, 2012, 2016, 2020] },
    } satisfies ScalesConfig,
  },
};

/**
 * Custom tick formatter on Y — the function receives the raw tick value and
 * returns the display string. Here it appends " yr" to every label.
 */
export const CustomTickFormat: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: {
        tickFormat: (d: unknown) => `${d} yr`,
      },
    } satisfies ScalesConfig,
  },
};

/**
 * Rotated X tick labels at −45°. Useful when labels are long or the plot
 * is too narrow to show them horizontally without overlap.
 */
export const RotatedXTicks: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      x: {
        tickRotate: -45,
      },
    } satisfies ScalesConfig,
  },
};

/**
 * Zero-anchored Y axis — `zero: true` forces the Y domain to include 0
 * even when all data values are far above it. Makes relative magnitudes
 * honest but compresses the visible trend significantly.
 */
export const ZeroAnchoredY: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { zero: true },
    } satisfies ScalesConfig,
  },
};

/**
 * All overrides combined on a two-series chart: labelled axes, a tighter
 * Y domain, explicit tick values, custom bottom margin and a Y grid.
 */
export const CombinedOverrides: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    scales: {
      x: { label: 'Year', ticks: [2008, 2012, 2016, 2020], grid: false },
      y: { label: 'Life expectancy (years)', domain: [60, 90], grid: true },
    } satisfies ScalesConfig,
    margins: { bottom: 50 },
  },
};

// ── Time-like X axes ─────────────────────────────────────────────────────────

type DatePoint = { date: Date; value: number };
type IsoDatePoint = { date: string; value: number };
type MonthPoint = { month: string; value: number };
type MonthYearPoint = { period: string; value: number };

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const DATE_OBJECT_DATA: DatePoint[] = [
  { date: new Date(2016, 0, 1), value: 12 },
  { date: new Date(2017, 0, 1), value: 18 },
  { date: new Date(2018, 0, 1), value: 22 },
  { date: new Date(2019, 0, 1), value: 27 },
  { date: new Date(2020, 0, 1), value: 24 },
  { date: new Date(2021, 0, 1), value: 33 },
  { date: new Date(2022, 0, 1), value: 41 },
  { date: new Date(2023, 0, 1), value: 47 },
  { date: new Date(2024, 0, 1), value: 52 },
];

/**
 * `Date` objects on the X axis — svelteplot infers a `time` scale, which
 * sorts and ticks chronologically by construction. Nine yearly points spread
 * across a wide plot also exercise the tick-count fix: without it, a
 * pixel-width-based tick request on such a narrow domain could ask for more
 * ticks than there are distinct years.
 */
export const DateObjectXAxis: Story = {
  args: {
    series: [
      {
        name: 'adoption',
        x: 'date',
        y: 'value',
        data: DATE_OBJECT_DATA,
      } satisfies Series<DatePoint>,
    ],
  },
};

const ISO_DATE_DATA: IsoDatePoint[] = [
  { date: '2023-01-01', value: 14 },
  { date: '2023-04-01', value: 19 },
  { date: '2023-07-01', value: 25 },
  { date: '2023-10-01', value: 21 },
  { date: '2024-01-01', value: 28 },
  { date: '2024-04-01', value: 33 },
  { date: '2024-07-01', value: 30 },
  { date: '2024-10-01', value: 38 },
];

/**
 * Dates as `'YYYY-MM-DD'` strings — svelteplot infers a `point` (ordinal)
 * scale for string X values, no `scales.x.sort` needed here: the default
 * ascending sort is lexicographic, and ISO dates happen to sort
 * lexicographically in chronological order too.
 */
export const IsoDateStringXAxis: Story = {
  args: {
    series: [
      {
        name: 'signups',
        x: 'date',
        y: 'value',
        data: ISO_DATE_DATA,
      } satisfies Series<IsoDatePoint>,
    ],
  },
};

const MONTH_DATA: MonthPoint[] = [
  { month: 'Ene', value: 20 },
  { month: 'Feb', value: 18 },
  { month: 'Mar', value: 24 },
  { month: 'Abr', value: 30 },
  { month: 'May', value: 38 },
  { month: 'Jun', value: 45 },
  { month: 'Jul', value: 48 },
  { month: 'Ago', value: 44 },
  { month: 'Sep', value: 36 },
  { month: 'Oct', value: 29 },
  { month: 'Nov', value: 22 },
  { month: 'Dic', value: 25 },
];

/** Orders month-abbreviation strings by calendar position, not alphabetically. */
function byMonth(a: AxisValue, b: AxisValue): number {
  return MONTHS_ES.indexOf(String(a)) - MONTHS_ES.indexOf(String(b));
}

/**
 * Month-name strings within a single year — a plain ordinal scale would sort
 * these alphabetically (Abr, Ago, Dic, Ene, …), scrambling the seasonal
 * shape entirely. `scales.x.sort` supplies calendar order instead.
 */
export const MonthNamesSameYear: Story = {
  args: {
    series: [
      {
        name: 'seasonal',
        x: 'month',
        y: 'value',
        data: MONTH_DATA,
      } satisfies Series<MonthPoint>,
    ],
    scales: {
      x: { sort: byMonth },
    } satisfies ScalesConfig,
  },
};

const MONTH_YEAR_DATA: MonthYearPoint[] = [
  { period: 'Nov-2025', value: 40 },
  { period: 'Dic-2025', value: 46 },
  { period: 'Ene-2026', value: 39 },
  { period: 'Feb-2026', value: 43 },
  { period: 'Mar-2026', value: 50 },
  { period: 'Abr-2026', value: 55 },
];

function byMonthYear(a: AxisValue, b: AxisValue): number {
  const rank = (v: AxisValue) => {
    const [month, year] = String(v).split('-');
    return Number(year) * 12 + MONTHS_ES.indexOf(month);
  };
  return rank(a) - rank(b);
}

/**
 * `'Mmm-YYYY'` strings crossing a year boundary — alphabetical order would
 * place `Abr-2026` before `Dic-2025`. `scales.x.sort` parses month + year
 * out of each label so the axis (and the line) stay chronological.
 */
export const MonthYearAcrossYears: Story = {
  args: {
    series: [
      {
        name: 'trend',
        x: 'period',
        y: 'value',
        data: MONTH_YEAR_DATA,
      } satisfies Series<MonthYearPoint>,
    ],
    scales: {
      x: { sort: byMonthYear },
    } satisfies ScalesConfig,
  },
};

// ── Custom axis chrome ───────────────────────────────────────────────────────

/**
 * Vertical Y-axis title, anchored at the top — `labelOrientation: 'vertical'`
 * rotates the title 90° and draws it beside the ticks instead of
 * svelteplot's default horizontal title above the plot; `labelPosition: 'top'`
 * anchors it near the axis's highest tick, reading downward.
 *
 * svelteplot can't auto-measure this custom label, so it needs an explicit
 * `margins.left` wide enough for both the label and the tick digits.
 */
export const VerticalYLabelTop: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { label: 'Life expectancy (years)', labelOrientation: 'vertical', labelPosition: 'top' },
    } satisfies ScalesConfig,
    margins: { left: 60 },
  },
};

/**
 * Vertical Y-axis title, centered — `labelPosition` defaults to `'middle'`,
 * spanning the full axis height instead of sitting at the top.
 *
 * Compare with `VerticalYLabelTop`.
 */
export const VerticalYLabelMiddle: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { label: 'Life expectancy (years)', labelOrientation: 'vertical' },
    } satisfies ScalesConfig,
    margins: { left: 60 },
  },
};

/**
 * Grid without an axis line — svelteplot doesn't draw a continuous axis
 * spine at all; the only line an axis draws is the small perpendicular tick
 * mark at each value, controlled by `tickSize`. Setting it to `0` hides
 * those marks while `grid: true` keeps the horizontal reference lines,
 * leaving just floating tick labels plus the grid.
 */
export const GridOnlyNoTickMarks: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { grid: true, tickSize: 0 },
    } satisfies ScalesConfig,
  },
};

/**
 * Styled grid — `grid` accepts a style object (`stroke`, `strokeWidth`,
 * `strokeOpacity`, `strokeDasharray`) instead of just `true`, here producing
 * a light dotted grid rather than solid lines.
 */
export const DottedGrid: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { grid: { strokeDasharray: '2 3', strokeOpacity: 0.5 } },
    } satisfies ScalesConfig,
  },
};
