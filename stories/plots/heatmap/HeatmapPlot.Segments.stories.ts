import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/common';
import type { Segments, CellSegmentStyle } from '$lib/types/plots/styles';
import { EMPLOYMENT_BY_AGE_PROVINCE, type AgeProvinceCell } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/HeatmapPlot/Segments',
  component: HeatmapPlot,
  tags: ['autodocs'],
  args: {
    width: 520,
    height: 420,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 900, step: 20 } },
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
    name: 'employment_rate',
    x: 'ageGroup',
    y: 'province',
    z: 'pct',
    data: EMPLOYMENT_BY_AGE_PROVINCE,
  } satisfies Series<AgeProvinceCell>,
];

// ── Stories ───────────────────────────────────────────────────────────────────
// Heatmap segments use the `'default'` key — heatmaps have no named series.

/**
 * Highlight a region — dims all cells except those in a specific age group
 * and province range. Useful for focusing on a particular demographic slice.
 */
export const HighlightRegion: Story = {
  args: {
    series: SERIES,
    segments: {
      default: [
        {
          areas: [
            {
              x: { from: '25-34', to: '45-54' },
              y: { from: 'Buenos Aires', to: 'Mendoza' },
            },
          ],
          style: { fillOpacity: 1 },
        },
        {
          style: { fillOpacity: 0.3 },
        },
      ],
    } satisfies Segments<CellSegmentStyle>,
  },
};

/**
 * Highlight rows (age groups) — all cells in the 35-44 and 45-54 age groups
 * are highlighted with full opacity; others are dimmed.
 */
export const HighlightRows: Story = {
  args: {
    series: SERIES,
    segments: {
      default: [
        {
          areas: [
            { x: { from: '35-44', to: '35-44' } },
            { x: { from: '45-54', to: '45-54' } },
          ],
          style: { fillOpacity: 0.95 },
        },
        {
          style: { fillOpacity: 0.25 },
        },
      ],
    } satisfies Segments<CellSegmentStyle>,
  },
};

/**
 * Highlight columns (provinces) — all cells in specific provinces are shown
 * at full brightness; others are faded.
 */
export const HighlightColumns: Story = {
  args: {
    series: SERIES,
    segments: {
      default: [
        {
          areas: [
            { y: { from: 'Buenos Aires', to: 'Santa Fe' } },
            { y: { from: 'Tucumán', to: 'Tucumán' } },
          ],
          style: { fillOpacity: 1 },
        },
        {
          style: { fillOpacity: 0.3 },
        },
      ],
    } satisfies Segments<CellSegmentStyle>,
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
              x: { from: '25-34', to: '35-44' },
              y: { from: 'Buenos Aires', to: 'Santa Fe' },
            },
          ],
          style: { fillOpacity: 1 },
        },
        {
          areas: [
            {
              x: { from: '45-54', to: '55-64' },
              y: { from: 'Mendoza', to: 'Tucumán' },
            },
          ],
          style: { fillOpacity: 0.6 },
        },
        {
          style: { fillOpacity: 0.25 },
        },
      ],
    } satisfies Segments<CellSegmentStyle>,
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
              x: { from: '18-24', to: '34-34' },
              y: { from: 'Buenos Aires', to: 'Córdoba' },
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
    } satisfies Segments<CellSegmentStyle>,
  },
};
