import type { Snippet } from 'svelte';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { Accessor } from '$lib/types/plots/data/common';
import type { EasingName, EasingFn } from '$lib/types/misc/easing';

/** A step as the timeline works with it: a number (a date as its timestamp). */
export type TimeValue = number;

/** A step as the rows hold it: a number, a `Date` or a date string. */
export type TimeInput = TimeValue | Date | string;

/** A step as authors see it: a `Date` on a timeline of dates, else the number. */
export type TimelineStep = number | Date;
export type Orientation = 'horizontal' | 'vertical';

export type TimelineChildContext<TRow extends Record<string, unknown>> = {
	selectedValue: TimeValue;
	data: TRow[];
	width: number;
	height: number;
};
export type TimelineChildSnippet<TRow extends Record<string, unknown>> = Snippet<
	[TimelineChildContext<TRow>]
>;

export type TimelineInterpolation<TRow extends Record<string, unknown>> = {
	key?: Accessor<TRow, unknown>;
	value?: Accessor<TRow, AxisValue>;
	create?: (lower: TRow, upper: TRow, x: TimeValue, value: number) => TRow;
	progressEasing?: EasingName | EasingFn;
	segmentEasing?: EasingName | EasingFn;
};

/** How a timeline draws: a `'player'` bar in the chrome (the default), or a `'rule'` beside the plot. */
export type TimelineType = 'rule' | 'player';

/** A piece of the player bar. */
export type PlayerControl = 'play' | 'value' | 'slider' | 'speed' | 'loop';

/**
 * The player bar (`timeline.type: 'player'`): which controls it draws, in what
 * order, and how it plays. `loop` and `speed` are where the player starts: it
 * keeps them from there, and tells `onloop` and `onspeed` when they change.
 */
export type PlayerConfig = {
	/** The controls drawn, in this order - one left out isn't drawn. Defaults to the configuration's `timeline.player.controls`. */
	controls?: PlayerControl[];
	/** Starts playing as soon as the timeline has steps. */
	autoplay?: boolean;
	/** Starts again from the first step after the last, instead of stopping. */
	loop?: boolean;
	/** The playing speed, as a multiple of `stepDuration`. Defaults to `1`. */
	speed?: number;
	/** The speeds the speed control cycles through. Defaults to the configuration's `timeline.player.speeds`. */
	speeds?: number[];
	/** Milliseconds each step lasts at speed `1`. Defaults to the configuration's `timeline.player.stepDuration`. */
	stepDuration?: number;
	/** How a step reads, in the player and along a rule. Defaults to the step, or a date label for dates. */
	format?: (value: TimelineStep) => string;
	onplay?: (playing: boolean) => void;
	onspeed?: (speed: number) => void;
	onloop?: (loop: boolean) => void;
};

/** What every timeline can tell its owner, whatever it draws as. */
export type TimelineCallbacks = {
	/** Called with the new position, `0`-`1`, whenever the player or the reader moves it. */
	onprogress?: (progress: number) => void;
	/** Called with the step the position lands on, when that step changes. */
	onvalue?: (value: TimelineStep) => void;
};

export type TimelineConfig<TRow extends Record<string, unknown>> = TimelineCallbacks & {
	/** The field (or function) giving each row's step: a number, a `Date`, or an ISO or `dateFormat` date string. */
	accessor: Accessor<TRow, TimeInput>;
	/** How a non-ISO date string reads, with `YYYY`, `MM`, `DD`, `HH`, `mm`, `ss`, e.g. `'DD/MM/YYYY'`. */
	dateFormat?: string;
	/** How it draws. Defaults to `'player'`. */
	type?: TimelineType;
	/** The player bar's own options, when `type` is `'player'`. */
	player?: PlayerConfig;
	/**
	 * The timeline's position, `0`-`1`. A `'player'` keeps its own position from
	 * there on (see `onprogress`), until this changes. Inside a `PlotComposer`
	 * with its own `timeline`, the composer's wins and nothing draws here.
	 */
	progress?: number;
	/** The steps, when not every distinct value of `accessor`. */
	values?: TimeInput[];
	/** Which way a `'rule'` runs. A `'player'` is always horizontal. */
	orientation?: Orientation;
	show?: boolean;
	thickness?: number;
	filterMode?: 'exact' | 'upTo';
	interpolate?: boolean | TimelineInterpolation<TRow>;
	/**
	 * Which position scales the steps share: `'shared'` (default), where x and y span every step's rows, so the axes hold still while scrubbing; `'free'`,
	 * which refits both to each step; or `'free-x'`/`'free-y'` to refit one and keep the other still.
	 */
	scales?: 'shared' | 'free' | 'free-x' | 'free-y';
};
