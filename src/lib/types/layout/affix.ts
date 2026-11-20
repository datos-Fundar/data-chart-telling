/**
 * Text written around a label, spaces included: what a {@link NumberDisplay} and a {@link TextDisplay} share. Around
 * a number it is the number's own; around a legend item it is the item's label.
 */
export type Affix = {
	/** Text before it (`'US$ '`). */
	prefix?: string;
	/** Text after it (`' %'`). */
	suffix?: string;
};
