import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/PyramidPlot/Tooltip',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 560,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 900, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    tooltip: { control: false },
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
 * No tooltip — hovering over the bars produces no floating label.
 * This is the default behaviour when `tooltip` is omitted.
 */
export const NoTooltip: Story = {
  args: BASE_ARGS,
};

/**
 * Basic tooltip — the `format` callback receives the hovered bar's row and
 * returns the string shown in the floating box.
 *
 * Hover over any bar to activate. A standalone `PyramidPlot` uses
 * `facetId: ''` and `sync: false`.
 */
export const BasicTooltip: Story = {
  args: {
    ...BASE_ARGS,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { ageGroup, sex, pct } = row as PopulationRow;
        return `${sex} - ${ageGroup}: ${pct}%`;
      },
    },
  },
};

/**
 * Rich multi-line format — `\n` splits the tooltip string across lines.
 * The first line becomes the heading, the rest the body text.
 */
export const RichFormat: Story = {
  args: {
    ...BASE_ARGS,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { ageGroup, sex, pct } = row as PopulationRow;
        return `${sex}\nAge Group: ${ageGroup}\nPopulation: ${pct.toFixed(2)}%`;
      },
    },
  },
};

/**
 * Computed tooltip — the format function can derive any string from the row.
 * Here it shows the population as a fraction and relative to a base cohort size.
 */
export const ComputedFormat: Story = {
  args: {
    ...BASE_ARGS,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { ageGroup, sex, pct } = row as PopulationRow;
        const baselinePct = 3.0;
        const ratio = (pct / baselinePct).toFixed(2);
        return `${sex} (${ageGroup}): ${pct.toFixed(2)}% (${ratio}× baseline)`;
      },
    },
  },
};

/**
 * Series-filtered tooltip — `series: ['Mujeres']` restricts hover matching
 * to bars that belong to the female side only. Hovering over male bars shows
 * no tooltip.
 */
export const FemaleOnly: Story = {
  args: {
    ...BASE_ARGS,
    tooltip: {
      facetId: '',
      sync: false,
      series: ['Mujeres'],
      format: (row) => {
        const { ageGroup, pct } = row as PopulationRow;
        return `Female - ${ageGroup}: ${pct.toFixed(2)}%`;
      },
    },
  },
};

/**
 * Series-filtered to males — same as FemaleOnly but for the male (Varones) side.
 */
export const MaleOnly: Story = {
  args: {
    ...BASE_ARGS,
    tooltip: {
      facetId: '',
      sync: false,
      series: ['Varones'],
      format: (row) => {
        const { ageGroup, pct } = row as PopulationRow;
        return `Male - ${ageGroup}: ${pct.toFixed(2)}%`;
      },
    },
  },
};

/**
 * Both sides with sex-aware formatting — the tooltip responds to both female
 * and male bars and includes the sex in a clear format.
 */
export const BothSidesFormatted: Story = {
  args: {
    ...BASE_ARGS,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { sex, ageGroup, pct } = row as PopulationRow;
        const sexEmoji = sex === 'Mujeres' ? '♀' : '♂';
        return `${sexEmoji} ${sex}\n${ageGroup}: ${pct.toFixed(2)}%`;
      },
    },
  },
};

/**
 * Percentage of total by cohort — shows what percentage of the population
 * that age-sex cohort represents.
 */
export const CohortPercentage: Story = {
  args: {
    ...BASE_ARGS,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { sex, ageGroup, pct } = row as PopulationRow;
        return `${sex} (${ageGroup})\n${pct.toFixed(2)}% of population`;
      },
    },
  },
};
