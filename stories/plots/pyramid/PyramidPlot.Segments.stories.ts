import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { Segments, BarSegmentStyle, Area } from '$lib/types/plots/styles';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/PyramidPlot/Segments',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 950, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    segments: { control: false },
  },
  parameters: {
    docs: { source: { name: 'PyramidPlot' } },
  },
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const DATA = POPULATION_PYRAMID.filter((d) => d.year === 2022);

// Age group labels are 5-year bins ('0-4', '5-9', … '85+') whose bucket-start
// numbers don't sort correctly as plain strings (e.g. '5-9' > '20-24'
// lexicographically). A `from`/`to` *range* area would silently mismatch, so
// each matching bucket is listed as its own single-point area instead —
// equality-only matching, immune to that ordering quirk.
function areasFor(ageGroups: string[]): Area[] {
  return ageGroups.map((ageGroup) => ({ x: { from: ageGroup, to: ageGroup } }));
}

function bucketStart(ageGroup: string): number {
  return parseInt(ageGroup.split('-')[0]);
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * `segments` dims every age group except a few highlighted ones. Applied via
 * the `default` key, so the same rule affects both series (Mujeres, Varones).
 */
export const HighlightedSegments: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    segments: {
      default: [
        { areas: areasFor(['80-84', '85+']), style: { fillOpacity: 1 } },
        { style: { fillOpacity: 0.25 } },
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};

/**
 * Highlight working age population — dims all age groups except those
 * typically in the labour force (18-64), highlighting the economically active population.
 */
export const WorkingAgeHighlight: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    segments: {
      default: [
        {
          areas: areasFor(
            AGE_GROUPS.filter((ag) => bucketStart(ag) >= 18 && bucketStart(ag) < 65),
          ),
          style: { fillOpacity: 1 },
        },
        { style: { fillOpacity: 0.2 } },
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};

/**
 * Highlight youth and elderly — dims middle age groups, highlighting both
 * young (0-24) and elderly (65+) populations.
 */
export const YouthAndElderlyHighlight: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    segments: {
      default: [
        {
          areas: areasFor(
            AGE_GROUPS.filter((ag) => bucketStart(ag) < 25 || bucketStart(ag) >= 65),
          ),
          style: { fillOpacity: 0.95 },
        },
        { style: { fillOpacity: 0.2 } },
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};

/**
 * Highlight by decade — every other decade (0s, 20s, 40s, 60s+) gets a
 * higher opacity than the rest, creating a visual pattern. Every age group
 * falls into exactly one of the two segments, so no catch-all is needed.
 */
export const ByDecadePattern: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    segments: {
      default: [
        {
          areas: areasFor(AGE_GROUPS.filter((ag) => Math.floor(bucketStart(ag) / 10) % 2 === 0)),
          style: { fillOpacity: 0.9 },
        },
        {
          areas: areasFor(AGE_GROUPS.filter((ag) => Math.floor(bucketStart(ag) / 10) % 2 === 1)),
          style: { fillOpacity: 0.3 },
        },
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};

/**
 * Asymmetric highlighting — female side highlights elderly (80+), male side
 * highlights working age (25-54), showing two different demographic interests.
 * Segments keyed by series name apply only to that series.
 */
export const AsymmetricHighlight: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    segments: {
      Mujeres: [
        { areas: areasFor(['80-84', '85+']), style: { fillOpacity: 1 } },
        { style: { fillOpacity: 0.25 } },
      ],
      Varones: [
        {
          areas: areasFor(
            AGE_GROUPS.filter((ag) => bucketStart(ag) >= 25 && bucketStart(ag) < 55),
          ),
          style: { fillOpacity: 1 },
        },
        { style: { fillOpacity: 0.25 } },
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};

/**
 * Custom fill color on the highlighted area — combines a distinct color
 * with a dimmed catch-all for the rest, on the `default` key.
 */
export const CustomColorHighlight: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    segments: {
      default: [
        { areas: areasFor(['80-84', '85+']), style: { fill: '#d6336c', fillOpacity: 0.9 } },
        { style: { fillOpacity: 0.2 } },
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};
