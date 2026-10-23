import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, FLIGHT_ROUTES } from '../../../../../../stories/plots/map/geo/data';
import { waitForSvg, countLinkPaths } from '../../../_helpers/svg';

describe('GeoPlot - link marker', () => {
	test('renders one path per route', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'equal-earth' },
			markers: [
				{
					type: 'link',
					data: FLIGHT_ROUTES,
					x1: 'fromLon',
					y1: 'fromLat',
					x2: 'toLon',
					y2: 'toLat'
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countLinkPaths(svg)).toBe(FLIGHT_ROUTES.length);
	});

	test.each(['auto', 'linear'] as const)('curve "%s" renders without crashing', async (curve) => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'equal-earth' },
			markers: [
				{
					type: 'link',
					data: FLIGHT_ROUTES,
					x1: 'fromLon',
					y1: 'fromLat',
					x2: 'toLon',
					y2: 'toLat',
					curve
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countLinkPaths(svg)).toBe(FLIGHT_ROUTES.length);
	});

	test('custom stroke style resolves correctly', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection: 'equal-earth' },
			markers: [
				{
					type: 'link',
					data: FLIGHT_ROUTES,
					x1: 'fromLon',
					y1: 'fromLat',
					x2: 'toLon',
					y2: 'toLat',
					styles: { stroke: '#e11d48', strokeWidth: 2 }
				}
			] satisfies GeoMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		const paths = svg.querySelectorAll('g.link path, path.link');
		expect(paths.length).toBe(FLIGHT_ROUTES.length);
		[...paths].forEach((p) => {
			const style = p.getAttribute('style') ?? '';
			expect(style.includes('rgb(225, 29, 72)') || style.includes('#e11d48')).toBe(true);
		});
	});

	const pathsOf = async (
		curve: 'auto' | 'linear',
		projection: object | string = 'equal-earth',
		altitude?: number,
		occlusion?: 'ground' | 'globe'
	) => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: WORLD_COUNTRIES,
			coordinates: { projection },
			markers: [
				{
					type: 'link',
					data: FLIGHT_ROUTES,
					x1: 'fromLon',
					y1: 'fromLat',
					x2: 'toLon',
					y2: 'toLat',
					curve,
					altitude,
					occlusion
				}
			] satisfies GeoMarkersConfig[]
		} as never);
		const svg = await waitForSvg(container);
		return Array.from(svg.querySelectorAll('g.link path, path.link')).map(
			(path) => path.getAttribute('d') ?? ''
		);
	};
	const segments = (d: string) => (d.match(/[LM]/g) ?? []).length;

	test('"auto" follows the great circle, and "linear" is one straight segment', async () => {
		const [auto, linear] = [await pathsOf('auto'), await pathsOf('linear')];
		expect(auto.every((d) => segments(d) > 10)).toBe(true);
		expect(linear.every((d) => segments(d) === 2)).toBe(true);
		expect(linear).not.toEqual(auto);
	});

	test('a "linear" link keeps no route with an end on the far side of a globe', async () => {
		const globe = { type: 'orthographic', rotate: [60, -10] };
		const linear = await pathsOf('linear', globe);
		expect(linear.length).toBeLessThan(FLIGHT_ROUTES.length);
	});

	/** The smallest `y` any path reaches, the top of the highest arc. */
	const top = (paths: string[]) =>
		Math.min(
			...paths.flatMap((d) => [...d.matchAll(/,(-?[\d.]+)/g)].map((match) => Number(match[1])))
		);

	test.each(['auto', 'linear'] as const)(
		'an `altitude` lifts a "%s" link up a flat map',
		async (curve) => {
			const flat = await pathsOf(curve, 'equal-earth', 0);
			const lifted = await pathsOf(curve, 'equal-earth', 0.3);
			expect(lifted).toHaveLength(flat.length);
			expect(top(lifted)).toBeLessThan(top(flat));
		}
	);

	test('a globe keeps the visible part of a route whose far end is hidden', async () => {
		const globe = { type: 'orthographic', rotate: [100, -10] };
		const lifted = await pathsOf('auto', globe, 0.3);
		const flat = await pathsOf('auto', 'equal-earth');
		expect(lifted.length).toBeGreaterThanOrEqual(2);
		expect(lifted.length).toBeLessThanOrEqual(flat.length);
	});

	test('`occlusion: "globe"` keeps more of an arc than cutting it at the horizon', async () => {
		const globe = { type: 'orthographic', rotate: [100, -10] };
		const points = (paths: string[]) => paths.reduce((total, d) => total + segments(d), 0);
		const ground = await pathsOf('auto', globe, 0.3, 'ground');
		const whole = await pathsOf('auto', globe, 0.3, 'globe');
		expect(points(whole)).toBeGreaterThan(points(ground));
	});

	test('an `altitude` lifts the arcs off a globe too', async () => {
		const globe = { type: 'orthographic', rotate: [60, -10] };
		const lifted = await pathsOf('auto', globe, 0.3);
		expect(lifted.length).toBeGreaterThan(0);
		expect(lifted.every((d) => segments(d) > 10)).toBe(true);
	});
});
