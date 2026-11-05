import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../plots/_helpers/svg';

const SERIES = [{ name: 'female', x: 'year' as const, y: 'value' as const, data: FEMALE_LIFE }];

/** A row of its own. */
const ROW = { year: 1950, value: 70, from: 1990, to: 2010, lo: 60, hi: 80 };

/** Each marker drawing the row once, in tomato, with what its kind needs besides. */
const MARKERS: Record<string, (extra: Partial<AxisBasedMarkersConfig>) => AxisBasedMarkersConfig> =
	{
		dot: (extra) =>
			({
				type: 'dot',
				data: [ROW],
				x: 'from',
				y: 'value',
				r: 12,
				styles: { dotFill: 'tomato' },
				...extra
			}) as AxisBasedMarkersConfig,
		line: (extra) =>
			({
				type: 'line',
				data: [
					{ ...ROW, at: 1990 },
					{ ...ROW, at: 2010 }
				],
				x: 'at',
				y: 'value',
				styles: { stroke: 'tomato', strokeWidth: 8 },
				...extra
			}) as AxisBasedMarkersConfig,
		area: (extra) =>
			({
				type: 'area',
				data: [
					{ ...ROW, at: 1990 },
					{ ...ROW, at: 2010 }
				],
				x: 'at',
				y1: 'lo',
				y2: 'hi',
				styles: { fill: 'tomato' },
				...extra
			}) as AxisBasedMarkersConfig
	};

const tomato = (svg: SVGElement) =>
	svg.querySelector<SVGElement>('[style*="tomato"], [fill="tomato"], [stroke="tomato"]');

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

describe.each(Object.keys(MARKERS))('%s marker - events', (kind) => {
	test('calls a handler with the event and the row of its shape', async () => {
		const onclick = vi.fn();
		const svg = await draw([MARKERS[kind]({ onclick })]);
		tomato(svg)!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(onclick).toHaveBeenCalled();
		for (const [, row] of onclick.mock.calls) expect(row).toMatchObject({ year: 1950, value: 70 });
	});
});
