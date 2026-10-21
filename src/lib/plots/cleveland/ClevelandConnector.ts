import { resolveColorScale } from '$lib/utils/color';
import type { ClevelandEntry, ClevelandPlotState } from '$lib/types/plots/cleveland/state';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type {
	ConnectorColor,
	ConnectorLabel,
	ConnectorRange,
	ConnectorStyle
} from '$lib/types/layout/styles';

/** What a connector falls back to - the configuration's `connector` block. */
type ConnectorDefaults = PlotStylesConfig['connector'];

/**
 * The connectors of a Cleveland-style plot as `styles.connector` styles them:
 * what each one measures, its color, its thickness and its label. The plot's
 * marks read each category's connector through it.
 */
export class ClevelandConnector {
	readonly style: ConnectorStyle;
	readonly #defaults: ConnectorDefaults;
	readonly #colorOf: ((range: ConnectorRange) => string | undefined) | undefined;

	constructor(
		style: ConnectorStyle | undefined,
		defaults: ConnectorDefaults,
		entries: readonly ClevelandEntry[]
	) {
		this.style = style ?? {};
		this.#defaults = defaults;
		this.#colorOf = ClevelandConnector.#colors(this.style.color, defaults, entries);
	}

	/** The series a plot's differences run between, from `styles.connector`. */
	static ends<TData extends Record<string, unknown>>(
		state: ClevelandPlotState<TData>
	): { from?: string; to?: string } {
		const { from, to } =
			(state.styles as { connector?: ConnectorStyle } | undefined)?.connector ?? {};
		return { from, to };
	}

	/** `styles.connector` of a plot's state, over the configuration's defaults and what `entries` measure. */
	static of<TData extends Record<string, unknown>>(
		state: ClevelandPlotState<TData>,
		defaults: ConnectorDefaults,
		entries: readonly ClevelandEntry[]
	): ClevelandConnector {
		const style = (state.styles as { connector?: ConnectorStyle } | undefined)?.connector;
		return new ClevelandConnector(style, defaults, entries);
	}

	/** What `entry`'s connector measures, which every other setting reads. */
	rangeOf(entry: ClevelandEntry): ConnectorRange {
		return {
			category: entry.category,
			from: entry.from,
			to: entry.to,
			length: entry.to - entry.from,
			difference: entry.difference,
			span: entry.span,
			series: entry.dots.length === 1 ? entry.dots[0].series : undefined
		};
	}

	/** The color the author asks for `range`'s connector, if they do. */
	color(range: ConnectorRange): string | undefined {
		return this.#colorOf?.(range);
	}

	/** The thickness the author asks for `range`'s connector, if they do, given the dots' radius. */
	width(range: ConnectorRange, dotRadius: number): number | undefined {
		const { width } = this.style;
		if (width === undefined) return undefined;
		if (width === 'dots') return dotRadius * 2;
		return typeof width === 'function' ? width(range) : width;
	}

	/** The opacity the author asks for `range`'s connector, if they do. */
	opacity(range: ConnectorRange): number | undefined {
		const { opacity } = this.style;
		return typeof opacity === 'function' ? opacity(range) : opacity;
	}

	/** How the part of a connector outside the `from`-`to` stretch looks, over the plot's neutral `fallback` color. */
	outside(fallback: string): { stroke: string; strokeOpacity: number } {
		const { outside } = this.style;
		const own = typeof outside === 'string' ? { color: outside } : (outside ?? {});
		return {
			stroke: own.color ?? fallback,
			strokeOpacity: own.opacity ?? this.#defaults.outsideOpacity
		};
	}

	/** The head of the arrow a connector is drawn as, `undefined` when it is a line. */
	get arrow(): { width: number; headLength: number; headAngle: number } | undefined {
		const { arrow } = this.style;
		if (!arrow) return undefined;
		const own = arrow === true ? {} : arrow;
		return { ...this.#defaults.arrow, ...own };
	}

	/** The length (px) of the caps a connector draws at its ends, `undefined` when it draws none, given whether the plot draws them unless told otherwise. */
	caps(byDefault: boolean | undefined): number | undefined {
		const { caps } = this.style;
		const on = caps === undefined ? (byDefault ?? false) : caps !== false;
		if (!on) return undefined;
		return (typeof caps === 'object' ? caps.length : undefined) ?? this.#defaults.capLength;
	}

	/** The label options: `undefined` without a label. */
	get label(): ConnectorLabel | undefined {
		const { label } = this.style;
		return label === undefined || label === false ? undefined : label === true ? {} : label;
	}

	/** What the label of `range`'s connector says, `undefined` when it has nothing to say (no difference). */
	text(range: ConnectorRange): string | undefined {
		const label = this.label ?? {};
		const what = label.text ?? 'difference';
		if (typeof what === 'function') return what(range);
		const value = what === 'length' ? range.length : range.difference;
		if (value === undefined || !Number.isFinite(value)) return undefined;
		if (label.format) return label.format(value, range);
		const rounded = Math.round(value * 100) / 100;
		return what === 'difference' && rounded > 0 ? `+${rounded}` : String(rounded);
	}

	/** The color function for `by`, over what `entries` measure, or `undefined` when no color is asked for. */
	static #colors(
		color: ConnectorColor | undefined,
		defaults: ConnectorDefaults,
		entries: readonly ClevelandEntry[]
	): ((range: ConnectorRange) => string | undefined) | undefined {
		if (color === undefined) return undefined;
		if (typeof color === 'string') return () => color;
		if (typeof color === 'function') return color;
		if (color.by === 'sign') {
			const { positive, negative, zero } = { ...defaults.sign, ...color };
			return ({ difference }) =>
				difference === undefined
					? zero
					: difference > 0
						? positive
						: difference < 0
							? negative
							: zero;
		}
		const { by, ...config } = color;
		const read = (range: ConnectorRange) => (by === 'length' ? range.length : range.difference);
		const values = entries
			.map((entry) => (by === 'length' ? entry.to - entry.from : entry.difference))
			.filter((value): value is number => value !== undefined && Number.isFinite(value));
		if (values.length === 0) return undefined;
		const lo = Math.min(...values);
		const hi = Math.max(...values);
		const diverging = by === 'difference' && config.scheme === undefined;
		const scale = resolveColorScale(
			{
				...(diverging ? { scheme: defaults.differenceScheme, pivot: 0 } : {}),
				...(by === 'length' && config.scheme === undefined
					? { scheme: defaults.lengthScheme }
					: {}),
				...config
			},
			by === 'difference' ? [Math.min(lo, 0), Math.max(hi, 0)] : [lo, hi],
			by === 'length' ? defaults.lengthScheme : defaults.differenceScheme
		);
		return (range) => {
			const value = read(range);
			return value === undefined ? undefined : scale(value);
		};
	}
}
