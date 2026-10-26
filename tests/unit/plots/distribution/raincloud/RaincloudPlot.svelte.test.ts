import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import { waitForSvg } from '../../_helpers/svg';

const rows = Array.from({ length: 60 }, (_, i) => ({
	category: ['a', 'b', 'c'][i % 3],
	value: 10 + ((i * 7) % 23) + (i % 3) * 5,
	group: i % 2 === 0 ? 'F' : 'M'
}));

const base = { width: 500, height: 300, data: rows, x: 'category', y: 'value' };

const BARS = 'g.bar-y rect, g.bar-x rect';

const clouds = (svg: SVGElement) => Array.from(svg.querySelectorAll('.dct-violin > path'));
const drops = (svg: SVGElement) => Array.from(svg.querySelectorAll('g.dot path'));
const rect = (el: Element) => el.getBoundingClientRect();
const center = (r: DOMRect) => r.left + r.width / 2;

describe('RaincloudPlot', () => {
	test('draws one cloud per category and one dot per row', async () => {
		const { container } = render(RaincloudPlot, base);
		const svg = await waitForSvg(container);
		expect(clouds(svg)).toHaveLength(3);
		expect(drops(svg)).toHaveLength(rows.length);
	});

	test('the cloud rises on one side of the band, the rain falls on the other', async () => {
		const { container } = render(RaincloudPlot, base);
		const svg = await waitForSvg(container);
		const cloud = rect(clouds(svg)[0]);
		const firstBand = drops(svg)
			.filter((_, i) => i % 3 === 0)
			.map(rect);
		for (const drop of firstBand) expect(drop.right).toBeLessThanOrEqual(cloud.left + 1);
	});

	test('the box sits between the cloud and the rain by default', async () => {
		const { container } = render(RaincloudPlot, base);
		const svg = await waitForSvg(container);
		const cloud = rect(clouds(svg)[0]);
		const bar = rect(svg.querySelector(BARS)!);
		expect(bar.right).toBeLessThanOrEqual(cloud.left + 1);
	});

	test('`styles.box.position` moves the box over the cloud or the rain', async () => {
		const at = async (position: 'cloud' | 'rain') => {
			const { container } = render(RaincloudPlot, { ...base, styles: { box: { position } } });
			const svg = await waitForSvg(container);
			return center(rect(svg.querySelector(BARS)!));
		};
		const cloud = await at('cloud');
		const rain = await at('rain');
		expect(cloud).toBeGreaterThan(rain);
	});

	test('`styles.box.quartiles: false` draws the box transparent', async () => {
		const { container } = render(RaincloudPlot, {
			...base,
			styles: { box: { quartiles: false } }
		});
		const svg = await waitForSvg(container);
		expect(getComputedStyle(svg.querySelector(BARS)!).fillOpacity).toBe('0');
	});

	test('`styles.box: false` and `styles.rain: false` leave each part out', async () => {
		const { container } = render(RaincloudPlot, {
			...base,
			styles: { box: false, rain: false }
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll(BARS)).toHaveLength(0);
		expect(drops(svg)).toHaveLength(0);
		expect(clouds(svg)).toHaveLength(3);
	});

	test('series share each category band side by side', async () => {
		const { container } = render(RaincloudPlot, { ...base, grouping: 'group' });
		const svg = await waitForSvg(container);
		const drawn = clouds(svg);
		expect(drawn).toHaveLength(6);
		expect(rect(drawn[0]).right).toBeLessThanOrEqual(rect(drawn[3]).left + 1);
	});

	test('a plot given the category on `y` draws horizontal rainclouds, the cloud on top', async () => {
		const { container } = render(RaincloudPlot, { ...base, x: 'value', y: 'category' });
		const svg = await waitForSvg(container);
		const cloud = rect(clouds(svg)[0]);
		expect(cloud.width).toBeGreaterThan(cloud.height);
		const firstBand = drops(svg)
			.filter((_, i) => i % 3 === 0)
			.map(rect);
		for (const drop of firstBand) expect(drop.top).toBeGreaterThanOrEqual(cloud.bottom - 1);
	});

	test('a segment fills its categories’ cloud and dots, whatever order their rows come in', async () => {
		const { container } = render(RaincloudPlot, {
			...base,
			segments: {
				default: [{ areas: [{ x: { from: 'b', to: 'b' } }], styles: { fill: '#dc2626' } }]
			}
		});
		const svg = await waitForSvg(container);
		const red = 'rgb(220, 38, 38)';
		const fills = clouds(svg).map((p) => getComputedStyle(p).fill);
		expect(fills.filter((f) => f === red)).toHaveLength(1);
		const reds = drops(svg).filter((d) => getComputedStyle(d).fill === red);
		expect(reds).toHaveLength(rows.filter((r) => r.category === 'b').length);
	});

	test('a series the legend hides takes its cloud, dots and box with it', async () => {
		const { container } = render(RaincloudPlot, {
			...base,
			color: 'category',
			legend: { series: { interactive: { enabled: true, disabled: { mode: 'hide' } } } }
		});
		const svg = await waitForSvg(container);
		const item = [...container.querySelectorAll<HTMLElement>('[role="button"]')].find(
			(el) => el.textContent?.trim() === 'A'
		);
		item!.click();
		const opacity = (el: Element, key: 'fillOpacity' | 'opacity') =>
			Number(getComputedStyle(el)[key]);
		await vi.waitFor(() => expect(opacity(clouds(svg)[0], 'fillOpacity')).toBe(0));
		const hiddenDrops = drops(svg).filter((d) => opacity(d, 'fillOpacity') === 0);
		expect(hiddenDrops).toHaveLength(rows.filter((r) => r.category === 'a').length);
		const bars = [...svg.querySelectorAll(BARS)];
		expect(bars.filter((b) => opacity(b, 'opacity') === 0)).toHaveLength(1);
	});
});
