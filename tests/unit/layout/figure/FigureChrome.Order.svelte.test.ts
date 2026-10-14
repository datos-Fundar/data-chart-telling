import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { LegendSection } from '$lib/types/layout/legend';

const DATA = [2000, 2005, 2010].map((year, i) => ({ year, value: 10 + i }));
const LEGEND: LegendSection[] = [{ type: 'discrete', items: [{ name: 'Value', symbol: 'line' }] }];

/** Each block the container draws, top to bottom, named after what it holds. */
async function blocks(props: Record<string, unknown>): Promise<string[]> {
	const { container } = await render(LinePlot, {
		width: 400,
		height: 300,
		data: DATA,
		x: 'year',
		y: 'value',
		...props
	});
	const root = container.querySelector('.dct-figure-chrome')!;
	await vi.waitFor(() => expect(root.querySelector('.dct-plot')).toBeTruthy());
	return [...root.children].map((el) => {
		if (el.classList.contains('dct-figure-chrome__body')) return 'plot';
		if (el.classList.contains('dct-figure-chrome__divider')) return 'divider';
		if (el.classList.contains('dct-figure-chrome__legend')) return 'legend';
		if (el.classList.contains('dct-figure-chrome__caption'))
			return `caption:${el.textContent?.trim()}`;
		const parts = [...el.children].map((c) =>
			c.classList.contains('dct-figure-chrome__title') ? 'title' : 'subtitle'
		);
		return `heading:${parts.join('+')}`;
	});
}

describe('FigureChrome - order', () => {
	test('defaults to title and subtitle, a divider, legend, plot, then caption', async () => {
		expect(await blocks({ title: 'T', subtitle: 'S', caption: 'C', legend: LEGEND })).toEqual([
			'heading:title+subtitle',
			'divider',
			'legend',
			'plot',
			'caption:C'
		]);
	});

	test('draws the blocks in `order`, leaving out the ones it skips', async () => {
		expect(
			await blocks({
				title: 'T',
				subtitle: 'S',
				caption: 'C',
				legend: LEGEND,
				order: ['plot', 'caption', 'subtitle']
			})
		).toEqual(['plot', 'caption:C', 'heading:subtitle']);
	});

	test('splits title and subtitle when something sits between them, and draws `plot` last when left out', async () => {
		expect(
			await blocks({
				title: 'T',
				subtitle: 'S',
				legend: LEGEND,
				order: ['title', 'legend', 'subtitle']
			})
		).toEqual(['heading:title', 'legend', 'heading:subtitle', 'plot']);
	});

	test('the default divider only draws below a title, subtitle or header', async () => {
		expect(await blocks({ title: 'T', legend: LEGEND })).toEqual([
			'heading:title',
			'divider',
			'legend',
			'plot'
		]);
		expect(await blocks({ caption: 'C', legend: LEGEND })).toEqual(['legend', 'plot', 'caption:C']);
	});

	test('draws every divider `order` asks for between two drawn blocks, and no other', async () => {
		expect(
			await blocks({
				title: 'T',
				caption: 'C',
				legend: LEGEND,
				order: ['divider', 'title', 'divider', 'plot', 'divider', 'divider', 'caption', 'divider']
			})
		).toEqual(['heading:title', 'divider', 'plot', 'divider', 'caption:C']);
		expect(
			await blocks({ title: 'T', order: ['title', 'divider', 'legend', 'divider', 'plot'] })
		).toEqual(['heading:title', 'divider', 'plot']);
	});
});
