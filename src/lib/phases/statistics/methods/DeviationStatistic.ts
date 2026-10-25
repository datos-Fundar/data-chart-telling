import { deviation, extent, mean, median } from 'd3-array';
import { resolveAccessor } from '$lib/utils/accessors';
import type { DeviationStatisticOptions } from '$lib/types/layout/statistics';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { FontStyle } from '$lib/types/plots/styling';
import type { AxisBasedMarkersConfig, TextMarkerConfig } from '$lib/types/markers/common';
import {
	STATISTIC_FALLBACK_COLOR,
	type StatisticSource
} from '$lib/types/phases/statistics/source';

/** Scales a median absolute deviation to the standard deviation of a normal distribution. */
const MAD_SCALE = 1.4826;
const DEFAULT_BAND_OPACITY = 0.15;
const LABEL_FONT_SIZE = 10;
/** Pixels between a label and the line it names, and between it and the plot's edge. */
const LABEL_GAP = 4;

/** An estimator of the source's values along the plot's value axis and a band around it, drawn as a `rect` and a `rule` marker, each optionally labelled by a `text` marker. */
export class DeviationStatistic {
	static build<T extends Record<string, unknown>>(
		source: StatisticSource<T>,
		config: DeviationStatisticOptions
	): AxisBasedMarkersConfig[] {
		const axis = source.axis ?? 'y';
		const read = resolveAccessor(source[axis] as never) as (d: T) => unknown;
		const values = source.data
			.map((d) => {
				const v = read(d);
				return v instanceof Date ? v.getTime() : typeof v === 'number' ? v : NaN;
			})
			.filter(Number.isFinite);
		if (!values.length) return [];

		const center = DeviationStatistic.#estimate(values, config.estimator ?? 'mean');
		const spread = DeviationStatistic.#spread(values, config.spread ?? 'stdev');
		const half = (config.k ?? 1) * spread;
		const color = source.color ?? STATISTIC_FALLBACK_COLOR;

		const markers: AxisBasedMarkersConfig[] = [];
		if (config.band !== false) {
			const { label, ...style } = config.band ?? {};
			const [lo, hi] = [center - half, center + half];
			markers.push({
				type: 'rect',
				data: [{ lo, hi }],
				...(axis === 'x' ? { x1: 'lo', x2: 'hi' } : { y1: 'lo', y2: 'hi' }),
				styles: { fillOpacity: DEFAULT_BAND_OPACITY, ...style, fill: style.fill ?? color }
			});
			if (label) {
				const own = label === true ? {} : label;
				const lower = own.edge === 'lower';
				const outside = own.position === 'outside';
				markers.push(
					DeviationStatistic.#label(axis, lower ? lo : hi, color, lower === outside, {
						text: own.text ?? (config.spread === 'mad' ? 'MAD' : 'STDEV'),
						styles: own.styles
					})
				);
			}
		}
		if (config.rule !== false) {
			const { label, ...style } = config.rule ?? {};
			markers.push({
				type: 'rule',
				axis,
				value: center,
				styles: { ...style, stroke: style.stroke ?? color }
			});
			if (label) {
				const own = label === true ? {} : label;
				markers.push(
					DeviationStatistic.#label(axis, center, color, axis === 'x', {
						text: own.text ?? (config.estimator ?? 'mean').toUpperCase(),
						styles: own.styles
					})
				);
			}
		}
		return markers;
	}

	/**
	 * A label beside the line at `position`, against the plot's start edge: a
	 * vertical line's reads down from the top, a horizontal line's ends at the
	 * right. `towardLower` puts its body on the side of lower values (left of a
	 * vertical line, below a horizontal one).
	 */
	static #label(
		axis: AxisChannelName,
		position: number,
		color: string,
		towardLower: boolean,
		label: { text: string; styles?: FontStyle }
	): TextMarkerConfig {
		const vertical = axis === 'x';
		const fontSize = label.styles?.fontSize ?? LABEL_FONT_SIZE;
		const sign = towardLower ? -1 : 1;
		// A vertical line's text is centred on its own point, so its half-height plus the gap clears the line.
		const gap = LABEL_GAP + (vertical ? fontSize / 2 : 0);
		const [dx, dy] = vertical ? [sign * gap, LABEL_GAP] : [-LABEL_GAP, -sign * gap];
		return {
			type: 'text',
			text: label.text,
			...(vertical ? { x: position } : { y: position }),
			frameAnchor: vertical ? 'top' : 'right',
			styles: {
				fill: color,
				fontSize,
				...(vertical
					? { rotate: 90, textAnchor: 'start', lineAnchor: 'middle' }
					: { textAnchor: 'end', lineAnchor: towardLower ? 'top' : 'bottom' }),
				...label.styles,
				dx: dx + (label.styles?.dx ?? 0),
				dy: dy + (label.styles?.dy ?? 0)
			}
		};
	}

	static #estimate(values: number[], estimator: 'mean' | 'median' | 'midrange'): number {
		if (estimator === 'median') return median(values)!;
		if (estimator === 'midrange') {
			const [lo, hi] = extent(values) as [number, number];
			return (lo + hi) / 2;
		}
		return mean(values)!;
	}

	static #spread(values: number[], spread: 'stdev' | 'mad'): number {
		if (spread === 'mad') {
			const mid = median(values)!;
			return MAD_SCALE * median(values.map((v) => Math.abs(v - mid)))!;
		}
		return deviation(values) ?? 0;
	}
}
