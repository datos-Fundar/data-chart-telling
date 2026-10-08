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

export type TimelineConfig<TRow extends Record<string, unknown>> = {
  accessor: Accessor<TRow, TimeValue>;
  /** The scrubber's position, `0`-`1`. Inside a `PlotComposer` with its own `timeline`, the composer's wins and no scrubber draws here. */
  progress?: number;
  values?: TimeValue[];
  orientation?: Orientation;
  show?: boolean;
  thickness?: number;
  filterMode?: 'exact' | 'upTo';
  interpolate?: boolean | TimelineInterpolation<TRow>;
  /** `'shared'` (default): x and y span every step's rows, so the axes hold still while scrubbing; `'free'` refits them to each step. */
  scales?: 'shared' | 'free';
};
