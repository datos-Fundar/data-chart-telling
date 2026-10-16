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
		if (el.classList.contains('dct-figure-chrome__row')) {
			return `row(${[...el.children].map((cell) => named(cell)).join(', ')})`;
		}
		return named(el);
	});
}

function named(el: Element): string {
	{
		if (el.classList.contains('dct-figure-chrome__body')) return 'plot';
		if (el.classList.contains('dct-figure-chrome__divider')) return 'divider';
		if (el.classList.contains('dct-figure-chrome__legend')) return 'legend';
		if (el.classList.contains('dct-figure-chrome__timeline')) return 'timeline';
		if (el.classList.contains('dct-figure-chrome__caption'))
			return `caption:${el.textContent?.trim()}`;
		const parts = [...el.children].map((c) =>
			c.classList.contains('dct-figure-chrome__title') ? 'title' : 'subtitle'
		);
		return `heading:${parts.join('+')}`;
	}
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

	test('a row in `order` draws its blocks side by side', async () => {
		expect(
			await blocks({
				title: 'T',
				caption: 'C',
				legend: LEGEND,
				order: ['title', '(legend, caption)', 'plot']
			})
		).toEqual(['heading:title', 'row(legend, caption:C)', 'plot']);
	});

	test('a row with the plot gives it the width the others leave', async () => {
		const { container } = await render(LinePlot, {
			width: 600,
			height: 300,
			data: DATA,
			x: 'year',
			y: 'value',
			legend: LEGEND,
			order: ['(plot, legend)']
		});
		const root = container.querySelector('.dct-figure-chrome')!;
		await vi.waitFor(() => expect(root.querySelector('.dct-plot')).toBeTruthy());
		const row = root.querySelector('.dct-figure-chrome__row')!;
		const [plot, legend] = [...row.children].map((el) => el.getBoundingClientRect().width);
		expect(plot).toBeGreaterThan(legend * 2);
		expect(plot + legend).toBeLessThanOrEqual(row.getBoundingClientRect().width);
	});

	test('a row keeps each block once, and is a plain block when only one is drawn', async () => {
		expect(await blocks({ title: 'T', order: ['(title, subtitle)', '(plot, title)'] })).toEqual([
			'heading:title',
			'plot'
		]);
	});

	test('a vertical rule timeline sits beside the plot, as `(plot, timeline)` would', async () => {
		const timeline = { accessor: 'year', type: 'rule', progress: 0.5, orientation: 'vertical' };
		expect(await blocks({ title: 'T', timeline })).toEqual([
			'heading:title',
			'divider',
			'row(plot, timeline)'
		]);
		// Wherever `order` has the plot, and even when it never names the timeline.
		expect(await blocks({ title: 'T', timeline, order: ['plot', 'title'] })).toEqual([
			'row(plot, timeline)',
			'heading:title'
		]);
	});

	test('a row of `order` that places the vertical timeline wins', async () => {
		const timeline = { accessor: 'year', type: 'rule', progress: 0.5, orientation: 'vertical' };
		expect(await blocks({ title: 'T', timeline, order: ['title', '(timeline, plot)'] })).toEqual([
			'heading:title',
			'row(timeline, plot)'
		]);
	});

	test('a horizontal rule timeline is the `timeline` block, wherever `order` puts it', async () => {
		const timeline = { accessor: 'year', type: 'rule', progress: 0.5, orientation: 'horizontal' };
		expect(await blocks({ title: 'T', timeline })).toEqual([
			'heading:title',
			'divider',
			'plot',
			'timeline'
		]);
		expect(await blocks({ title: 'T', timeline, order: ['timeline', 'plot'] })).toEqual([
			'timeline',
			'plot'
		]);
	});
});

describe('FigureChrome - a rule timeline', () => {
	async function boxes(orientation: 'vertical' | 'horizontal') {
		const { container } = await render(LinePlot, {
			width: 600,
			height: 400,
			data: DATA,
			x: 'year',
			y: 'value',
			timeline: { accessor: 'year', type: 'rule', progress: 0.5, orientation }
		});
		const root = container.querySelector('.dct-figure-chrome')!;
		await vi.waitFor(() => expect(root.querySelector('.dct-timeline-rule svg')).toBeTruthy());
		const rect = (selector: string) => root.querySelector(selector)!.getBoundingClientRect();
		return {
			rule: rect('.dct-timeline-rule'),
			svg: rect('.dct-timeline-rule svg'),
			body: rect('.dct-figure-chrome__body')
		};
	}

	test('a vertical one is as tall as the plot beside it, and as wide as `thickness`', async () => {
		const { rule, svg, body } = await boxes('vertical');
		expect(rule.width).toBe(60);
		expect(Math.abs(rule.height - body.height)).toBeLessThan(2);
		expect(Math.abs(svg.height - rule.height)).toBeLessThan(2);
		expect(rule.left).toBeGreaterThanOrEqual(body.right - 1);
	});

	test('a horizontal one is as wide as the plot, and as tall as `thickness`, below it', async () => {
		const { rule, body } = await boxes('horizontal');
		expect(rule.height).toBe(60);
		expect(Math.abs(rule.width - body.width)).toBeLessThan(2);
		expect(rule.top).toBeGreaterThanOrEqual(body.bottom - 1);
	});
});
