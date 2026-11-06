import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../plots/_helpers/svg';

const SERIES = [{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE }];

/** Two rows, told apart by `big`. */
const ROWS = [
	{ at: 1960, from: 1955, to: 1965, lo: 55, hi: 65, big: false },
	{ at: 1990, from: 1985, to: 1995, lo: 75, hi: 85, big: true }
];

const MARKERS: Record<string, AxisBasedMarkersConfig> = {
	rect: {
		type: 'rect',
		data: ROWS,
		x1: 'from',
		x2: 'to',
		y1: 'lo',
		y2: 'hi',
		styles: {
			fill: (row: (typeof ROWS)[number]) => (row.big ? 'tomato' : 'steelblue'),
			fillOpacity: (row: (typeof ROWS)[number]) => (row.big ? 0.55 : 0.12),
			strokeWidth: (row: (typeof ROWS)[number]) => (row.big ? 4 : 1),
			stroke: 'black'
		}
	} as AxisBasedMarkersConfig,
	dot: {
		type: 'dot',
		data: ROWS,
		x: 'at',
		y: 'hi',
		r: 8,
		styles: {
			dotFill: (row: (typeof ROWS)[number]) => (row.big ? 'tomato' : 'steelblue'),
			dotFillOpacity: (row: (typeof ROWS)[number]) => (row.big ? 0.55 : 0.12)
		}
	} as AxisBasedMarkersConfig
};

async function shapes(marker: AxisBasedMarkersConfig) {
	const { container } = await render(LinePlot, {
		width: 500,
		height: 320,
		series: SERIES,
		markers: [marker]
	});
	const svg = await waitForSvg(container);
	await expect
		.poll(() => svg.querySelectorAll('[style*="tomato"], [fill="tomato"]').length)
		.toBeGreaterThan(0);
	const paint = (el: Element, name: string) =>
		el.getAttribute(name) ?? (el as SVGElement).style.getPropertyValue(name);
	const find = (colour: string) =>
		svg.querySelector(`[fill="${colour}"], [style*="${colour}"]`) as SVGElement;
	return { find, paint };
}

describe.each(Object.keys(MARKERS))('%s marker - styles that are functions of the row', (kind) => {
	test('gives each row its own opacity, as it is', async () => {
		const { find, paint } = await shapes(MARKERS[kind]);
		expect(Number(paint(find('tomato'), 'fill-opacity'))).toBeCloseTo(0.55);
		expect(Number(paint(find('steelblue'), 'fill-opacity'))).toBeCloseTo(0.12);
	});
});

describe('rect marker - styles that are functions of the row', () => {
	test('gives each row its own stroke width', async () => {
		const { find, paint } = await shapes(MARKERS.rect);
		expect(parseFloat(paint(find('tomato'), 'stroke-width'))).toBe(4);
		expect(parseFloat(paint(find('steelblue'), 'stroke-width'))).toBe(1);
	});
});

describe('styles that name a field of the rows', () => {
	const FIELD_ROWS = [
		{ ...ROWS[0], tint: 'steelblue', alpha: 0.12, weight: 1 },
		{ ...ROWS[1], tint: 'tomato', alpha: 0.55, weight: 4 }
	];
	const rect = {
		type: 'rect',
		data: FIELD_ROWS,
		x1: 'from',
		x2: 'to',
		y1: 'lo',
		y2: 'hi',
		styles: { fill: 'tint', fillOpacity: 'alpha', strokeWidth: 'weight', stroke: 'black' }
	} as AxisBasedMarkersConfig;

	test('reads a color, an opacity and a width off each row', async () => {
		const { find, paint } = await shapes(rect);
		expect(Number(paint(find('tomato'), 'fill-opacity'))).toBeCloseTo(0.55);
		expect(Number(paint(find('steelblue'), 'fill-opacity'))).toBeCloseTo(0.12);
		expect(parseFloat(paint(find('tomato'), 'stroke-width'))).toBe(4);
		expect(parseFloat(paint(find('steelblue'), 'stroke-width'))).toBe(1);
	});

	test('draws a color that no field is named after as it is', async () => {
		const { find } = await shapes({
			...rect,
			styles: { fill: 'tomato', fillOpacity: 'alpha' }
		} as AxisBasedMarkersConfig);
		expect(find('tomato')).not.toBeNull();
	});
});
