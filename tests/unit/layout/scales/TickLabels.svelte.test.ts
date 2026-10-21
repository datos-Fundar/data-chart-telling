import { describe, test, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	DEFAULT_CONFIG,
	setConfiguration,
	resetConfiguration
} from '$lib/configuration/config.svelte';
import { TickLabels } from '$lib/layout/scales/TickLabels';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import DumbbellPlot from '$lib/plots/dumbbell/Plot.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

const PROVINCES = ['Buenos Aires', 'Córdoba', 'Mendoza', 'Salta', 'Chubut'];
const layout = (labels: string[], span: number, padding = 0.1) =>
	TickLabels.layout(labels, span, padding, 14, DEFAULT_CONFIG);

describe('TickLabels', () => {
	test('labels that fit side by side stay flat', () => {
		expect(layout(['a', 'b', 'c'], 600)).toMatchObject({ rotate: 0, every: 1 });
		expect(layout(PROVINCES, 900)).toMatchObject({ rotate: 0, every: 1 });
	});

	test('the narrower the axis, the more its labels turn - 45 degrees, then 90 - and in the end some are left out', () => {
		const rotations = [900, 300, 150, 90].map((span) => layout(PROVINCES, span).rotate);
		expect(rotations[0]).toBe(0);
		expect(rotations).toContain(-45);
		expect(rotations).toContain(-90);
		// Never straightens up as the axis narrows.
		const order = { 0: 0, '-45': 1, '-90': 2 } as const;
		expect(rotations.map((r) => order[String(r) as keyof typeof order])).toEqual(
			[...rotations.map((r) => order[String(r) as keyof typeof order])].sort((a, b) => a - b)
		);
		const crowded = layout(PROVINCES, 40);
		expect(crowded.rotate).toBe(-90);
		expect(crowded.every).toBeGreaterThan(1);
	});

	test('a word is never split: one long word turns the labels even where its band could wrap', () => {
		expect(layout(['Internationalization', 'x', 'y'], 120).rotate).not.toBe(0);
	});

	test('the widest label is what a turned axis reserves room for', () => {
		const turned = layout(PROVINCES, 150);
		expect(turned.rotate).not.toBe(0);
		expect(turned.width).toBeGreaterThan(layout(['Salta'], 600).width);
	});

	test('the rows of a vertical axis are only left out when they are lower than their text', () => {
		expect(TickLabels.rows(5, 300, 14)).toBe(1);
		expect(TickLabels.rows(40, 300, 14)).toBeGreaterThan(1);
	});
});

describe('auto rotation of the category axis labels', () => {
	afterEach(() => resetConfiguration());

	const rows = PROVINCES.flatMap((province, i) => [
		{ province, value: 70 + i, sex: 'female' },
		{ province, value: 75 + i, sex: 'male' }
	]);
	const rotations = (svg: SVGElement) =>
		Array.from(svg.querySelectorAll('g.axis-x g.tick text')).map(
			(text) => text.getAttribute('transform') ?? ''
		);
	const props = { data: rows, x: 'province', y: 'value', color: 'sex', height: 300 };

	test('a narrow plot turns its labels, a wide one does not', async () => {
		const narrow = render(DumbbellPlot, { ...props, width: 300 });
		const turned = rotations(await waitForSvg(narrow.container));
		expect(turned.length).toBeGreaterThan(0);
		expect(turned.every((t) => /rotate\(-(45|90)\)/.test(t))).toBe(true);
		narrow.unmount();

		const wide = render(DumbbellPlot, { ...props, width: 900 });
		const flat = rotations(await waitForSvg(wide.container));
		expect(flat.every((t) => /rotate\(0\)/.test(t))).toBe(true);
	});

	test("an author's own tickRotate, 0 included, is kept", async () => {
		const own = render(DumbbellPlot, { ...props, width: 300, scales: { x: { tickRotate: 0 } } });
		expect(rotations(await waitForSvg(own.container)).every((t) => /rotate\(0\)/.test(t))).toBe(
			true
		);
		own.unmount();
		const fixed = render(DumbbellPlot, {
			...props,
			width: 900,
			scales: { x: { tickRotate: -90 } }
		});
		expect(rotations(await waitForSvg(fixed.container)).every((t) => /rotate\(-90\)/.test(t))).toBe(
			true
		);
	});

	test('axis.autoRotate: false leaves the labels as they are', async () => {
		setConfiguration({ axis: { autoRotate: false } });
		const view = render(DumbbellPlot, { ...props, width: 300 });
		expect(rotations(await waitForSvg(view.container)).every((t) => /rotate\(0\)/.test(t))).toBe(
			true
		);
	});

	test('any plot with a category axis does it: a bar plot too', async () => {
		const view = render(BarPlot, {
			data: rows.filter((r) => r.sex === 'female'),
			x: 'province',
			y: 'value',
			width: 300,
			height: 300
		});
		expect(
			rotations(await waitForSvg(view.container)).some((t) => /rotate\(-(45|90)\)/.test(t))
		).toBe(true);
	});
});
