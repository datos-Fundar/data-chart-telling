import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import type { BoxPlotProps } from '$lib/types/plots/distribution/box/props';
import type { LinePlotProps } from '$lib/types/plots/evolution/line/props';
import { HEIGHTS } from '$datasets';
import { waitForSvg } from '../plots/_helpers/svg';

const texts = (svg: SVGElement) =>
	[...svg.querySelectorAll('g.text text')].map((t) => t.textContent ?? '');

async function draw(Plot: unknown, props: Record<string, unknown>) {
	// Wrapped in `props`: a bullet's `target` is also one of Svelte's own mount options.
	const { container } = await render(
		Plot as never,
		{
			props: { width: 500, height: 300, ...props }
		} as never
	);
	return waitForSvg(container);
}

const BOXES = { data: HEIGHTS, x: 'group', y: 'height' };

describe('styles.values.parts', () => {
	test("a box plot labels each box's whisker ends and median by default", async () => {
		const svg = await draw(BoxPlot, { ...BOXES, styles: { values: { show: true } } });
		await expect.poll(() => texts(svg).length).toBe(6);
	});

	test('a list picks the parts labelled', async () => {
		const svg = await draw(BoxPlot, { ...BOXES, styles: { values: { parts: ['median'] } } });
		await expect.poll(() => texts(svg).length).toBe(2);
	});

	test('a record sets a part its own format, which reads the part from the context', async () => {
		const svg = await draw(BoxPlot, {
			...BOXES,
			styles: {
				values: {
					parts: {
						median: {
							format: (v: number, _n: unknown, { part }: { part?: string }) => `${part} ${v}`
						}
					}
				}
			}
		});
		await expect.poll(() => texts(svg).every((t) => t.startsWith('median '))).toBe(true);
		expect(texts(svg)).toHaveLength(2);
	});

	test('`series` labels the parts of those series only', async () => {
		const svg = await draw(BoxPlot, {
			...BOXES,
			color: 'group',
			styles: { values: { parts: ['median'], series: 'male' } }
		});
		await expect.poll(() => texts(svg).length).toBe(1);
	});

	test('a part worked out is written with at most two decimals', async () => {
		const svg = await draw(BoxPlot, { ...BOXES, styles: { values: { parts: ['p25', 'p75'] } } });
		await expect.poll(() => texts(svg).length).toBe(4);
		expect(texts(svg).every((t) => !/\.\d{3,}/.test(t))).toBe(true);
	});

	test("a forest plot's interval ends are parts of their own", async () => {
		const rows = [
			{ name: 'a', value: 5, lower: 3, upper: 8 },
			{ name: 'b', value: 6, lower: 4, upper: 9 }
		];
		const svg = await draw(ForestPlot, {
			data: rows,
			x: 'value',
			y: 'name',
			lower: 'lower',
			upper: 'upper',
			styles: { values: { parts: ['lower', 'upper'] } }
		});
		await expect.poll(() => texts(svg).sort()).toEqual(['3', '4', '8', '9']);
	});

	test("a bullet plot's target is a part of its own", async () => {
		const rows = [
			{ name: 'a', value: 5, goal: 7 },
			{ name: 'b', value: 6, goal: 8 }
		];
		const svg = await draw(BulletPlot, {
			data: rows,
			x: 'value',
			y: 'name',
			target: 'goal',
			styles: { values: { parts: ['target'] } }
		});
		await expect.poll(() => texts(svg).sort()).toEqual(['7', '8']);
	});

	test('a density plot names each curve at its peak', async () => {
		const svg = await draw(DensityPlot, {
			data: HEIGHTS,
			x: 'height',
			color: 'group',
			styles: { values: { show: true } }
		});
		await expect.poll(() => texts(svg).sort()).toEqual(['female', 'male']);
	});

	test("the parts a plot takes are typed: a simple plot's one `value`, a box's summary", () => {
		const box: BoxPlotProps<Record<string, unknown>>['styles'] = {
			values: { parts: ['min', 'median'] }
		};
		const line: LinePlotProps<Record<string, unknown>>['styles'] = {
			// @ts-expect-error A line plot's rows have one value.
			values: { parts: ['median'] }
		};
		expect([box, line]).toHaveLength(2);
	});
});
