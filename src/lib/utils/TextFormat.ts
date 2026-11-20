import { TextFit } from '$lib/markers/text/TextFit';
import type { TextDisplay } from '$lib/types/layout/texts';

/** Texts as a {@link TextDisplay} writes them. */
export class TextFormat {
	/** Whether `display` asks for anything: when not, a text is left as it is. */
	static isSet(display: TextDisplay | undefined): boolean {
		return (
			display?.maxWidth !== undefined ||
			!!display?.prefix ||
			!!display?.suffix ||
			TextFormat.#swaps(display).length > 0
		);
	}

	/** `display`'s swaps as a list of pairs, in order. */
	static #swaps(display: TextDisplay | undefined): [string | RegExp, string][] {
		return Array.isArray(display?.replace)
			? display.replace
			: Object.entries(display?.replace ?? {});
	}

	/**
	 * A writer of texts as `display` asks - its swaps, then its prefix and suffix, then the cut to its `maxWidth`;
	 * `measure` is how wide a text writes, in px.
	 */
	static of(
		display: TextDisplay | undefined,
		measure: (text: string) => number
	): (text: string) => string {
		const width = display?.maxWidth;
		const rewrites =
			!!display?.prefix || !!display?.suffix || TextFormat.#swaps(display).length > 0;
		return (text) => {
			const written = rewrites && display ? TextFormat.rewrite(text, display) : text;
			return width === undefined ? written : TextFit.cut(written, width, measure);
		};
	}

	/** {@link TextFormat.of}, or `undefined` while nothing asks for it ({@link TextFormat.isSet}). */
	static maybe(
		display: TextDisplay | undefined,
		measure: (text: string) => number
	): ((text: string) => string) | undefined {
		return TextFormat.isSet(display) ? TextFormat.of(display, measure) : undefined;
	}

	/** `text` after `display`'s swaps, in order (each replaces every match), with its prefix and suffix around it. */
	static rewrite(text: string, display: TextDisplay): string {
		let result = text;
		for (const [pattern, replacement] of TextFormat.#swaps(display))
			result =
				typeof pattern === 'string'
					? result.replaceAll(pattern, () => replacement)
					: result.replace(
							pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`),
							replacement
						);
		return `${display.prefix ?? ''}${result}${display.suffix ?? ''}`;
	}

	/**
	 * The fields of `source` that are a {@link TextDisplay}'s, for a config that carries them beside its own: its
	 * swaps and its `maxWidth`. Not its `prefix` and `suffix`, which a place that writes numbers keeps around them.
	 */
	static displayOf(source: TextDisplay | boolean | undefined): TextDisplay {
		const own = typeof source === 'object' ? source : undefined;
		return { replace: own?.replace, maxWidth: own?.maxWidth };
	}
}
