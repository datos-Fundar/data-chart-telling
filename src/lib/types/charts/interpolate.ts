/** A named easing curve, or a custom `[0,1] → [0,1]` function. */
export type EasingName =
  | 'linear'
  | 'quadIn'
  | 'quadOut'
  | 'cubicIn'
  | 'cubicOut'
  | 'quartIn'
  | 'quartOut'
  | 'expoOut';

export type EasingFn = (t: number) => number;
