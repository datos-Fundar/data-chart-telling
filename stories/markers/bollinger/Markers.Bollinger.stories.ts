import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { DAILY_TEMPERATURE, BUENOS_AIRES_TEMPERATURE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `bollinger` marker (svelteplot's own `BollingerX`/`BollingerY`) draws a
// moving average - a line - and a band `k` standard deviations either side of
// it - an area - from the rows it is given. Added to a plot, it reads the
// plot's own rows and takes its `x` and `y` unless it sets its own: the plot
// draws the raw readings as dots, and the marker adds the average and its band
// over them. The average runs along `x` when `x` is the ordered axis.

const meta = {
	title: 'Markers/Bollinger',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: BUENOS_AIRES_TEMPERATURE,
		x: 'date',
		y: 'temp',
		segments: { default: [{ styles: { dotRadius: 2, dotFillOpacity: 0.6, dotStroke: 'none' } }] },
		scales: {
			x: { type: 'time', tickFormat: { month: 'short' } },
			y: { label: 'Temperature (°C)' }
		}
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The defaults, `n: 20` and `k: 2`: a 20-day mean, and a band two standard deviations wide around it - over the plot's own rows. */
export const Default: Story = {
	args: {
		markers: [{ type: 'bollinger' }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `n: 60` averages over two months: a smoother mean, and a band that widens where the weather is changeable. */
export const LongWindow: Story = {
	args: {
		markers: [{ type: 'bollinger', n: 60 }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `k: 1`: a band one standard deviation wide, which about two days in three fall inside. */
export const NarrowBand: Story = {
	args: {
		markers: [{ type: 'bollinger', k: 1 }] satisfies AxisBasedMarkersConfig[]
	}
};

/** `styles.stroke` recolors the moving average and `styles.bandFill` its band. */
export const CustomStyle: Story = {
	args: {
		markers: [
			{ type: 'bollinger', styles: { stroke: '#7c3aed', bandFill: '#7c3aed' } }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** With `grouping`, every group gets its own average and band, from its own rows only. */
export const ByGroup: Story = {
	args: {
		data: DAILY_TEMPERATURE,
		color: 'city',
		markers: [{ type: 'bollinger', grouping: 'city', n: 30 }] satisfies AxisBasedMarkersConfig[]
	}
};
