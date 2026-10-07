import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import {
	estimateValueLabelMargin,
	estimateValueLabelVerticalMargin,
	laneReachUpperBound
} from '$lib/plots/utils/valueLabelMargin';
import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { FontStyle } from '$lib/types/plots/styling';
import type { ValueAnchor } from '$lib/types/plots/constants';

/**
 * `LinePlot`'s value-label margin estimate: the end-of-line fan's
 * horizontal reach (`left` or `right`, whichever side it fans toward, with
 * the same amount mirrored to the other side for a fan that can flip),
 * plus the label text's own vertical reach on `top`/`bottom`. Stable across
 * a timeline scrubber or dataset change, not DOM-measured. Also used by a
 * faceted caller to build a shared `FacetConfig.marginsForFacet`.
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
): MarginOverflow {
	const cfg = getConfiguration();
	const valAnchor = options.valAnchor ?? 'start';
	const formatValue = options.formatValue ?? ((v: number, name: string) => `${name} - ${v}`);
	const font = options.fontStyle;

	const defaultDx = valAnchor === 'start' ? 6 : valAnchor === 'end' ? -6 : 0;
	const baseDx = typeof font?.dx === 'number' ? font.dx : defaultDx;
	const dir = Math.sign(baseDx) || 1;

	const defaultTA = valAnchor === 'start' ? 'start' : valAnchor === 'end' ? 'end' : 'middle';
	const resolvedTextAnchor = font?.textAnchor === 'outside' ? undefined : font?.textAnchor;
	const preferredTA = resolvedTextAnchor ?? defaultTA;
	const outwardFraction = preferredTA === 'start' ? 1 : preferredTA === 'end' ? 0 : 0.5;

	const fontSize = typeof font?.fontSize === 'number' ? font.fontSize : 12;
	const canvasFont = `${fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`;
	const seriesCount = series.length;
	const reach =
		seriesCount > 1 ? laneReachUpperBound(seriesCount, cfg.text.declutter) : Math.abs(baseDx);

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
	const horizontal =
		estimateValueLabelMargin(texts, { canvasFont, textFraction: outwardFraction, reach }) + 2;

	const defaultDy = valAnchor === 'outside' ? -8 : 0;
	const defaultLA = valAnchor === 'outside' ? 'bottom' : 'middle';
	const dy = typeof font?.dy === 'number' ? font.dy : defaultDy;
	const { top, bottom } = estimateValueLabelVerticalMargin({
		fontSize,
		lineAnchor: font?.lineAnchor ?? defaultLA,
		dy
	});

	return {
		left: dir === -1 ? horizontal : 0,
		right: dir === 1 ? horizontal : seriesCount > 1 ? horizontal : 0,
		top,
		bottom
	};
}
