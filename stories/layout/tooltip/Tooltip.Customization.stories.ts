import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LineChart from '$lib/charts/line/Chart.svelte';
import CustomContentDemo from './CustomContentDemo.svelte';
import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

/** Custom tooltip text, anchor placement, and fully custom markup. */
const meta = {
	title: 'Layout/Tooltip/Customization',
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

/** Custom tooltip text via `format`. */
export const CustomFormat: Story = {
	args: {
		title: 'Formato personalizado',
		data: TIME_SERIES.filter((d) => d.region === 'Norte'),
		z: 'metric' as keyof SeriesPoint,
		tooltip: {
			strategy: 'x',
			format: (row) => {
				const r = row as unknown as SeriesPoint;
				return `${r.metric} · ${r.year}\n$ ${r.value} M`;
			}
		},
		markers: [{ type: 'hover' }]
	}
};

/**
 * `tooltip.anchorX`/`anchorY` set which side of the cursor the floating box
 * prefers; falls back toward the opposite side if the preferred one would
 * overflow the chart's own bounds.
 */
export const CustomAnchor: Story = {
	args: {
		title: 'Anchor personalizado',
		subtitle: 'El tooltip se ancla arriba a la izquierda del cursor',
		data: TIME_SERIES.filter((d) => d.region === 'Norte'),
		z: 'metric' as keyof SeriesPoint,
		tooltip: { strategy: 'x', anchorX: 'left', anchorY: 'top' },
		markers: [{ type: 'hover' }]
	}
};

/** Fully custom tooltip markup via `content`, replacing the default floating label. */
export const CustomContent: StoryObj = {
	render: () => ({ Component: CustomContentDemo })
};
