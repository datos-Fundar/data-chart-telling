import type { HoverStrategy } from '$lib/types/layout/hover';
import type {
	Orientation,
	PlayerConfig,
	TimeValue,
	TimelineCallbacks,
	TimelineType
} from '$lib/types/layout/timeline';

/**
 * How a `PlotComposer` arranges its panels: `areas` names the grid cells
 * (one string per row, `.` for empty), else panels flow into `columns`;
 * `widths`/`heights` are relative track sizes. `align` lines up every
 * panel's plot area with its row and column, like facets do - for panels
 * whose plots draw no chrome of their own.
 */
export type ComposerLayout = {
	areas?: string[];
	columns?: number;
	widths?: number[];
	heights?: number[];
	gap?: number;
	align?: boolean;
};

/** Labels a composer stamps on its panels in order: `'A'` (A, B, C…), `'a'`, `'1'`, `'I'` (roman), or an explicit list. */
export type ComposerTags = 'A' | 'a' | '1' | 'I' | 'i' | string[];

/** One timeline for every panel: plots with a `timeline` follow its `progress` over `values`. */
export type ComposerTimelineConfig = TimelineCallbacks & {
	progress?: number;
	values: TimeValue[];
	/** How it draws. Defaults to `'player'`. */
	type?: TimelineType;
	/** The player bar's own options, when `type` is `'player'`. */
	player?: PlayerConfig;
	orientation?: Orientation;
	show?: boolean;
	thickness?: number;
};

/** Hover shared by every panel: `sync` broadcasts one panel's hover to the others. */
export type ComposerHoverConfig = {
	strategy?: HoverStrategy;
	sync?: boolean;
};
