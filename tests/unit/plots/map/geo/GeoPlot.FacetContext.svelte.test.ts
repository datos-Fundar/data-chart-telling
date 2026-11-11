import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import type { GeoFeature, GeoSliceContext } from '$lib/types/plots/data/geo';

const name = (f: GeoFeature) => String((f.properties as { nombre: string }).nombre);
const SEXES = ['Mujeres', 'Varones'];

/** A value per province and sex: the features themselves carry no sex. */
const valueFor = (province: string, sex: string | undefined) =>
	province.length + (sex === 'Varones' ? 100 : 0);

const maps = (container: Element) => [...container.querySelectorAll('.dct-plot')];
const pathsOf = (map: Element) => map.querySelectorAll('g.geo path');

const FACET = { by: 'sexo', values: SEXES, columns: 2 };

describe('GeoPlot - one layer of features for every facet panel', () => {
	test('`facet.values` make a map each though no feature has the field', async () => {
		const { container } = await render(GeoPlot, {
			width: 700,
			height: 400,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			facet: FACET
		});
		await vi.waitFor(() => {
			expect(maps(container)).toHaveLength(2);
			for (const map of maps(container)) {
				expect(pathsOf(map)).toHaveLength(ARGENTINA_PROVINCES.length);
			}
		});
	});

	test('`color` gets the slice it draws, and the panels share one color domain', async () => {
		const seen: GeoSliceContext[] = [];
		const { container } = await render(GeoPlot, {
			width: 700,
			height: 400,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			facet: FACET,
			color: (f: GeoFeature, slice: GeoSliceContext) => {
				seen.push(slice);
				return valueFor(name(f), slice.facet?.value);
			}
		});
		await vi.waitFor(() => {
			expect(maps(container)).toHaveLength(2);
			expect(new Set(seen.map((s) => s.facet?.value))).toEqual(new Set(SEXES));
		});
		// The same provinces read differently in each panel, on one ramp: Varones sit 100 above Mujeres,
		// so no color is shared if the domain spans both.
		await vi.waitFor(() => {
			const fills = maps(container).map(
				(map) => new Set([...pathsOf(map)].map((p) => getComputedStyle(p).fill))
			);
			expect(fills).toHaveLength(2);
			expect([...fills[0]].some((c) => fills[1].has(c))).toBe(false);
		});
	});

	test("`facet.scales: 'free'` fits each panel's own color domain", async () => {
		const { container } = await render(GeoPlot, {
			width: 700,
			height: 400,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			facet: { ...FACET, scales: 'free' },
			color: (f: GeoFeature, slice: GeoSliceContext) => valueFor(name(f), slice.facet?.value)
		});
		// Varones sit 100 above Mujeres, yet each panel spans the whole ramp, so both draw the same colors.
		await vi.waitFor(() => {
			const fills = maps(container).map(
				(map) => new Set([...pathsOf(map)].map((p) => getComputedStyle(p).fill))
			);
			expect(fills).toHaveLength(2);
			expect(fills[1]).toEqual(fills[0]);
		});
	});

	test('a `grouping` of the slice gives each panel a ramp of its own', async () => {
		const { container } = await render(GeoPlot, {
			width: 700,
			height: 400,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			facet: { ...FACET, scales: 'free' },
			color: (f: GeoFeature) => name(f).length,
			grouping: (_f: GeoFeature, slice: GeoSliceContext) => slice.facet?.value,
			segments: {
				Mujeres: [{ scales: { color: { scheme: 'blues' } } }],
				Varones: [{ scales: { color: { scheme: 'reds' } } }]
			}
		});
		await vi.waitFor(() => {
			const [women, men] = maps(container).map((map) =>
				[...pathsOf(map)].map((p) => getComputedStyle(p).fill)
			);
			expect(women?.length).toBeGreaterThan(0);
			// The same values, on two schemes: no color is shared.
			expect(women.some((c) => men.includes(c))).toBe(false);
		});
	});

	test('the legend draws no plot ramp when every feature has a segment ramp of its own', async () => {
		const { container } = await render(GeoPlot, {
			width: 700,
			height: 400,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			color: (f: GeoFeature) => name(f).length,
			grouping: () => 'all',
			segments: { all: [{ scales: { color: { scheme: 'reds' } } }] }
		});
		await vi.waitFor(() =>
			expect(pathsOf(container.querySelector('.dct-plot')!)).toHaveLength(
				ARGENTINA_PROVINCES.length
			)
		);
		// Its one ramp is the segment's.
		expect(container.querySelectorAll('.dct-continuous')).toHaveLength(1);
	});

	test('the legend keeps the plot ramp for the features no segment colors', async () => {
		const { container } = await render(GeoPlot, {
			width: 700,
			height: 400,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			color: (f: GeoFeature) => name(f).length,
			grouping: (f: GeoFeature) => (name(f) === 'Jujuy' ? 'one' : undefined),
			segments: { one: [{ scales: { color: { scheme: 'reds' } } }] }
		});
		await vi.waitFor(() =>
			expect(pathsOf(container.querySelector('.dct-plot')!)).toHaveLength(
				ARGENTINA_PROVINCES.length
			)
		);
		expect(container.querySelectorAll('.dct-continuous')).toHaveLength(2);
	});

	test('the hovered panel resolves the tooltip with its own slice', async () => {
		const { container } = await render(GeoPlot, {
			width: 700,
			height: 400,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			facet: FACET,
			color: (f: GeoFeature, slice: GeoSliceContext) => valueFor(name(f), slice.facet?.value),
			tooltip: {
				sync: true,
				format: (f: GeoFeature, _number: unknown, context: GeoSliceContext) =>
					`${name(f)} · ${context.facet?.value}`
			}
		});
		await vi.waitFor(() => {
			expect(maps(container)).toHaveLength(2);
			expect(pathsOf(maps(container)[1]).length).toBeGreaterThan(3);
		});
		const target = pathsOf(maps(container)[1])[3] as SVGPathElement;
		const box = target.getBoundingClientRect();
		const init = {
			bubbles: true,
			clientX: box.left + box.width / 2,
			clientY: box.top + box.height / 2
		};
		target.dispatchEvent(new PointerEvent('pointerenter', init));
		target.dispatchEvent(new PointerEvent('pointermove', init));
		// With `sync`, each panel writes the hovered province with its own slice.
		await vi.waitFor(() => {
			const texts = maps(container).map(
				(map) => map.querySelector('.dct-tooltip')?.textContent ?? ''
			);
			expect(texts[0]).toContain('Mujeres');
			expect(texts[1]).toContain('Varones');
		});
	});

	test('a map without facet or timeline reads its features in an empty slice', async () => {
		const seen: GeoSliceContext[] = [];
		const { container } = await render(GeoPlot, {
			width: 400,
			height: 300,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			color: (f: GeoFeature, slice: GeoSliceContext) => {
				seen.push(slice);
				return name(f).length;
			}
		});
		await vi.waitFor(() =>
			expect(pathsOf(container.querySelector('.dct-plot')!)).toHaveLength(
				ARGENTINA_PROVINCES.length
			)
		);
		expect(seen.length).toBeGreaterThan(0);
		expect(seen.every((s) => Object.keys(s).length === 0)).toBe(true);
	});

	test("`projection.domain: 'data'` still draws each panel", async () => {
		const { container } = await render(GeoPlot, {
			width: 700,
			height: 400,
			data: ARGENTINA_PROVINCES,
			featureId: name,
			facet: FACET,
			coordinates: { projection: { type: 'mercator', domain: 'data' } }
		});
		await vi.waitFor(() => {
			expect(maps(container)).toHaveLength(2);
			for (const map of maps(container)) {
				expect(pathsOf(map)).toHaveLength(ARGENTINA_PROVINCES.length);
			}
		});
	});
});
