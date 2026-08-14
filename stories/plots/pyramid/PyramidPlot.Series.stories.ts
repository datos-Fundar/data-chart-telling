import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/PyramidPlot/Series',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    series: { control: false },
    data: { control: false },
  },
  parameters: {
    docs: { source: { name: 'PyramidPlot' } },
  },
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Two mirrored series from grouped data — women on the left, men on the right.
 *
 * PyramidPlot automatically creates one series per unique `z` value (sex: 'Mujeres' | 'Varones'),
 * using the sex's name from the grouping column. Series are sorted alphabetically,
 * so 'Mujeres' < 'Varones' and appears on the left.
 */
export const Default: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { label: 'Grupo de edad', domain: AGE_GROUPS } },
  },
};

/**
 * Alternative approach: pass explicit series for female and male populations.
 * Both series share the same y axis (age groups) and plot as a diverging bar chart.
 *
 * The series order determines visual placement: first series goes left, second goes right.
 * A series' `x` is the category accessor (age group) and `y` is the magnitude
 * (population %) — the same convention `buildSeries` uses internally for the
 * `data`/`x`/`y`/`z` shorthand above.
 */
export const ExplicitSeries: Story = {
  args: {
    series: [
      {
        name: 'Mujeres',
        x: 'ageGroup',
        y: 'pct',
        data: POPULATION_PYRAMID.filter((d) => d.year === 2022 && d.sex === 'Mujeres'),
      } satisfies Series<PopulationRow>,
      {
        name: 'Varones',
        x: 'ageGroup',
        y: 'pct',
        data: POPULATION_PYRAMID.filter((d) => d.year === 2022 && d.sex === 'Varones'),
      } satisfies Series<PopulationRow>,
    ],
    scales: { y: { label: 'Grupo de edad', domain: AGE_GROUPS } },
  },
};

/**
 * Different year snapshot — shows the population pyramid for 1991, allowing
 * time-series comparison with the Default (2022) story.
 *
 * The age structure is distinctly different: younger age groups are proportionally larger
 * in 1991 than in 2022, reflecting the demographic transition.
 */
export const YearlySnapshot1991: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 1991),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { label: 'Grupo de edad', domain: AGE_GROUPS } },
  },
};

/**
 * Alternate year (2010) — shows an intermediate state between the first and most recent snapshots.
 */
export const YearlySnapshot2010: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2010),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { label: 'Grupo de edad', domain: AGE_GROUPS } },
  },
};
