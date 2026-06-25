import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { SeriesAwareSegmentsMap, PyramidSegmentStyle } from '$lib/types/plots/styles';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/PyramidPlot/Segments',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 560,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 900, step: 20 } },
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
const BASE_ARGS = {
  data: DATA,
  x: 'pct',
  y: 'ageGroup',
  z: 'sex',
  scales: { y: { domain: AGE_GROUPS } },
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * `segments` dims every age group except a few highlighted ones.
 * Useful for drawing attention to specific demographic cohorts (e.g., working age, retired).
 */
export const HighlightedSegments: Story = {
  args: {
    ...BASE_ARGS,
    segments: Object.fromEntries(
      (['Mujeres', 'Varones'] as const).map((name) => [
        name,
        AGE_GROUPS.map((ageGroup) => ({
          from: ageGroup,
          to: ageGroup,
          style: { fillOpacity: ['80-84', '85+'].includes(ageGroup) ? 1 : 0.25 },
        })),
      ]),
    ) satisfies SeriesAwareSegmentsMap<PyramidSegmentStyle>,
  },
};

/**
 * Highlight working age population — dims all age groups except those
 * typically in the labour force (18-64), highlighting the economically active population.
 */
export const WorkingAgeHighlight: Story = {
  args: {
    ...BASE_ARGS,
    segments: Object.fromEntries(
      (['Mujeres', 'Varones'] as const).map((name) => [
        name,
        AGE_GROUPS.map((ageGroup) => {
          const ageStart = parseInt(ageGroup.split('-')[0]);
          const isWorkingAge = ageStart >= 18 && ageStart < 65;
          return {
            from: ageGroup,
            to: ageGroup,
            style: { fillOpacity: isWorkingAge ? 1 : 0.2 },
          };
        }),
      ]),
    ) satisfies SeriesAwareSegmentsMap<PyramidSegmentStyle>,
  },
};

/**
 * Highlight youth and elderly — dims middle age groups, highlighting both
 * young (0-24) and elderly (65+) populations.
 */
export const YouthAndElderlyHighlight: Story = {
  args: {
    ...BASE_ARGS,
    segments: Object.fromEntries(
      (['Mujeres', 'Varones'] as const).map((name) => [
        name,
        AGE_GROUPS.map((ageGroup) => {
          const ageStart = parseInt(ageGroup.split('-')[0]);
          const isYouthOrElderly = ageStart < 25 || ageStart >= 65;
          return {
            from: ageGroup,
            to: ageGroup,
            style: { fillOpacity: isYouthOrElderly ? 0.95 : 0.2 },
          };
        }),
      ]),
    ) satisfies SeriesAwareSegmentsMap<PyramidSegmentStyle>,
  },
};

/**
 * Highlight by decade — groups and highlights every other decade (0s, 20s, 40s, 60s+)
 * with alternating opacity levels, creating a visual pattern.
 */
export const ByDecadePattern: Story = {
  args: {
    ...BASE_ARGS,
    segments: Object.fromEntries(
      (['Mujeres', 'Varones'] as const).map((name) => [
        name,
        AGE_GROUPS.map((ageGroup) => {
          const ageStart = parseInt(ageGroup.split('-')[0]);
          const decade = Math.floor(ageStart / 10);
          const opacity = decade % 2 === 0 ? 0.9 : 0.3;
          return {
            from: ageGroup,
            to: ageGroup,
            style: { fillOpacity: opacity },
          };
        }),
      ]),
    ) satisfies SeriesAwareSegmentsMap<PyramidSegmentStyle>,
  },
};

/**
 * Asymmetric highlighting — female side highlights elderly (80+), male side
 * highlights working age (25-54), showing two different demographic interests.
 */
export const AsymmetricHighlight: Story = {
  args: {
    ...BASE_ARGS,
    segments: {
      Mujeres: AGE_GROUPS.map((ageGroup) => ({
        from: ageGroup,
        to: ageGroup,
        style: { fillOpacity: ageGroup === '80-84' || ageGroup === '85+' ? 1 : 0.25 },
      })),
      Varones: AGE_GROUPS.map((ageGroup) => {
        const ageStart = parseInt(ageGroup.split('-')[0]);
        const isWorkingAge = ageStart >= 25 && ageStart < 55;
        return {
          from: ageGroup,
          to: ageGroup,
          style: { fillOpacity: isWorkingAge ? 1 : 0.25 },
        };
      }),
    } satisfies SeriesAwareSegmentsMap<PyramidSegmentStyle>,
  },
};
