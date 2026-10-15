import type { Snippet } from 'svelte';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { Accessor } from '$lib/types/plots/data/common';
import type { EasingName, EasingFn } from '$lib/types/misc/easing';

export type TimeValue = number;
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

/** How a timeline draws: a `'rule'` beside the plot, or a `'player'` bar in the chrome. */
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
  /** How the current step reads in the `'value'` control. Defaults to the step itself. */
  format?: (value: TimeValue) => string;
  onplay?: (playing: boolean) => void;
  onspeed?: (speed: number) => void;
  onloop?: (loop: boolean) => void;
};

/** What every timeline can tell its owner, whatever it draws as. */
export type TimelineCallbacks = {
  /** Called with the new position, `0`-`1`, whenever the player or the reader moves it. */
  onprogress?: (progress: number) => void;
  /** Called with the step the position lands on, when that step changes. */
  onvalue?: (value: TimeValue) => void;
};

export type TimelineConfig<TRow extends Record<string, unknown>> = TimelineCallbacks & {
  accessor: Accessor<TRow, TimeValue>;
  /** How it draws. Defaults to `'rule'`. */
  type?: TimelineType;
  /** The player bar's own options, when `type` is `'player'`. */
  player?: PlayerConfig;
  /**
   * The timeline's position, `0`-`1`. A `'player'` keeps its own position from
   * there on (see `onprogress`), until this changes. Inside a `PlotComposer`
   * with its own `timeline`, the composer's wins and nothing draws here.
   */
  progress?: number;
  values?: TimeValue[];
  /** Which way a `'rule'` runs. A `'player'` is always horizontal. */
  orientation?: Orientation;
  show?: boolean;
  thickness?: number;
  filterMode?: 'exact' | 'upTo';
  interpolate?: boolean | TimelineInterpolation<TRow>;
  /** `'shared'` (default): x and y span every step's rows, so the axes hold still while scrubbing; `'free'` refits them to each step. */
  scales?: 'shared' | 'free';
};
