import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX, type ProvinceSexCell } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/HeatmapPlot/Segments',
  component: HeatmapPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 420,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 950, step: 20 } },
    height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
    series: { control: false },
    segments: { control: false },
  },
  parameters: {
    docs: { source: { name: 'HeatmapPlot' } },
  },
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERIES = [
  {
    name: 'life_expectancy',
    x: 'province',
    y: 'sex',
    z: 'value',
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
  } satisfies Series<ProvinceSexCell>,
];

// ── Stories ───────────────────────────────────────────────────────────────────
// Heatmap segments use the `'default'` key — heatmaps have no named series.
// `from`/`to` compare category values lexicographically, so provinces fall in
// alphabetical order: Buenos Aires, Córdoba, Formosa, La Rioja, Santa Fe, Tucumán.

/**
 * Highlight a region — dims all cells except the female row for a range of
 * provinces. Useful for focusing on a particular demographic slice.
 */
export const HighlightRegion: Story = {
  args: {
    series: SERIES,
    segments: {
      default: [
        {
          areas: [
            {
              x: { from: 'Buenos Aires', to: 'Formosa' },
              y: { from: 'Female', to: 'Female' },
            },
          ],
          style: { fillOpacity: 1 },
        },
        {
          style: { fillOpacity: 0.3 },
        },
      ],
    } satisfies SegmentsConfig<CellSegmentStyle>,
  },
};

/**
 * Highlight a row (sex) — every female cell is highlighted with full opacity;
 * the male row is dimmed.
 */
export const HighlightSex: Story = {
  args: {
    series: SERIES,
    segments: {
      default: [
        {
          areas: [{ y: { from: 'Female', to: 'Female' } }],
          style: { fillOpacity: 0.95 },
        },
        {
          style: { fillOpacity: 0.25 },
        },
      ],
    } satisfies SegmentsConfig<CellSegmentStyle>,
  },
};

/**
 * Highlight columns (provinces) — all cells in specific provinces are shown
 * at full brightness; others are faded.
 */
export const HighlightProvinces: Story = {
  args: {
    series: SERIES,
    segments: {
      default: [
        {
          areas: [
            { x: { from: 'Buenos Aires', to: 'Córdoba' } },
            { x: { from: 'Tucumán', to: 'Tucumán' } },
          ],
          style: { fillOpacity: 1 },
        },
        {
          style: { fillOpacity: 0.3 },
        },
      ],
    } satisfies SegmentsConfig<CellSegmentStyle>,
  },
};

/**
 * Multiple highlight areas with different opacities — creates a visual
 * hierarchy by dimming some regions more than others.
 */
export const LayeredOpacity: Story = {
  args: {
    series: SERIES,
    segments: {
      default: [
        {
          areas: [
            {
              x: { from: 'Buenos Aires', to: 'Formosa' },
              y: { from: 'Female', to: 'Female' },
            },
          ],
          style: { fillOpacity: 1 },
        },
        {
          areas: [
            {
              x: { from: 'La Rioja', to: 'Tucumán' },
              y: { from: 'Male', to: 'Male' },
            },
          ],
          style: { fillOpacity: 0.6 },
        },
        {
          style: { fillOpacity: 0.25 },
        },
      ],
    } satisfies SegmentsConfig<CellSegmentStyle>,
  },
};

/**
 * Highlight with custom stroke — draws attention to a region with both
 * opacity and a visible border.
 */
export const HighlightWithStroke: Story = {
  args: {
    series: SERIES,
    segments: {
      default: [
        {
          areas: [
            {
              x: { from: 'Buenos Aires', to: 'Córdoba' },
              y: { from: 'Female', to: 'Female' },
            },
          ],
          style: {
            fillOpacity: 0.9,
            stroke: '#f59f00',
            strokeWidth: 2,
          },
        },
        {
          style: { fillOpacity: 0.3 },
        },
      ],
    } satisfies SegmentsConfig<CellSegmentStyle>,
  },
};
