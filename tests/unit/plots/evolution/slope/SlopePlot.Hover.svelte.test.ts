import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import { waitForSvg, countDotMarks } from '../../_helpers/svg';

const rows = [
	{ period: 'before', group: 'Young', share: 19 },
	{ period: 'after', group: 'Young', share: 17.4 },
	{ period: 'before', group: 'Old', share: 16.5 },
	{ period: 'after', group: 'Old', share: 18.9 }
];

const props = {
	width: 500,
	height: 300,
	data: rows,
	x: 'period',
	y: 'share',
	color: 'group',
	markers: [{ type: 'hover' as const }]
};

/** Moves the pointer to `fraction` of the way across the plot's hit area. */
function hoverAt(svg: SVGElement, fraction: number) {
	const area = svg.querySelector('rect[pointer-events="all"]')!;
	const box = area.getBoundingClientRect();
	const init = {
		clientX: box.left + box.width * fraction,
		clientY: box.top + box.height / 2,
		bubbles: true
	};
	area.dispatchEvent(new PointerEvent('pointermove', init));
	area.dispatchEvent(new MouseEvent('mousemove', init));
}

describe('SlopePlot hover marker', () => {
	test('marks every series at the position nearest the pointer', async () => {
		const { container } = render(SlopePlot, props);
		const svg = await waitForSvg(container);
		const resting = countDotMarks(svg);
		hoverAt(svg, 0.1);
		await vi.waitFor(() => expect(countDotMarks(svg)).toBe(resting + 2));
	});

	test('labels the hovered position with its own values', async () => {
		const { container } = render(SlopePlot, props);
		const svg = await waitForSvg(container);
		hoverAt(svg, 0.9);
		await vi.waitFor(() => {
			const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
			expect(labels.join(' ')).toContain('18.9');
			expect(labels.join(' ')).not.toContain('16.5');
		});
	});
});
