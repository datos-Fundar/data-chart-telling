import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { CommonMarkerConfig } from '$lib/types/markers/channels/commonMarkerConfig';
import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

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
	/** The connectors' stroke. Unset opacity follows each label's own `fillOpacity`. */
	connector?: StrokeStyle;
};

/** A text label per row (svelteplot's `Text`), usable on any plot kind. */
export type TextMarkerConfig = {
	type: 'text';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	text: string | ((d: any) => string);
	styles?: FontStyle;
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
	 * `lineAnchor` are the preferred sides, `styles.dx`/`dy` the gap from the point.
	 */
	edgeAware?: boolean;
	/** Reports how far the rendered labels reach past the plot's content box, in pixels, on each side. */
	onOverflow?: (overflow: MarginOverflow) => void;
	/** Fired when the pointer enters a row's label. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onPointerEnter?: (d: any) => void;
	/** Fired when the pointer leaves a row's label. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onPointerLeave?: (d: any) => void;
} & CommonMarkerConfig;
