import type { Snippet } from 'svelte';
import type { HoverStrategy } from '$lib/types/layout/tooltip';
import type { Orientation, TimeValue } from '$lib/types/layout/timeline';

/**
 * How a `PlotComposer` arranges its panels: `areas` names the grid cells
 * (one string per row, `.` for empty), else panels flow into `columns`;
 * `widths`/`heights` are relative track sizes.
 */
export type ComposerLayout = {
	areas?: string[];
	columns?: number;
	widths?: number[];
	heights?: number[];
	gap?: number;
};

/** Labels a composer stamps on its panels in order: `'A'` (A, B, C…), `'a'`, `'1'`, `'I'` (roman), or an explicit list. */
export type ComposerTags = 'A' | 'a' | '1' | 'I' | 'i' | string[];

/** One scrubber for every panel: plots with a `timeline` follow its `progress` over `values`. */
export type ComposerTimelineConfig = {
	progress: number;
	values: TimeValue[];
	orientation?: Orientation;
	show?: boolean;
	thickness?: number;
};

/** Hover shared by every panel: `sync` broadcasts one panel's hover to the others. */
export type ComposerHoverConfig = {
	strategy?: HoverStrategy;
	sync?: boolean;
};

/** The box a `PlotPanel` hands its plot. */
export type PanelContext = { width: number; height: number };
export type PanelSnippet = Snippet<[PanelContext]>;

/** An inset panel's box as fractions of its area, from the left and bottom edges. */
export type PanelInset = { left: number; bottom: number; right: number; top: number };
