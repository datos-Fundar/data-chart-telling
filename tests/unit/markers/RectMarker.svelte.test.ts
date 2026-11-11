import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../plots/_helpers/svg';

const SERIES = [{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE }];

/** One tomato rectangle over the plot, carrying a row of its own. */
const ROW = { year: 1950, value: 70, from: 1990, to: 2010, lo: 60, hi: 80 };
const rect = (extra: Partial<AxisBasedMarkersConfig> = {}) =>
	({
		type: 'rect',
		data: [ROW],
		x1: 'from',
		x2: 'to',
		y1: 'lo',
		y2: 'hi',
		styles: { fill: 'tomato' },
		...extra
	}) as AxisBasedMarkersConfig;

/** The rectangle the marker drew: the one in tomato. */
const tomato = (svg: SVGElement) =>
	svg.querySelector<SVGElement>('rect[style*="tomato"], path[style*="tomato"]');

async function draw(markers: AxisBasedMarkersConfig[]) {
	const { container } = await render(LinePlot, {
		width: 500,
		height: 320,
		series: SERIES,
		markers
	});
	const svg = await waitForSvg(container);
	await expect.poll(() => tomato(svg)).not.toBeNull();
	return svg;
}

describe('RectMarker - what it passes on to svelteplot', () => {
	test('calls a handler with the event and the row its rectangle draws', async () => {
		const onclick = vi.fn();
		const svg = await draw([rect({ onclick })]);
		tomato(svg)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(onclick).toHaveBeenCalledTimes(1);
		const [event, row] = onclick.mock.calls[0];
		expect(event).toBeInstanceOf(MouseEvent);
		expect(row).toMatchObject(ROW);
	});

	test('passes every handler it is given', async () => {
		const onpointerenter = vi.fn();
		const onpointerleave = vi.fn();
		const svg = await draw([rect({ onpointerenter, onpointerleave })]);
		tomato(svg)!.dispatchEvent(new PointerEvent('pointerenter'));
		tomato(svg)!.dispatchEvent(new PointerEvent('pointerleave'));
		expect(onpointerenter).toHaveBeenCalledTimes(1);
		expect(onpointerleave).toHaveBeenCalledTimes(1);
	});

	test("rounds a rectangle's corners with styles.borderRadius", async () => {
		const svg = await draw([rect({ styles: { fill: 'tomato', borderRadius: 8 } })]);
		// svelteplot draws a rounded rectangle as a path, and a square one as a rect.
		expect(tomato(svg)?.tagName).toBe('path');
	});

	test('draws a square rectangle without a border radius', async () => {
		const svg = await draw([rect()]);
		expect(tomato(svg)?.tagName).toBe('rect');
	});
});

describe('RectMarker - label', () => {
	const label = { text: 'Hello', styles: { fill: 'white' } };

	/** The texts the marker wrote, by what they say. */
	const written = (svg: SVGElement) =>
		[...svg.querySelectorAll<SVGTextElement>('text')]
			.filter((t) => t.style.fill === 'white')
			.map((t) => t.textContent?.trim());

	test('writes a text in the middle of each rectangle', async () => {
		const svg = await draw([rect({ label })]);
		await expect.poll(() => written(svg)).toEqual(['Hello']);
	});

	test('leaves the label out when its rectangle has no room for it', async () => {
		const svg = await draw([rect({ x1: 1990, x2: 1991, y1: 60, y2: 61, label })]);
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(written(svg)).toEqual([]);
	});

	test('does not fit the label with fit: false', async () => {
		const svg = await draw([
			rect({ x1: 1990, x2: 1991, y1: 60, y2: 61, label: { ...label, fit: false } })
		]);
		await expect.poll(() => written(svg)).toEqual(['Hello']);
	});

	test('keeps the pointer for the rectangle: the label takes none', async () => {
		const svg = await draw([rect({ label })]);
		await expect.poll(() => written(svg)).toEqual(['Hello']);
		const text = [...svg.querySelectorAll<SVGTextElement>('text')].find(
			(t) => t.style.fill === 'white'
		)!;
		expect(getComputedStyle(text).pointerEvents).toBe('none');
	});
});

