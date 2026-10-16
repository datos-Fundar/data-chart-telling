import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY } from '../../../../../stories/plots/line/data';
import { waitForSvg } from '../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'year' as const,
	y: 'value' as const,
	data: FEMALE_LIFE_EXPECTANCY
};

describe('LinePlot - markers.rules', () => {
	test('ruleX renders a vertical rule line', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'rule', axis: 'x', value: 2016 }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.rule-x line').length).toBe(1);
	});

	test('ruleY renders a horizontal rule line', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [{ type: 'rule', axis: 'y', value: 80 }] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.rule-y line').length).toBe(1);
	});

	test('multiple ruleX markers each render their own line', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{ type: 'rule', axis: 'x', value: 2010 },
				{ type: 'rule', axis: 'x', value: 2018 }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.rule-x line').length).toBe(2);
	});

	test('mixed ruleX and ruleY markers both render', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{ type: 'rule', axis: 'x', value: 2016 },
				{ type: 'rule', axis: 'y', value: 80 }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.rule-x line').length).toBe(1);
		expect(svg.querySelectorAll('g.rule-y line').length).toBe(1);
	});

	test('a ruleX style override changes the rendered stroke color', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{ type: 'rule', axis: 'x', value: 2016, styles: { stroke: '#e11d48' } }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const line = svg.querySelector('g.rule-x line');
		expect(line?.getAttribute('style')).toContain('stroke: rgb(225, 29, 72)');
	});

	test('does not crash with an empty markers array', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: []
		});
		const svg = await waitForSvg(container);
		expect(svg).toBeTruthy();
	});

	test('data + a field-key value renders one line per row', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{ type: 'rule', axis: 'x', data: [{ yr: 2010 }, { yr: 2014 }, { yr: 2018 }], value: 'yr' }
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.rule-x line').length).toBe(3);
	});

	test('y1/y2 bounds a ruleX line to a shorter vertical extent than the default full span', async () => {
		const full = (
			await render(LinePlot, {
				width: 400,
				height: 300,
				series: [FEMALE],
				markers: [{ type: 'rule', axis: 'x', value: 2016 }] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const bounded = (
			await render(LinePlot, {
				width: 400,
				height: 300,
				series: [FEMALE],
				markers: [
					{ type: 'rule', axis: 'x', value: 2016, y1: 76, y2: 78 }
				] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const fullLine = (await waitForSvg(full)).querySelector('g.rule-x line')!;
		const boundedLine = (await waitForSvg(bounded)).querySelector('g.rule-x line')!;
		const span = (line: Element) =>
			Math.abs(Number(line.getAttribute('y2')) - Number(line.getAttribute('y1')));
		expect(span(boundedLine)).toBeLessThan(span(fullLine));
	});

	test('inset shrinks a ruleY line from both ends compared to the default full span', async () => {
		const full = (
			await render(LinePlot, {
				width: 400,
				height: 300,
				series: [FEMALE],
				markers: [{ type: 'rule', axis: 'y', value: 80 }] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const inset = (
			await render(LinePlot, {
				width: 400,
				height: 300,
				series: [FEMALE],
				markers: [
					{ type: 'rule', axis: 'y', value: 80, inset: 60 }
				] satisfies AxisBasedMarkersConfig[]
			})
		).container;
		const fullLine = (await waitForSvg(full)).querySelector('g.rule-y line')!;
		const insetLine = (await waitForSvg(inset)).querySelector('g.rule-y line')!;
		const span = (line: Element) =>
			Math.abs(Number(line.getAttribute('x2')) - Number(line.getAttribute('x1')));
		expect(span(insetLine)).toBeLessThan(span(fullLine));
	});
});
