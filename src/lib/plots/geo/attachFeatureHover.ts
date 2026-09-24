import type { MarkerConfig } from '$lib/types/markers/all';
import type { GeoFeaturesMarkerConfig } from '$lib/types/markers/geo';

/**
 * Attaches GeoPlot's live hover pointer handlers onto the base `'geo'`
 * marker(s) built by the "markers" phase — the one piece that needs
 * `BasePlotLayout`'s own hover controller callbacks, so it can't be a phase.
 */
export function attachFeatureHover<TRow extends Record<string, unknown> & { __id: string }>(
	markers: MarkerConfig[],
	args: {
		hoverActive: boolean;
		hoverPointById: Map<string, { row: TRow }>;
		isOverInset: (e: PointerEvent) => boolean;
		setHoverMatch: (rows: TRow[]) => void;
		clearHoverMatch: () => void;
	}
): MarkerConfig[] {
	const { hoverActive, hoverPointById, isOverInset, setHoverMatch, clearHoverMatch } = args;

	return markers.map((m) => {
		if (m.type !== 'geo') return m;
		const geo = m as GeoFeaturesMarkerConfig;
		return {
			...geo,
			onpointerenter: hoverActive
				? (e: Event, d: Record<string, unknown>) => {
						if (isOverInset(e as PointerEvent)) return;
						const hp = hoverPointById.get((d as TRow).__id);
						if (hp) setHoverMatch([hp.row]);
					}
				: undefined,
			onpointerleave: hoverActive
				? (e: Event) => {
						if (isOverInset(e as PointerEvent)) return;
						clearHoverMatch();
					}
				: undefined
		};
	});
}
