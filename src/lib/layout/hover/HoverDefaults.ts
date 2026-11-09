import type { HoverDisplayPoint, HoverStrategy } from '$lib/types/layout/hover';
import type {
	HoverLayerMarker,
	HoverLook,
	HoverMarkerConfig,
	HoverShapeStyle
} from '$lib/types/markers/common';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

/** An end of a span: a field of the hovered point's context (else of its row), or a function of the point. */
type SpanEnd = string | ((point: HoverDisplayPoint) => unknown);

/**
 * The hover a plot kind draws, and how an author's `hover` marker is laid over it. Its parts - a crosshair rule, a
 * band, a dot, a label - are the markers a kind composes its own hover from; each takes the configuration's
 * `hover` look as it is drawn (see `HoverLayers`).
 */
export class HoverDefaults {
	/** A crosshair along `axis`, at the point under the pointer. */
	static rule(axis: 'x' | 'y'): HoverLayerMarker {
		return { type: 'rule', axis, points: 'active' };
	}

	/** The band of each hovered category along `axis`, or its series' slice of it when it alone is hovered there. */
	static band(axis: 'x' | 'y'): HoverLayerMarker {
		return { type: 'band', axis };
	}

	/**
	 * The span of the point under the pointer along `axis`, from `from` to `to`, across the whole of the other axis -
	 * where a band is no category's: a histogram's bin, an interval on a continuous axis. Each end is a field of the
	 * point's context (a bin's `from` and `to`) - else of its row - or a function of the point.
	 */
	static span(axis: 'x' | 'y', from: SpanEnd, to: SpanEnd): HoverLayerMarker {
		const end = (side: SpanEnd) =>
			typeof side === 'function'
				? side
				: (point: HoverDisplayPoint & { row?: Record<string, unknown> }) =>
						(point.context as Record<string, unknown> | undefined)?.[side] ?? point.row?.[side];
		return {
			type: 'rect',
			[`${axis}1`]: end(from),
			[`${axis}2`]: end(to),
			points: 'active'
		} as HoverLayerMarker;
	}

	/** A dot on each hovered point, in its series' color. */
	static dot(): HoverLayerMarker {
		return { type: 'dot' };
	}

	/** Each hovered point's label, in its series' color. */
	static text(): HoverLayerMarker {
		return { type: 'text' };
	}

	/**
	 * A hover that only restyles the shapes, with `active` and `others`: a treemap's tiles, a heatmap's cells. The
	 * hovered one is outlined, in the configuration's `hover.active`.
	 */
	static shapes(cfg: PlotStylesConfig): HoverLook {
		return { back: [], front: [], active: { ...cfg.hover.active } as HoverShapeStyle };
	}

	/** The hovered category's band along `axis`, behind the plot's shapes: a bar's, a box's, a violin's. */
	static behindBand(axis: 'x' | 'y'): HoverLook {
		return { back: [HoverDefaults.band(axis)], front: [] };
	}

	/** The span of the point under the pointer along `axis`, behind the plot's shapes: a histogram's bin. */
	static behindSpan(axis: 'x' | 'y', from: SpanEnd, to: SpanEnd): HoverLook {
		return { back: [HoverDefaults.span(axis, from, to)], front: [] };
	}

	/**
	 * A rule along the value axis at the point under the pointer, and a dot and a label on each point - for a plot
	 * whose other axis holds a few positions or categories, where a crosshair along it says little (a slope's, a
	 * Cleveland plot's).
	 */
	static valueRule(valueAxis: 'x' | 'y'): HoverLook {
		return {
			back: [HoverDefaults.rule(valueAxis)],
			front: [HoverDefaults.dot(), HoverDefaults.text()]
		};
	}

	/**
	 * The hover every plot kind starts from: a crosshair along each axis its `strategy` matches along (unless
	 * `crosshair` is off), and a dot and a label on each hovered point.
	 */
	static of(strategy: HoverStrategy, crosshair: boolean | undefined = true): HoverLook {
		const axes: ('x' | 'y')[] =
			strategy === 'x'
				? ['x']
				: strategy === 'y'
					? ['y']
					: strategy === 'punctual'
						? ['x', 'y']
						: [];
		return {
			back: crosshair === false ? [] : axes.map((axis) => HoverDefaults.rule(axis)),
			front: [HoverDefaults.dot(), HoverDefaults.text()]
		};
	}

	/**
	 * An author's `hover` marker over its kind's `look`: `active` and `others` field by field, `back` and `front`
	 * the author's when set (an empty list draws nothing), the kind's otherwise.
	 */
	static merge(look: HoverLook, marker: HoverMarkerConfig): HoverMarkerConfig {
		const styles = (own: object | undefined, base: object | undefined) =>
			own || base ? { ...base, ...own } : undefined;
		return {
			...marker,
			active: styles(marker.active, look.active),
			others: styles(marker.others, look.others),
			back: marker.back ?? look.back ?? [],
			front: marker.front ?? look.front ?? []
		};
	}
}
