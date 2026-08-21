/// <reference types="geojson" />
import type { EasingName, EasingFn } from '$lib/types/charts/interpolate';
import type { GeoInsetLocation } from '$lib/types/markers/geo';

/** What the camera frames. `features` shares its id space with `segments`/`featureId`. `center` has no extent of its own — see `GeoCameraConfig.zoom`. */
export type GeoCameraTarget =
	| { features: string[] }
	| { center: [number, number] }
	| { bounds: GeoJSON.GeoJsonObject };

/**
 * How the camera moves to a newly resolved target.
 * - `progress` unset: auto-plays once over `duration` ms, eased by `easing`.
 * - `progress` set (a live 0–1 value, e.g. from scroll): renders the move as
 *   a pure function of it instead — stalls/reverses with the input.
 */
export type GeoCameraTransition = {
	/** Auto-play duration in ms, ignored once `progress` is set. Defaults to 750. */
	duration?: number;
	/** Same `EasingName | EasingFn` vocabulary as `styles.gaps`/`TimelineConfig.interpolate`. */
	easing?: EasingName | EasingFn;
	/** A live 0–1 value the host drives itself instead of an auto-played duration. */
	progress?: number;
	/** Which way to interpolate rotation when ambiguous — only relevant for `orthographic`. `'shortest'` (default) or `'longest'`. No-op for 2D projections. */
	direction?: 'shortest' | 'longest';
};

/**
 * `coordinates.camera` — `GeoPlot`'s declarative "current viewpoint": frames,
 * zooms and anchors on `target`, animated on change. Realized as a
 * pixel-space pan/zoom transform for 2D projections, plus a `rotate`
 * override for `orthographic`. Composes with interactive `coordinates.pan`/`zoom`/`rotate`.
 */
export type GeoCameraConfig = {
	target: GeoCameraTarget;
	/** Multiplier on the auto-fit scale for a `features`/`bounds` target (`1` = tight fit). For a `center` target, used directly as the pixel scale instead. */
	zoom?: number;
	/** Where the framed target lands within the plot frame — the same 9-point vocabulary `inset` markers use. Defaults to `'middle-middle'`. */
	anchor?: GeoInsetLocation;
	/** Pixel gap kept between the framed target and whichever edge(s) `anchor` pushes it toward. Defaults to 24. */
	padding?: number;
	transition?: GeoCameraTransition;
};
