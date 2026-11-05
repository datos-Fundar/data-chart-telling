import type { FontStyle, StrokeStyle, PerRow } from '$lib/types/plots/styling';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';
import type { CommonMarkerConfigWithRowOffset } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';
import type { Margins } from '$lib/layout/margins/Margins';
import type { BandSlice } from '$lib/types/layout/hover';
import type { TextAnchor } from '$lib/types/plots/constants';
import type { NumberDisplay } from '$lib/types/layout/numbers';

/**
 * Spreads labels that would overlap apart vertically, all reaching out to one
 * shared column, each routed back to its own point by an elbow connector.
 * Unset geometry falls back to the configuration's `text.declutter`.
 */
export type TextDeclutterConfig = {
	/** Shortest lane's distance (px) from the point before a connector bends. */
	elbowGap?: number;
	/** Extra distance (px) each further lane sits out from the last. */
	laneStep?: number;
	/** Clearance (px) between the outermost lane and the label text. */
	labelGap?: number;
	/** Routes every label out to the shared column through a connector, even when none of them overlaps. */
	aligned?: boolean;
	/** Whether a leftward fan with no room before the content box flips to the right. Defaults to `true`; labels meant for the margin there turn it off. */
	flip?: boolean;
	/** The connectors' stroke. Unset opacity follows each label's own `fillOpacity`. */
	connector?: StrokeStyle;
};

/** Where a row's `x1`, `x2`, `y1` and `y2` are: a field of the rows, the symbol a transform keyed it by, or a function of the row. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FitChannel = string | symbol | ((d: any) => unknown);

/**
 * What a label is fitted to: the rectangle its row spans, from `x1` to `x2` along the x axis and from `y1` to `y2`
 * along the y - a tile of a `treemap` transform, say. A label too big for it is written smaller, down to
 * `minFontSize`; at that size, broken into as many lines as the box holds and cut short with an ellipsis; and
 * when almost none of it would show, as its `fallback`. A label with no room for even that is left out.
 */
export type TextFitConfig = {
	/** The edges of a box of your own. A marker that draws a shape for each label gives its own, and these are left out. */
	x1?: FitChannel;
	x2?: FitChannel;
	y1?: FitChannel;
	y2?: FitChannel;
	/** Pixels left free inside each edge of the box. Defaults to the configuration's `text.label.padding`, `4`. */
	padding?: number;
	/** The smallest size a label is written at, in px. Defaults to the configuration's `text.label.minFontSize`, `8`. */
	minFontSize?: number;
	/** The fewest letters worth writing when a text is cut short; under them the `fallback` is written. Defaults to the configuration's `text.label.minLetters`, `3`. */
	minLetters?: number;
	/** What to write when the text does not fit, cut short or not - a value alone, say; a number is written as the marker's `decimals` and the rest ask. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fallback?: string | number | ((d: any) => string | number);
};

/** The text styles that can be a function of the row. */
type TextRowStyleKey = 'fill' | 'stroke' | 'strokeWidth' | 'fontWeight' | 'fontStyle';

/** The text styles that can be a function of the row. */
type TextRowStyle = Pick<FontStyle, TextRowStyleKey> & { fillOpacity?: number };

export type TextMarkerConfig = CommonMarkerConfigWithRowOffset<
	{
		type: 'text';
		/**
		 * What each label says: a text; a number; the name of a field of the rows (a number there reads as a number); or a function of
		 * the row giving a text or a number. A number is written as {@link NumberDisplay} asks - this marker's own
		 * `decimals`, `prefix`, `suffix` and `signDisplay`, over the configuration's `numbers`.
		 */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		text: string | number | ((d: any) => string | number);
		/**
		 * How the labels are drawn. `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `fontWeight` and `fontStyle` can each be a function of the row;
		 * the rest place and measure the labels, so they are the same for all of them.
		 */
		styles?: PerRow<TextRowStyle> & Omit<FontStyle, TextRowStyleKey>;
		/** Which side of its point the text sits on: a value, or a function of the row. Wins over `styles.textAnchor`. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		textAnchor?: TextAnchor | ((d: any) => TextAnchor);
		/** Spreads overlapping labels apart - see {@link TextDeclutterConfig}. `true` takes every default. */
		declutter?: boolean | TextDeclutterConfig;
		/** Writes each label to fit its box - see {@link TextFitConfig}. `true` takes every default. */
		fit?: boolean | TextFitConfig;
		/**
		 * Flips each label to the other side of its point (or nudges a centred one
		 * back in) where its text would cross the plot's edge. `styles.textAnchor`/
		 * `lineAnchor` are the preferred sides, `dx`/`dy` (else `styles.dx`/`dy`) the gap from the point.
		 */
		edgeAware?: boolean;
		/** The slice of its category band each label sits in (a grouped bar's series); it is drawn off the band's middle, whatever the band's width. */
		bandSlice?: BandSlice;
		/** Where, in the plot's frame, a label sits on an axis it sets no position for: `{ type: 'text', x: 5, frameAnchor: 'top' }` is at the frame's top edge. */
		frameAnchor?:
			| 'top'
			| 'bottom'
			| 'left'
			| 'right'
			| 'top-left'
			| 'top-right'
			| 'bottom-left'
			| 'bottom-right'
			| 'middle';
		/** Grows the plot's margins, on every side the author left open, so the labels fit. */
		fitMargins?: boolean;
		/** Reports how far the rendered labels reach past the plot's content box, in pixels, on each side. */
		onoverflow?: (overflow: Margins) => void;
	} & NumberDisplay &
		CommonMarkerConfig
>;

/** A `text` marker as a shape's `label`: all of it but what the shape sets - its `type`, its rows and the label's position. */
export type TextLabelConfig = Omit<
	TextMarkerConfig,
	'type' | 'data' | 'x' | 'y' | 'frameAnchor'
> & {
	/**
	 * Where in its shape the label sits: its `'middle'` (the default), against one of its edges (`'top'`, `'bottom'`,
	 * `'left'`, `'right'`) or in one of its corners (`'top-left'`...). The label's `dx` and `dy` move it from there.
	 */
	anchor?: LabelAnchor;
	/**
	 * Puts a label anchored to an edge beyond that edge, outside the shape, instead of inside it. A label out there is not
	 * fitted to the shape, and with `fitMargins` the plot's margins grow to hold it.
	 */
	outside?: boolean;
	/** Pixels between the label and the edge it is anchored to. Defaults to the configuration's `text.label.gap`, `4`. */
	gap?: number;
};

/** Where a label sits in its shape - see {@link TextLabelConfig}. */
export type LabelAnchor =
	| 'middle'
	| 'top'
	| 'bottom'
	| 'left'
	| 'right'
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right';

/** Where one decluttered label goes - see `Declutter.buildLanes`. */
export type LabelLane = {
	/** Vertical shift (px) clearing its neighbours and the content box's edges. */
	extraDy: number;
	/** Whether every label reaches out to the shared column (some labels clustered). */
	aligned: boolean;
	/** Horizontal reach (px) of the shared column. */
	reach: number;
	/** Horizontal reach (px) of this label's own lane, where its connector bends. */
	laneReach: number;
	/** Side the labels fan toward: `1` right, `-1` left. */
	dir: number;
};
