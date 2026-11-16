import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../plots/_helpers/svg';

const SERIES = [{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE }];

/** A row of the marker's own, at `at` along the years, with a box from `from` to `to`. */
const row = (name: string, from: number, to: number, lo = 60, hi = 80) => ({
	name,
	from,
	to,
	at: (from + to) / 2,
	lo,
	hi,
	mid: (lo + hi) / 2
});

async function textsOf(marker: Record<string, unknown>) {
	const { container } = await render(LinePlot, {
		width: 700,
		height: 400,
		series: SERIES,
		markers: [marker]
	} as never);
	const svg = await waitForSvg(container);
	const own = () =>
		[...svg.querySelectorAll<SVGTextElement>('text')].filter((t) => t.textContent?.includes('#'));
	await expect.poll(() => own().length).toBeGreaterThan(0);
	return own().map((t) => ({
		text: (t.textContent ?? '').trim(),
		fill: t.style.fill,
		anchor: t.getAttribute('text-anchor') ?? getComputedStyle(t).textAnchor,
		size: parseFloat(t.style.fontSize || getComputedStyle(t).fontSize)
	}));
}

describe("a text marker - each row's place in its context", () => {
	test("its text, styles and anchors read each row's place among the marker's rows", async () => {
		const texts = await textsOf({
			type: 'text',
			data: [row('a', 1960, 1970), row('b', 1980, 1990), row('c', 2000, 2010)],
			x: 'at',
			y: 'mid',
			text: (d: { name: string }, context: { index?: number }) => `${d.name}#${context.index}`,
			textAnchor: (d: unknown, context: { index?: number }) =>
				context.index === 2 ? 'end' : 'start',
			styles: {
				fill: (d: unknown, context: { index?: number }) =>
					context.index === 1 ? 'tomato' : 'black'
			}
		});
		expect(texts.map((t) => t.text).sort()).toEqual(['a#0', 'b#1', 'c#2']);
		expect(texts.find((t) => t.text === 'b#1')?.fill).toBe('tomato');
		expect(texts.find((t) => t.text === 'a#0')?.fill).toBe('black');
		expect(texts.find((t) => t.text === 'c#2')?.anchor).toBe('end');
	});

	test('a row written smaller than the others, drawn apart from them, keeps its place', async () => {
		const texts = await textsOf({
			type: 'text',
			data: [
				row('wide', 1950, 2010),
				row('short', 1950, 2010, 69, 70.6),
				row('wide too', 1950, 2010)
			],
			x: 'at',
			y: 'mid',
			text: (d: { name: string }, context: { index?: number }) => `${d.name}#${context.index}`,
			styles: { fontSize: 14 },
			fit: { x1: 'from', x2: 'to', y1: 'lo', y2: 'hi' }
		});
		const short = texts.find((t) => t.text.startsWith('short'));
		expect(short?.text).toBe('short#1');
		expect(short!.size).toBeLessThan(14);
		expect(texts.map((t) => t.text)).toEqual(expect.arrayContaining(['wide#0', 'wide too#2']));
	});
});