describe('RectMarker - where its label sits', () => {
	const label = { text: 'Hi', styles: { fill: 'white' } };
	const boxOf = (el: Element) => el.getBoundingClientRect();
	const textOf = (svg: SVGElement) =>
		[...svg.querySelectorAll<SVGTextElement>('text')].find((t) => t.style.fill === 'white')!;

	async function placed(anchor: Record<string, unknown>) {
		const svg = await draw([rect({ label: { ...label, ...anchor } })]);
		await expect.poll(() => textOf(svg)).toBeTruthy();
		await new Promise((resolve) => setTimeout(resolve, 100));
		return { shape: boxOf(tomato(svg)!), text: boxOf(textOf(svg)) };
	}

	test('is in the middle of the shape by default', async () => {
		const { shape, text } = await placed({});
		expect(Math.abs(text.left + text.width / 2 - (shape.left + shape.width / 2))).toBeLessThan(1);
		expect(Math.abs(text.top + text.height / 2 - (shape.top + shape.height / 2))).toBeLessThan(1);
	});

	test('sits against the edge it is anchored to, inside the shape', async () => {
		const { shape, text } = await placed({ anchor: 'top-left' });
		expect(text.left).toBeGreaterThanOrEqual(shape.left);
		expect(text.left).toBeLessThan(shape.left + 12);
		expect(text.top).toBeGreaterThanOrEqual(shape.top);
		expect(text.top).toBeLessThan(shape.top + 12);
		const right = await placed({ anchor: 'right' });
		expect(right.text.right).toBeLessThanOrEqual(right.shape.right);
		expect(right.text.right).toBeGreaterThan(right.shape.right - 12);
	});

	test('a path label sits beyond the edge it names', async () => {
		const above = await placed({ layout: 'path', edge: 'top' });
		expect(above.text.bottom).toBeLessThanOrEqual(above.shape.top + 1);
		const side = await placed({ layout: 'path', edge: 'right' });
		expect(side.text.left).toBeGreaterThanOrEqual(side.shape.right - 1);
	});

	test('a path label sits inside its edge, or centred on it', async () => {
		const inside = await placed({ layout: 'path', edge: 'top', side: 'inside' });
		expect(inside.text.top).toBeGreaterThanOrEqual(inside.shape.top - 1);
		expect(inside.text.top).toBeLessThan(inside.shape.top + 12);
		const on = await placed({ layout: 'path', edge: 'top', side: 'on' });
		expect(Math.abs(on.text.top + on.text.height / 2 - on.shape.top)).toBeLessThan(2);
	});

	test('a path label goes along its edge by offset', async () => {
		const start = await placed({ layout: 'path', edge: 'top', offset: 'start' });
		expect(Math.abs(start.text.left - start.shape.left)).toBeLessThan(2);
		const end = await placed({ layout: 'path', edge: 'top', offset: 'end' });
		expect(Math.abs(end.text.right - end.shape.right)).toBeLessThan(2);
		const quarter = await placed({ layout: 'path', edge: 'top', offset: '25%' });
		const center = quarter.text.left + quarter.text.width / 2;
		expect(Math.abs(center - (quarter.shape.left + quarter.shape.width / 4))).toBeLessThan(2);
	});

	test('takes a gap of its own from the edge', async () => {
		const near = await placed({ anchor: 'left', gap: 2 });
		const far = await placed({ anchor: 'left', gap: 20 });
		expect(far.text.left - far.shape.left).toBeGreaterThan(near.text.left - near.shape.left + 10);
	});

	test('listens for the pointer when it has a handler of its own', async () => {
		const onpointerenter = vi.fn();
		const svg = await draw([rect({ label: { ...label, onpointerenter } })]);
		await expect.poll(() => textOf(svg)).toBeTruthy();
		// The pointer entering the label enters the group that wraps it, which holds the listeners.
		textOf(svg).closest('g[role="presentation"]')!.dispatchEvent(new PointerEvent('pointerenter'));
		expect(onpointerenter).toHaveBeenCalledTimes(1);
		expect(getComputedStyle(textOf(svg)).pointerEvents).not.toBe('none');
	});

	test('takes a style that is a function of the row, to dim a label', async () => {
		const svg = await draw([
			rect({ label: { ...label, styles: { fill: 'white', fillOpacity: () => 0.3 } } })
		]);
		await expect.poll(() => textOf(svg)).toBeTruthy();
		expect(Number(textOf(svg).style.fillOpacity)).toBeCloseTo(0.3);
	});
});

describe('RectMarker - a label outside its shape', () => {
	const edge = { x1: 2000, x2: 2019, y1: 60, y2: 80 };
	const label = { text: 'A long label', styles: { fill: 'white' }, layout: 'path', edge: 'right' };
	const textOf = (svg: SVGElement) =>
		[...svg.querySelectorAll<SVGTextElement>('text')].find((t) => t.style.fill === 'white')!;

	async function reach(extra: Record<string, unknown>) {
		const svg = await draw([rect({ ...edge, label: { ...label, ...extra } as never })]);
		await expect.poll(() => textOf(svg)).toBeTruthy();
		await new Promise((resolve) => setTimeout(resolve, 300));
		return {
			text: textOf(svg).getBoundingClientRect().right,
			frame: svg.getBoundingClientRect().right
		};
	}

	test('runs past the plot when nothing makes room for it', async () => {
		const { text, frame } = await reach({});
		expect(text).toBeGreaterThan(frame);
	});

	test('grows the plot margins to hold it with fitMargins', async () => {
		const { text, frame } = await reach({ fitMargins: true });
		expect(text).toBeLessThanOrEqual(frame + 1);
	});
});

describe('RectMarker - label defaults from the configuration', () => {
	test('takes its gap from text.label.gap', async () => {
		const { setConfiguration, resetConfiguration } =
			await import('$lib/configuration/config.svelte');
		const label = { text: 'Hi', styles: { fill: 'white' }, anchor: 'left' } as const;
		const edge = async () => {
			const svg = await draw([rect({ label })]);
			const text = () =>
				[...svg.querySelectorAll<SVGTextElement>('text')].find((t) => t.style.fill === 'white')!;
			await expect.poll(() => text()).toBeTruthy();
			await new Promise((resolve) => setTimeout(resolve, 100));
			return text().getBoundingClientRect().left - tomato(svg)!.getBoundingClientRect().left;
		};
		try {
			const near = await edge();
			setConfiguration({ text: { label: { gap: 24 } } });
			const far = await edge();
			expect(far).toBeGreaterThan(near + 10);
		} finally {
			resetConfiguration();
		}
	});
});
