import { Box } from '$lib/layout/margins/Box';
import { TextFormat } from '$lib/utils/TextFormat';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisScale } from '$lib/types/layout/scales';

type Config = Pick<PlotStylesConfig, 'axis' | 'font'>;

/** An axis' tick labels cut to the scale's `maxWidth`, and the room the widest of them takes. */
export class TickText {
	/**
	 * `scale` with its tick labels cut short to its `maxWidth`, as a `tickFormat` (its own, when it has one, written
	 * first). Only a category axis (`discrete`) or an axis with a `tickFormat` of its own has texts to cut: any other
	 * is left to svelteplot, and so is one whose labels are split in `lines`. The field is taken out either way.
	 */
	static apply<TScale extends AxisScale<never> | undefined>(
		scale: TScale,
		cfg: Config,
		discrete: boolean
	): TScale {
		if (!scale || scale.maxWidth === undefined) return scale;
		const { maxWidth, ...rest } = scale;
		const own =
			typeof rest.tickFormat === 'function'
				? (rest.tickFormat as (d: unknown, index: number, ticks: unknown[]) => string | string[])
				: undefined;
		if ((!own && !discrete) || (rest.lines ?? 1) > 1) return rest as TScale;
		const cut = TextFormat.of(
			{ maxWidth },
			(text) => Box.ofText(text, cfg.axis.fontSize, cfg).width
		);
		return {
			...rest,
			tickFormat: (d: unknown, index: number, ticks: unknown[]) =>
				cut(own ? String(own(d, index, ticks)) : String(d))
		} as unknown as TScale;
	}

	/**
	 * The room (px) a y axis takes at its side for `labels`, the texts it writes - all of its categories, not the
	 * ones drawn: the widest, then the tick and its gap, as svelteplot sizes an axis. `undefined` for a scale with
	 * no `maxWidth`, or whose axis takes no room.
	 */
	static room(
		scale: AxisScale<never> | undefined,
		labels: string[],
		cfg: Config
	): number | undefined {
		if (scale?.maxWidth === undefined || scale.axisDisplay === 'none' || labels.length === 0)
			return undefined;
		const widest = Math.max(
			...labels.map((text) => Box.ofText(text, cfg.axis.fontSize, cfg).width)
		);
		// +2px: canvas and SVG text can measure a pixel or so apart.
		return (
			Math.ceil(widest + 2) +
			(scale.tickPadding ?? cfg.axis.yTickPadding) +
			(scale.tickSize ?? cfg.axis.yTickSize) +
			1
		);
	}
}
