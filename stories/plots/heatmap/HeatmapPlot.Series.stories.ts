import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/common';
import { EMPLOYMENT_BY_AGE_PROVINCE, ROOMS_PEOPLE_DENSITY, type AgeProvinceCell, type RoomsPeopleCell } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/HeatmapPlot/Series',
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
    data: { control: false },
  },
  parameters: {
    docs: { source: { name: 'HeatmapPlot' } },
  },
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Single series with explicit series object — data is grouped into one series
 * with x, y, z dimensions mapping to 'ageGroup', 'province', and 'pct' fields.
 *
 * The heatmap displays employment rates across age groups and provinces.
 */
export const Default: Story = {
  args: {
    series: [
      {
        name: 'employment_rate',
        x: 'ageGroup',
        y: 'province',
        z: 'pct',
        data: EMPLOYMENT_BY_AGE_PROVINCE,
      } satisfies Series<AgeProvinceCell>,
    ],
  },
};

/**
 * Alternative data structure — rooms × people density matrix.
 * Shows the distribution of household density by number of rooms and occupants.
 */
export const RoomsPeopleDensity: Story = {
  args: {
    series: [
      {
        name: 'household_density',
        x: 'rooms',
        y: 'people',
        z: 'pct',
        data: ROOMS_PEOPLE_DENSITY,
      } satisfies Series<RoomsPeopleCell>,
    ],
  },
};

/**
 * Using data + x + y + z shorthand — alternative to passing a series array.
 * Equivalent to the Default story but with less boilerplate.
 */
export const UsingDataShorthand: Story = {
  args: {
    data: EMPLOYMENT_BY_AGE_PROVINCE,
    x: 'ageGroup',
    y: 'province',
    z: 'pct',
  },
};
