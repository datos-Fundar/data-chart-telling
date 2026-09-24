import { describe, test, expect, vi } from 'vitest';
import { attachFeatureHover } from '$lib/plots/geo/attachFeatureHover';
import type { GeoFeaturesMarkerConfig } from '$lib/types/markers/geo';
import type { MarkerConfig } from '$lib/types/markers/all';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type Row = { __id: string };

function geoMarker(): GeoFeaturesMarkerConfig {
	return { type: 'geo', data: [{ __id: 'a' }], fill: () => 'red' };
}

function build(hoverActive: boolean) {
	const setHoverMatch = vi.fn();
	const clearHoverMatch = vi.fn();
	const hoverPointById = new Map<string, { row: Row }>([['a', { row: { __id: 'a' } }]]);
	const isOverInset = () => false;
	const markers: MarkerConfig[] = [geoMarker(), { type: 'dot', data: [] } as never];
	const result = attachFeatureHover<Row>(markers, {
		hoverActive,
		hoverPointById,
		isOverInset,
		setHoverMatch,
		clearHoverMatch
	});
	return { result, setHoverMatch, clearHoverMatch };
}

describe('attachFeatureHover', () => {
	test('leaves non-geo markers untouched', () => {
		const { result } = build(true);
		expect(result[1].type).toBe('dot');
		expect(result[1]).not.toHaveProperty('onpointerenter');
	});

	test('when active, onpointerenter matches the hovered feature by __id', () => {
		const { result, setHoverMatch } = build(true);
		const geo = result[0] as GeoFeaturesMarkerConfig;
		geo.onpointerenter!({} as Event, { __id: 'a' });
		expect(setHoverMatch).toHaveBeenCalledWith([{ __id: 'a' }]);
	});

	test('when active, onpointerleave clears the hover match', () => {
		const { result, clearHoverMatch } = build(true);
		const geo = result[0] as GeoFeaturesMarkerConfig;
		geo.onpointerleave!({} as Event);
		expect(clearHoverMatch).toHaveBeenCalledOnce();
	});

	test('when inactive, no pointer handlers are attached', () => {
		const { result } = build(false);
		const geo = result[0] as GeoFeaturesMarkerConfig;
		expect(geo.onpointerenter).toBeUndefined();
		expect(geo.onpointerleave).toBeUndefined();
	});

	test('over an inset panel, the handler is a no-op', () => {
		const setHoverMatch = vi.fn();
		const clearHoverMatch = vi.fn();
		const result = attachFeatureHover<Row>([geoMarker()], {
			hoverActive: true,
			hoverPointById: new Map([['a', { row: { __id: 'a' } }]]),
			isOverInset: () => true,
			setHoverMatch,
			clearHoverMatch
		});
		const geo = result[0] as GeoFeaturesMarkerConfig;
		geo.onpointerenter!({} as Event, { __id: 'a' });
		expect(setHoverMatch).not.toHaveBeenCalled();
	});
});
