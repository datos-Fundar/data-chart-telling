import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import { ARGENTINA_PROVINCES } from '../../../../stories/plots/geo/data';
import { waitForSvg, countGeoPaths } from '../_helpers/svg';

function fillsOf(svg: SVGElement): string[] {
	return [...svg.querySelectorAll('g.geo path, path.geo')].map(
		(p) => p.getAttribute('fill') ?? p.getAttribute('style') ?? ''
	);
}

describe('GeoPlot - base fill/stroke', () => {
	test('a custom styles.fill applies to every feature not otherwise styled', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			styles: { fill: '#cbd5e1' }
		});
		const svg = await waitForSvg(container);
		expect(
			fillsOf(svg).every((s) => s.includes('#cbd5e1') || s.includes('rgb(203, 213, 225)'))
		).toBe(true);
	});
});

describe('GeoPlot - choropleth color ramp', () => {
	test('a continuous value maps through scales.color into distinct fills', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			color: (f) => (f.properties as { population: number }).population,
			scales: { color: { domain: [190_000, 17_600_000], scheme: ['#e0e7ff', '#4f46e5'] } }
		});
		const svg = await waitForSvg(container);
		const fills = fillsOf(svg);
		// Every feature has its own resolved fill; not all the same color, since
		// population varies across the fixture.
		expect(new Set(fills).size).toBeGreaterThan(1);
	});
});

describe('GeoPlot - zoom', () => {
	test('coordinates.zoom: true renders without crashing', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			coordinates: { zoom: true }
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
	});

	test('coordinates.zoom with min/max limits renders without crashing', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			coordinates: { zoom: { min: 1, max: 4 } }
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
	});
});

describe('GeoPlot - tile layer', () => {
	test('defaults the projection to mercator when tileLayer is set and no projection is given', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			styles: { tileLayer: { url: 'https://tile.example/{z}/{x}/{y}.png' } }
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
	});

	test('warns but still renders when tileLayer is combined with a non-mercator projection', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			coordinates: { projection: 'orthographic' },
			styles: { tileLayer: { url: 'https://tile.example/{z}/{x}/{y}.png' } }
		});
		const svg = await waitForSvg(container);
		expect(countGeoPaths(svg)).toBe(ARGENTINA_PROVINCES.length);
		await vi.waitFor(() => {
			expect(warn).toHaveBeenCalledWith(
				expect.stringContaining('tileLayer only renders correctly')
			);
		});
		warn.mockRestore();
	});

	test('does not warn when tileLayer is combined with mercator explicitly', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			coordinates: { projection: 'mercator' },
			styles: { tileLayer: { url: 'https://tile.example/{z}/{x}/{y}.png' } }
		});
		await waitForSvg(container);
		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
	});
});

describe('GeoPlot - onFeatureClick', () => {
	test('fires with the clicked feature when a base-map path is clicked', async () => {
		const onClick = vi.fn();
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId: (f) => (f.properties as { nombre: string }).nombre,
			styles: { onFeatureClick: onClick }
		});
		const svg = await waitForSvg(container);
		const path = svg.querySelector('g.geo path, path.geo');
		expect(path).toBeTruthy();
		path?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await vi.waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
		const [feature] = onClick.mock.calls[0];
		expect((feature.properties as { nombre: string }).nombre).toBeDefined();
	});

	test('is never called when no styles.onFeatureClick is set', async () => {
		const { container } = render(GeoPlot, { width: 400, height: 300, data: ARGENTINA_PROVINCES });
		const svg = await waitForSvg(container);
		const path = svg.querySelector('g.geo path, path.geo');
		expect(() => path?.dispatchEvent(new MouseEvent('click', { bubbles: true }))).not.toThrow();
	});
});

describe('GeoPlot - styles.frame', () => {
	test('no frame by default', async () => {
		const { container } = render(GeoPlot, { width: 400, height: 300, data: ARGENTINA_PROVINCES });
		const svg = await waitForSvg(container);
		expect(svg.querySelector('.frame')).toBeNull();
	});

	test('styles.frame renders a border around the map, same as every other plot kind', async () => {
		const { container } = render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			styles: { frame: { stroke: '#0f172a', strokeWidth: 2 } }
		});
		const svg = await waitForSvg(container);
		const frame = svg.querySelector('rect.frame') as HTMLElement;
		expect(frame).toBeTruthy();
		expect(frame.style.stroke).toBe('rgb(15, 23, 42)');
	});
});
