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
