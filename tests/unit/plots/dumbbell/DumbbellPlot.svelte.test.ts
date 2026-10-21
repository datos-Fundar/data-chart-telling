import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DumbbellPlot from '$lib/plots/dumbbell/Plot.svelte';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { ClevelandMarkers } from '$lib/plots/cleveland/ClevelandMarkers';
import { waitForSvg, countDotMarks } from '../_helpers/svg';

const rows = [
	{ c: 'a', v: 2, g: 'before' },
	{ c: 'a', v: 7, g: 'after' },
	{ c: 'b', v: 4, g: 'before' },
	{ c: 'b', v: 3, g: 'after' }
];

const connectors = (svg: SVGElement) => Array.from(svg.querySelectorAll('g.rule-x line'));

describe('DumbbellPlot', () => {
	beforeEach(() => ClevelandMarkers.resetWarnings());

	test('joins the two dots of each category with one connector', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { container } = render(DumbbellPlot, {
			width: 400,
			height: 300,
			data: rows,
			x: 'c',
			y: 'v',
			color: 'g'
		});
		const svg = await waitForSvg(container);
		expect(connectors(svg)).toHaveLength(2);
		expect(countDotMarks(svg)).toBe(4);
		expect(svg.querySelectorAll('g.dot')).toHaveLength(2);
		const [line] = connectors(svg);
		// `'dots'` by default: as thick as the dots are wide.
		expect(parseFloat(getComputedStyle(line).strokeWidth)).toBe(
			DEFAULT_CONFIG.dumbbell.dotRadius * 2
		);
		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
	});

	test('warns, pointing to the plots for other counts, when it has one series or three', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(DumbbellPlot, { width: 400, height: 300, data: rows, x: 'c', y: 'v' });
		await vi.waitFor(() =>
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('Use LollipopPlot for one series'))
		);
		render(DumbbellPlot, {
			width: 400,
			height: 300,
			data: [...rows, { c: 'a', v: 9, g: 'later' }],
			x: 'c',
			y: 'v',
			color: 'g'
		});
		await vi.waitFor(() =>
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('Use ClevelandPlot'))
		);
		warn.mockRestore();
	});
});
