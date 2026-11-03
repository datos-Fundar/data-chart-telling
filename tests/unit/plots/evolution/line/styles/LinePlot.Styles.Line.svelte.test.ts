import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { FEMALE_LIFE, MALE_LIFE } from '$datasets';
import { waitForSvg, countDotMarks } from '../../../_helpers/svg';

// `styles.stroke` and `styles.dot` are the style every series is drawn with: a style as it is, or a
// function of the series' name. A segment restyles a stretch of it over this, and a legend that turned a
// series off dims it over both.

const SERIES = [
	{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE },
	{ name: 'male', x: 'year', y: 'value', data: MALE_LIFE }
];

const lines = (container: Element) => [
	...container.querySelectorAll<SVGPathElement>('g.lines path')
];

async function renderPlot(props: Record<string, unknown>) {
	const { container } = await render(LinePlot, {
		width: 600,
		height: 300,
		series: SERIES,
		...props
	});
	await vi.waitFor(() => {
		if (lines(container).length < 2) throw new Error('plot not yet rendered');
	});
	return container;
}

describe('LinePlot - styles.stroke', () => {
	test('a style is the line of every series', async () => {
		const container = await renderPlot({ styles: { stroke: { strokeWidth: 6 } } });
		for (const line of lines(container))
			expect(line.getAttribute('style')).toContain('stroke-width: 6');
	});

	test('keeps each series its own color from the scale', async () => {
		const container = await renderPlot({ styles: { stroke: { strokeWidth: 6 } } });
		const [a, b] = lines(container).map(
			(l) => /stroke: ([^;]+)/.exec(l.getAttribute('style') ?? '')?.[1]
		);
		expect(a).toBeTruthy();
		expect(a).not.toBe(b);
	});

	test('a function sets one series apart', async () => {
		const container = await renderPlot({
			styles: {
				stroke: (name: string) => (name === 'male' ? { strokeWidth: 8 } : { strokeWidth: 2 })
			}
		});
		const [female, male] = lines(container);
		expect(female.getAttribute('style')).toContain('stroke-width: 2');
		expect(male.getAttribute('style')).toContain('stroke-width: 8');
	});

	test('a function that returns nothing leaves that series as it is', async () => {
		const container = await renderPlot({
			styles: { stroke: (name: string) => (name === 'male' ? { strokeWidth: 8 } : undefined) }
		});
		const [female, male] = lines(container);
		expect(female.getAttribute('style')).not.toContain('stroke-width: 8');
		expect(male.getAttribute('style')).toContain('stroke-width: 8');
	});

	test('a segment wins over it, field by field', async () => {
		const container = await renderPlot({
			styles: { stroke: { strokeWidth: 6, strokeOpacity: 0.5 } },
			segments: { female: [{ styles: { stroke: { strokeWidth: 1 } } }] }
		});
		const [female, male] = lines(container);
		expect(female.getAttribute('style')).toContain('stroke-width: 1');
		expect(female.getAttribute('style')).toContain('stroke-opacity: 0.5');
		expect(male.getAttribute('style')).toContain('stroke-width: 6');
	});

	test('draws a stretch a segment does not reach with it', async () => {
		const container = await renderPlot({
			styles: { stroke: { strokeWidth: 6 } },
			segments: {
				female: [{ areas: [{ x: { from: 2000 } }], styles: { stroke: { strokeDasharray: '4 4' } } }]
			}
		});
		const widths = lines(container).map((l) => l.getAttribute('style') ?? '');
		expect(widths.every((style) => style.includes('stroke-width: 6'))).toBe(true);
	});

	test('whatever a legend turned off dims over it', async () => {
		const container = await renderPlot({
			styles: { stroke: { strokeOpacity: 0.9 } },
			legend: { off: { female: 0.2 } }
		});
		const [female, male] = lines(container);
		expect(female.getAttribute('style')).toContain('stroke-opacity: 0.2');
		expect(male.getAttribute('style')).toContain('stroke-opacity: 0.9');
	});

	test('whatever a legend turned off dims over a segment too', async () => {
		const container = await renderPlot({
			segments: { female: [{ styles: { stroke: { strokeOpacity: 1, strokeWidth: 5 } } }] },
			legend: { off: { female: 0.2 } }
		});
		const [female] = lines(container);
		expect(female.getAttribute('style')).toContain('stroke-opacity: 0.2');
		expect(female.getAttribute('style')).toContain('stroke-width: 5');
	});
});

describe('LinePlot - styles.dot', () => {
	test('draws a dot on every point of every series', async () => {
		const container = await renderPlot({ styles: { dot: { dotRadius: 3 } } });
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(FEMALE_LIFE.length + MALE_LIFE.length);
	});

	test('a function gives dots to one series only', async () => {
		const container = await renderPlot({
			styles: { dot: (name: string) => (name === 'male' ? { dotRadius: 3 } : undefined) }
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(MALE_LIFE.length);
	});

	test('takes the color of its series', async () => {
		const container = await renderPlot({
			styles: { dot: { dotRadius: 3 } },
			segments: { female: [{ styles: { stroke: { stroke: '#dc2626' } } }] }
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('g.dot path')?.getAttribute('style')).toContain('rgb(220, 38, 38)');
	});

	test('a segment restyles the dots of its stretch', async () => {
		const container = await renderPlot({
			styles: { dot: { dotRadius: 3 } },
			segments: { female: [{ styles: { dot: { dotFill: '#00ff00' } } }] }
		});
		const svg = await waitForSvg(container);
		const styles = [...svg.querySelectorAll('g.dot path')].map(
			(p) => p.getAttribute('style') ?? ''
		);
		expect(styles.some((style) => style.includes('rgb(0, 255, 0)'))).toBe(true);
		expect(countDotMarks(svg)).toBe(FEMALE_LIFE.length + MALE_LIFE.length);
	});

	test('draws no extra dot where two segments of a series meet', async () => {
		const container = await renderPlot({
			styles: { dot: { dotRadius: 3 } },
			segments: {
				female: [
					{ areas: [{ x: { to: 2000 } }], styles: { stroke: { strokeDasharray: '4 4' } } },
					{ areas: [{ x: { from: 2005 } }], styles: { stroke: { strokeWidth: 4 } } }
				]
			}
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(FEMALE_LIFE.length + MALE_LIFE.length);
	});

	test('whatever a legend turned off dims its dots', async () => {
		const container = await renderPlot({
			styles: { dot: { dotRadius: 3 } },
			legend: { off: { female: 0.2 } }
		});
		const svg = await waitForSvg(container);
		const dims = [...svg.querySelectorAll('g.dot path')].filter((p) =>
			(p.getAttribute('style') ?? '').includes('fill-opacity: 0.2')
		);
		expect(dims.length).toBe(FEMALE_LIFE.length);
	});
});
