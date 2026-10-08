import type { Meta } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { renderSource } from '../../common/docsSource';
import { LIFE_EXPECTANCY } from '../../plots/line/data';
import { GOOGL_AUGUST_2026, AMZN_AUGUST_2026, type StockDay } from '../../data/stockPrices';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `x1`/`x2`/`y1`/`y2`: interval-position channels bound to the plot's shared
// x/y scale. Two examples: a `bar` marker using `y1`/`y2` as plain field
// keys, and a `rect` marker using `x1`/`x2`/`y1`/`y2` as literal numbers.

type PricedDay = StockDay & { company: 'GOOGL' | 'AMZN'; avg: number };

function withAvg(days: StockDay[], company: PricedDay['company']): PricedDay[] {
	return days.map((d) => ({ ...d, company, avg: (d.open + d.close) / 2 }));
}

const googl = withAvg(GOOGL_AUGUST_2026, 'GOOGL');
const amzn = withAvg(AMZN_AUGUST_2026, 'AMZN');

const upDownScale = {
	color: { domain: ['up', 'down'], scheme: { up: '#16a34a', down: '#dc2626' } }
};

const meta = {
	title: 'Channels/X1X2Y1Y2',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;

const stockPriceProps = {
	width: 940,
	height: 460,
	data: [...googl, ...amzn],
	x: 'date',
	y: 'avg',
	color: 'company',
	scales: {
		x: { tickRotate: -45, label: false },
		color: {
			scheme: { GOOGL: 'darkblue', AMZN: 'darkorange' }
		}
	},
	segments: {
		default: [
			{
				styles: {
					stroke: { strokeDasharray: '3 3', strokeWidth: 1 }
				}
			}
		]
	},
	markers: [
		{
			type: 'bar',
			role: 'segment',
			isHorizontal: false,
			x: 'date',
			y1: 'low',
			y2: 'high',
			styles: { fill: 'black' },
			insetLeft: 0.47,
			insetRight: 0.47
		},
		{
			type: 'bar',
			role: 'segment',
			isHorizontal: false,
			x: 'date',
			y1: 'open',
			y2: 'close',
			color: (d: PricedDay) => {
				return d.close >= d.open ? 'up' : 'down';
			},
			scales: upDownScale,
			insetLeft: 0.35,
			insetRight: 0.35
		}
	] satisfies AxisBasedMarkersConfig[],
	styles: {
		values: {
			show: true,
			format: (v: number, name: string) => `${name} - ${v.toFixed(2)} USD`
		}
	}
};

/**
 * A `bar` marker (`role: 'segment'`) using `y1`/`y2` as plain field keys -
 * two bars per category, each drawn from a different field pair.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BarMarker: any = {
	parameters: {
		docs: { source: { code: renderSource('LinePlot', stockPriceProps) } }
	},
	render: () => ({
		Component: LinePlot,
		props: stockPriceProps
	})
};

const rectMarkerProps = {
	width: 940,
	height: 400,
	data: LIFE_EXPECTANCY,
	x: 'year',
	y: 'value',
	color: 'sex',
	markers: [
		{
			type: 'rect',
			data: [{}],
			x1: 2010,
			x2: 2014,
			y1: 70,
			y2: 90,
			styles: { fill: '#fde68a', fillOpacity: 0.5 }
		}
	] satisfies AxisBasedMarkersConfig[]
};

/**
 * A `rect` marker using `x1`/`x2`/`y1`/`y2` as literal numbers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RectMarker: any = {
	parameters: {
		docs: { source: { code: renderSource('LinePlot', rectMarkerProps) } }
	},
	render: () => ({
		Component: LinePlot,
		props: rectMarkerProps
	})
};
