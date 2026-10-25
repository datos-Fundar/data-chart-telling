import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'year' as const,
	y: 'value' as const,
	data: FEMALE_LIFE
};

describe('LinePlot - styles.frame', () => {
	test('no frame by default', async () => {
		const { container } = await render(LinePlot, { width: 400, height: 300, series: [FEMALE] });
		const svg = await waitForSvg(container);
		expect(svg.querySelector('.frame')).toBeNull();
	});

	test('frame: true renders a border with no explicit style', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: { frame: true } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelector('rect.frame')).toBeTruthy();
	});

	test('a frame style object overrides stroke/fill/width', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: {
				frame: { stroke: '#6366f1', strokeWidth: 3, fill: '#6366f1', fillOpacity: 0.05 }
			} satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		const frame = svg.querySelector('rect.frame') as HTMLElement;
		expect(frame).toBeTruthy();
		expect(frame.style.stroke).toBe('rgb(99, 102, 241)');
		expect(frame.style.strokeWidth).toBe('3px');
	});

	test('inset pulls the frame in from the content box edges', async () => {
		const { container: plainContainer } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: { frame: true } satisfies AxisBasedStylesConfig
		});
		const plainSvg = await waitForSvg(plainContainer);
		const plainWidth = Number(plainSvg.querySelector('rect.frame')?.getAttribute('width'));

		const { container: insetContainer } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			styles: { frame: { inset: 20 } } satisfies AxisBasedStylesConfig
		});
		const insetSvg = await waitForSvg(insetContainer);
		const insetWidth = Number(insetSvg.querySelector('rect.frame')?.getAttribute('width'));

		expect(insetWidth).toBeLessThan(plainWidth);
	});
});
