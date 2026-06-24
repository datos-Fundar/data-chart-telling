import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/common';

type Region = { region: string; value: number };
type YearValue = { year: string; value: number };

const REGIONS: Region[] = [
  { region: 'Norte',   value: 42 },
  { region: 'Centro',  value: 67 },
  { region: 'Sur',     value: 55 },
  { region: 'Este',    value: 38 },
  { region: 'Oeste',   value: 71 },
];

const GDP: YearValue[] = [
  { year: '2018', value: 42 },
  { year: '2019', value: 48 },
  { year: '2020', value: 31 },
  { year: '2021', value: 55 },
  { year: '2022', value: 61 },
];

const EMPLOYMENT: YearValue[] = [
  { year: '2018', value: 72 },
  { year: '2019', value: 74 },
  { year: '2020', value: 60 },
  { year: '2021', value: 68 },
  { year: '2022', value: 75 },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/BarPlot',
  component: BarPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
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
    series: { control: false },
    segments: { control: false },
  },
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Single series with categorical x. Fill comes from `segments`, keyed by series name. */
export const Default: Story = {
  args: {
    series: [
      {
        name: 'regions',
        x: 'region',
        y: 'value',
        data: REGIONS
      } satisfies Series<Region>,
    ],
  },
};

/** Year-over-year bars. */
export const ByYear: Story = {
  args: {
    series: [
      {
        name: 'gdp',
        x: 'year',
        y: 'value',
        data: GDP
      } satisfies Series<YearValue>,
    ],
  },
};

/**
 * Two overlapping series on the same x domain.
 * Note: svelteplot overlays them by default — use separate x ranges
 * or handle offsets in the data for side-by-side bars.
 */
export const TwoSeries: Story = {
  args: {
    series: [
      { name: 'employment', x: 'year', y: 'value', data: EMPLOYMENT } satisfies Series<YearValue>,
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies Series<YearValue>,
    ],
    segments: {
      employment: [{ style: { fillOpacity: 0.85 } }],
      gdp: [{ style: { fillOpacity: 0.85 } }],
    },
  },
};

/** Narrow layout. */
export const Narrow: Story = {
  args: {
    width: 320,
    height: 250,
    series: [
      { name: 'regions', x: 'region', y: 'value', data: REGIONS } satisfies Series<Region>,
    ],
  },
};
