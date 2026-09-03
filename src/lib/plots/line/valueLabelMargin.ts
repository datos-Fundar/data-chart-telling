import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { estimateValueLabelMargin, laneReachUpperBound } from '$lib/plots/utils/valueLabelMargin';
import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { FontStyle } from '$lib/types/plots/styling';
import type { ValueAnchor } from '$lib/types/plots/constants';

/**
 * `LinePlot`'s own value-label margin estimate — stable across a timeline
 * scrubber or a dataset change, since it's a fixed function of `series` and
 * config, never DOM-measured (see `estimateValueLabelMargin`'s own doc
 * comment). Used two ways: `LinePlot` itself calls this internally as its
 * single-plot `valueLabelFloor`, and a faceted caller (e.g. `ChartPanel` in
 * the consuming app) calls it per facet against that facet's own rows to
 * build a shared `FacetConfig.marginsForFacet` — both get the exact same
 * number for the exact same series, by construction, instead of the two call
 * sites drifting apart with their own separate formulas.
 *
 * Only covers the common case: a rightward-fanning end-of-line label
 * (`anchor: 'start'`, or any anchor whose resolved `dx` isn't negative) —
 * see `LinePlot`'s own `valueLabelFloor` doc comment (unchanged) for why a
 * leftward fan isn't covered here and is left to the DOM-measured fallback.
 */
export function estimateLineValueLabelMargin<TData extends Record<string, unknown>>(
	series: Series<TData>[],
	options: {
		valAnchor?: ValueAnchor;
		fontStyle?: FontStyle;
		formatValue?: (value: number, name: string) => string;
		/** A pinned y domain (e.g. `scales.y.domain`), covering the whole range a timeline scrubber might reveal — see this function's own stability note above. Falls back to `series`'s own current values when omitted. */
		yDomain?: readonly (number | string | boolean | Date | null)[];
	} = {}
): MarginOverflow | undefined {
	const cfg = getConfiguration();
	const valAnchor = options.valAnchor ?? 'start';
	const formatValue = options.formatValue ?? ((v: number, name: string) => `${name} - ${v}`);
	const font = options.fontStyle;

	const defaultDx = valAnchor === 'start' ? 6 : valAnchor === 'end' ? -6 : 0;
	const baseDx = typeof font?.dx === 'number' ? font.dx : defaultDx;
	if ((Math.sign(baseDx) || 1) !== 1) return undefined;

	const defaultTA = valAnchor === 'start' ? 'start' : valAnchor === 'end' ? 'end' : 'middle';
	const resolvedTextAnchor = font?.textAnchor === 'outside' ? undefined : font?.textAnchor;
	const preferredTA = resolvedTextAnchor ?? defaultTA;
	const rightFraction = preferredTA === 'start' ? 1 : preferredTA === 'end' ? 0 : 0.5;

	const fontSize = typeof font?.fontSize === 'number' ? font.fontSize : 12;
	const canvasFont = `${fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`;
	const seriesCount = series.length;
	const reach =
		seriesCount > 1 ? laneReachUpperBound(seriesCount, cfg.line.valueLabels) : Math.abs(baseDx);

	const texts: string[] = [];
	if (options.yDomain && options.yDomain.length >= 2) {
		const lo = Number(options.yDomain[0]);
		const hi = Number(options.yDomain[options.yDomain.length - 1]);
		for (const s of series) {
			texts.push(formatValue(lo, s.name), formatValue(hi, s.name));
		}
	} else {
		for (const s of series) {
			const sy = resolveAccessor(s.y);
			for (const d of s.data) {
				const v = Number(sy(d));
				if (Number.isNaN(v)) continue;
				texts.push(formatValue(v, s.name));
			}
		}
	}
	// +2px: canvas text measurement and svelteplot's own rendered SVG text
	// can disagree by a pixel or so (different rendering engines) — a small
	// buffer that narrows, but doesn't eliminate, the gap noted above.
	const right =
		estimateValueLabelMargin(texts, { canvasFont, textFraction: rightFraction, reach }) + 2;
	return { left: 0, right, top: 0, bottom: 0 };
}
