/**
 * How a number reads where this package writes one: a tooltip, a value label, a text or delta marker, an
 * axis' ticks. Each part is optional; what a place leaves unset takes the configuration's `numbers`
 * (only `decimals`), else the natural reading in `axis.locale`.
 */
export type NumberDisplay = {
	/** Exactly this many decimals (`1` writes `12` as `12,0`). Unset, the configuration's `numbers.decimals`, else as many as the number needs. */
	decimals?: number;
	/** Text before the number, spaces included (`'US$ '`). */
	prefix?: string;
	/** Text after the number, spaces included (`' %'`). */
	suffix?: string;
	/** The sign: `'auto'` (default) writes only a minus; `'always'` also writes a plus on a positive number - never on zero; `'never'` writes none. */
	signDisplay?: 'auto' | 'always' | 'never';
};
