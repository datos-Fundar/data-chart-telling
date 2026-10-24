import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';
import type { CommonMarkerConfigWithRowOffset } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';
import type { Margins } from '$lib/layout/margins/Margins';
import type { BandSlice } from '$lib/types/layout/hover';
import type { TextAnchor } from '$lib/types/plots/constants';

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

/** A text label per row (svelteplot's `Text`), usable on any plot kind. */
export type TextMarkerConfig = CommonMarkerConfigWithRowOffset<
	{
		type: 'text';
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		text: string | ((d: any) => string);
		styles?: FontStyle;
		/** Which side of its point the text sits on: a value, or a function of the row. Wins over `styles.textAnchor`. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		textAnchor?: TextAnchor | ((d: any) => TextAnchor);
		/** Per-row fill, over `styles.fill`. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		fill?: string | ((d: any) => string | undefined);
		/** Per-row fill opacity. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		fillOpacity?: number | ((d: any) => number | undefined);
		/** Spreads overlapping labels apart - see {@link TextDeclutterConfig}. `true` takes every default. */
		declutter?: boolean | TextDeclutterConfig;
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
		onOverflow?: (overflow: Margins) => void;
		/** Fired when the pointer enters a row's label. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onPointerEnter?: (d: any) => void;
		/** Fired when the pointer leaves a row's label. */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onPointerLeave?: (d: any) => void;
	} & CommonMarkerConfig
>;

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
