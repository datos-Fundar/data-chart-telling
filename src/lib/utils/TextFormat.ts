import { TextFit } from '$lib/markers/text/TextFit';
import type { TextDisplay } from '$lib/types/layout/texts';

/** Texts as a {@link TextDisplay} writes them. */
export class TextFormat {
	/** Whether `display` asks for anything: when not, a text is left as it is. */
	static isSet(display: TextDisplay | undefined): boolean {
		return display?.maxWidth !== undefined;
	}

	/** A writer of texts as `display` asks; `measure` is how wide a text writes, in px. */
	static of(
		display: TextDisplay | undefined,
		measure: (text: string) => number
	): (text: string) => string {
		const width = display?.maxWidth;
		return width === undefined ? (text) => text : (text) => TextFit.cut(text, width, measure);
	}

	/** {@link TextFormat.of}, or `undefined` while nothing asks for it ({@link TextFormat.isSet}). */
	static maybe(
		display: TextDisplay | undefined,
		measure: (text: string) => number
	): ((text: string) => string) | undefined {
		return TextFormat.isSet(display) ? TextFormat.of(display, measure) : undefined;
	}

	/** The fields of `source` that are a {@link TextDisplay}'s, for a config that carries them beside its own. */
	static displayOf(source: TextDisplay | boolean | undefined): TextDisplay {
		const own = typeof source === 'object' ? source : undefined;
		return { maxWidth: own?.maxWidth };
	}
}
