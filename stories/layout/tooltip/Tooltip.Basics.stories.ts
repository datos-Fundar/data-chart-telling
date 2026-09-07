import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LineChart from '$lib/charts/line/Chart.svelte';
import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

/**
 * `tooltip` enables the floating HTML label; `markers` opts into the in-SVG
 * hover crosshair/dot. The two are independent — either, both, or neither.
 */
const meta = {
	title: 'Layout/Tooltip/Basics',
	component: LineChart,
	tags: ['autodocs'],
	args: { width: 680, height: 440, data: TIME_SERIES, x: 'year', y: 'value' },
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
		height: { control: { type: 'range', min: 240, max: 700, step: 20 } },
		data: { control: false },
		x: { control: false },
		y: { control: false },
		z: { control: false },
		tooltip: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LineChart' } }
	}
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single grouped line chart with `tooltip` + the hover marker. */
export const Basic: Story = {
	args: {
		title: 'PBI vs. Empleo',
		subtitle: 'Pasá el cursor por las líneas',
		data: TIME_SERIES.filter((d) => d.region === 'Norte'),
		z: 'metric' as keyof SeriesPoint,
		tooltip: true,
		markers: [{ type: 'hover' }]
	}
};

/** Tooltip text only — no in-SVG crosshair/dot. */
export const TooltipOnly: Story = {
	args: {
		title: 'Solo tooltip (sin marcador)',
		data: TIME_SERIES.filter((d) => d.region === 'Norte'),
		z: 'metric' as keyof SeriesPoint,
		tooltip: true
	}
};

/** Hover marker only — no floating HTML tooltip. */
export const MarkerOnly: Story = {
	args: {
		title: 'Solo marcador (sin tooltip)',
		data: TIME_SERIES.filter((d) => d.region === 'Norte'),
		z: 'metric' as keyof SeriesPoint,
		markers: [{ type: 'hover' }]
	}
};
