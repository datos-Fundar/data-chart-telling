import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { FEMALE_LIFE, LIFE } from '$datasets';
import { waitForSvg, countDotMarks, countTextLabels } from '../../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'year' as const,
	y: 'value' as const,
	data: FEMALE_LIFE
};

// The hover marker's dot/label/rules only appear once svelteplot's <Pointer>
// reports a match, which requires a real cursor position over the rendered
// marks. These tests exercise the marker's static (no-hover) baseline and
// its configuration surface - not the interactive matching itself.
describe('LinePlot - markers.hover', () => {
	test('renders with a basic hover marker and shows nothing before any hover', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(0);
		expect(countTextLabels(svg)).toBe(0);
	});

	test('does not crash when scoped to a single series', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			data: LIFE,
			x: 'year',
			y: 'value',
			color: 'sex',
			markers: [{ type: 'hover', series: 'female' }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with scope "segment" over a segmented series', async () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			female: [
				{ areas: [{ x: { to: 1991 } }], styles: {} },
				{ areas: [{ x: { from: 1991 } }], styles: { stroke: { strokeDasharray: '6 4' } } }
			]
		};
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			segments,
			markers: [
				{ type: 'hover', series: 'female', scope: 'segment' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with nothing drawn behind', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'hover', back: [] }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with a rule behind and a dot and a label of its own in front', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'hover',
					back: [
						{ type: 'rule', axis: 'x', value: (p) => p.x, styles: { strokeDasharray: '2 2' } }
					],
					front: [
						{ type: 'dot', styles: { dotRadius: 6, dotFill: '#e11d48' } },
						{ type: 'text', text: (p) => p.label, styles: { fontSize: 14 } }
					]
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('does not crash with a custom label format', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'hover',
					format: (point) => `${point.x}: ${point.y}`
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});
});

describe('LinePlot - its own hover, under the pointer', () => {
	const hovered = async (markers: AxisBasedMarkersConfig[]) => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers
		});
		const svg = await waitForSvg(container);
		await userEvent.hover(page.elementLocator(svg), { force: true });
		return svg;
	};
	const rules = (svg: SVGElement) => svg.querySelectorAll('g.rule-x line, g.rule-x path').length;

	test('a crosshair behind the line, and a dot and its value in front', async () => {
		const svg = await hovered([{ type: 'hover' }]);
		await vi.waitFor(() => {
			expect(countDotMarks(svg)).toBe(1);
			expect(countTextLabels(svg)).toBe(1);
			expect(rules(svg)).toBe(1);
		});
		// Behind: the crosshair comes before the line in the document, the dot after it.
		const [rule, line, dot] = ['g.rule-x', 'g.lines', 'g.dot'].map((s) => svg.querySelector(s)!);
		expect(rule.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(line.compareDocumentPosition(dot) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		await userEvent.unhover(page.elementLocator(svg));
	});

	test('the author replaces what it draws in front, and keeps what is behind', async () => {
		const svg = await hovered([{ type: 'hover', front: [{ type: 'dot' }] }]);
		await vi.waitFor(() => {
			expect(countDotMarks(svg)).toBe(1);
			expect(rules(svg)).toBe(1);
		});
		expect(countTextLabels(svg)).toBe(0);
		await userEvent.unhover(page.elementLocator(svg));
	});
});
