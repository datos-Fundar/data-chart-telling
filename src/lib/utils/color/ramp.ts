import { interpolateRgb, piecewise } from 'd3-interpolate';
import * as d3Chromatic from 'd3-scale-chromatic';
import { resolveCssColor } from './cssColor';
import type { ColorScaleConfig } from '$lib/types/layout/scales';

/** Linearly maps `v` from `[min, max]` onto `[0, 1]`, clamped at both ends. */
export function normalize(v: number, min: number, max: number): number {
	if (v == null) return 0;
	const denom = max - min || 1;
	return Math.max(0, Math.min(1, (v - min) / denom));
}

/** Cycles through a discrete palette by series index - the default colour for an unstyled series. */
export function paletteColor(index: number, palette: string[]): string {
	if (palette.length === 0) return 'currentColor';
	return palette[index % palette.length];
}

/** A simple 2-color continuous ramp over `[min, max]`. */
export function makeColorScale(
	min: number,
	max: number,
	colorMin: string,
	colorMax: string
): (v: number) => string {
	const resolvedMin = resolveCssColor(colorMin);
	const resolvedMax = resolveCssColor(colorMax);

	let interpolator: (t: number) => string;
	try {
		interpolator = interpolateRgb(resolvedMin, resolvedMax);
	} catch {
		return () => '#ccc';
	}

	return (v: number) => {
		if (v == null) return '#ccc';
		const t = normalize(v, min, max);
		return interpolator(t);
	};
}

/** `{turbo: interpolateTurbo, blues: interpolateBlues, ...}`, built from every `interpolate*` d3-scale-chromatic export. */
const NAMED_SCHEMES: Record<string, (t: number) => string> = Object.fromEntries(
	Object.entries(d3Chromatic)
		.filter((entry): entry is [string, (t: number) => string] => entry[0].startsWith('interpolate'))
		.map(([name, fn]) => [name.slice('interpolate'.length).toLowerCase(), fn])
);

/**
 * Resolves a {@link ColorScaleConfig} into a `value => color` function - the
 * one shared implementation for every level the config can appear at
 * (`scales.color`, a `segments` entry, a marker's own `scales`).
 * `computedDomain` is the fallback when `config.domain` is unset;
 * `defaultScheme` is used when `config.scheme` is unset - the theme's own
 * 2-color continuous ramp, or a discrete palette for a categorical domain
 * (e.g. per-series identity colors).
 */
export function resolveColorScale(
	config: ColorScaleConfig | undefined,
	computedDomain: [number, number] | string[] | undefined,
	defaultScheme: NonNullable<ColorScaleConfig['scheme']>
): (value: unknown) => string {
	const domain = config?.domain ?? computedDomain;
	const scheme = config?.scheme ?? defaultScheme;
	const unknown = config?.unknown ?? '#ccc';

	if (!domain || domain.length === 0) return () => unknown;

	// A category → color map always resolves by direct lookup, regardless of domain shape.
	if (typeof scheme === 'object' && !Array.isArray(scheme)) {
		return (v) => (v == null ? unknown : (scheme[String(v)] ?? unknown));
	}

	// A named d3-scale-chromatic ramp (e.g. 'turbo') resolves straight to its own interpolator.
	const namedInterpolator =
		typeof scheme === 'string' ? NAMED_SCHEMES[scheme.toLowerCase()] : undefined;
	if (typeof scheme === 'string' && !namedInterpolator) return () => unknown;

	const resolvedScheme = namedInterpolator ? undefined : (scheme as string[]).map(resolveCssColor);
	if (resolvedScheme && resolvedScheme.length === 0) return () => unknown;
	if (resolvedScheme && resolvedScheme.length === 1) {
		const only = resolvedScheme[0];
		return () => only;
	}

	// Categorical domain (explicit category list): sample the ramp evenly, one stop per category.
	if (typeof domain[0] === 'string') {
		const categories = domain as string[];
		const swatches =
			resolvedScheme ??
			categories.map((_, i) =>
				namedInterpolator!(categories.length > 1 ? i / (categories.length - 1) : 0)
			);
		return (v) => {
			if (v == null) return unknown;
			const idx = categories.indexOf(String(v));
			return idx < 0 ? unknown : swatches[idx % swatches.length];
		};
	}

	// Continuous domain: interpolate smoothly across every scheme stop (or the named ramp directly).
	const [lo, hi] = domain as [number, number];
	let interpolator: (t: number) => string;
	if (namedInterpolator) {
		interpolator = namedInterpolator;
	} else {
		try {
			interpolator = piecewise(interpolateRgb, resolvedScheme!) as (t: number) => string;
		} catch {
			return () => unknown;
		}
	}
	const pivot = config?.pivot;
	const stopCount = resolvedScheme?.length ?? Infinity;

	return (v) => {
		if (v == null) return unknown;
		const n = Number(v);
		if (Number.isNaN(n)) return unknown;
		const t =
			pivot != null && stopCount >= 3
				? n <= pivot
					? 0.5 * normalize(n, lo, pivot)
					: 0.5 + 0.5 * normalize(n, pivot, hi)
				: normalize(n, lo, hi);
		return interpolator(t);
	};
}
