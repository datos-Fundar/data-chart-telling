import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/common';

type Cell = { rooms: number; people: number; pct: number };

const CELLS: Cell[] = [1, 2, 3, 4].flatMap((rooms) =>
  [1, 2, 3, 4].map((people) => ({
    rooms,
    people,
    pct: Math.max(0, 4 - Math.abs(rooms - people)) / 10,
  })),
);

const meta = {
  title: 'Plots/HeatmapPlot',
  component: HeatmapPlot,
  tags: ['autodocs'],
  args: {
    width: 520,
    height: 420,
    series: [{ name: 'heat', data: CELLS, x: 'rooms', y: 'people', z: 'pct' }] satisfies Series<Cell>[],
    scales: { x: { label: 'Ambientes' }, y: { label: 'Personas' } },
    styles: { values: { format: (v: number) => `${(v * 100).toFixed(0)}%` } },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 900, step: 20 } },
    height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
    series: { control: false },
  },
  parameters: {
    docs: { source: { name: 'HeatmapPlot' } },
  },
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default value-coloured grid with cell labels. */
export const Default: Story = {};

/** Custom colour ramp and no cell labels. */
export const WarmRampNoLabels: Story = {
  args: {
    styles: { colors: { min: 'darkblue', max: 'cornflowerblue' }, values: { show: false } },
  },
};
