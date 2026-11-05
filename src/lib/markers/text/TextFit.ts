const ELLIPSIS = '…';

/** What a label is once it is fitted: the text to write, on as many lines as it takes, and the size to write it at. */
export type FittedText = { text: string; fontSize: number };

/** What a label is fitted to. */
export type TextFitOptions = {
	text: string;
	/** What to write instead when `text` does not fit even cut short: a value alone, say. Hidden if that does not fit either. */
	fallback?: string;
	/** The room the label has, in px. */
	width: number;
	height: number;
	/** The size the label is written at when it has the room for it. */
	fontSize: number;
	/** The smallest size it is written at, shrunk one px at a time down to it. */
	minFontSize: number;
	/** The height of a line, as a multiple of the font size. */
	lineHeight: number;
	/** How wide `text` writes at `fontSize`, in px. */
	measure: (text: string, fontSize: number) => number;
	/** The fewest letters of a text worth writing when it is cut short. */
	minLetters: number;
};

/**
 * How a label that may be too big for its box is written: a smaller size first; failing that the text cut short
 * with an ellipsis on its last line, at the smallest size; failing that its `fallback`; failing that nothing.
 */
export class TextFit {
	static fit(options: TextFitOptions): FittedText | undefined {
		const whole = TextFit.#shrunk(options.text, options);
		if (whole) return whole;
		const size = options.minFontSize;
		const lines = TextFit.wrap(
			options.text,
			TextFit.#room(options, size),
			true,
			options.minLetters,
			(t) => options.measure(t, size)
		);
		if (lines) return { text: lines.join('\n'), fontSize: size };
		return options.fallback === undefined ? undefined : TextFit.#shrunk(options.fallback, options);
	}

	/** `text` as it is, at the biggest size that holds it all: no cut, or `undefined` at none. */
	static #shrunk(text: string, options: TextFitOptions): FittedText | undefined {
		for (let size = options.fontSize; size >= options.minFontSize; size--) {
			const lines = TextFit.wrap(
				text,
				TextFit.#room(options, size),
				false,
				options.minLetters,
				(t) => options.measure(t, size)
			);
			if (lines) return { text: lines.join('\n'), fontSize: size };
		}
		return undefined;
	}

	/** How wide the lines are, and how many there are, at `size`. */
	static #room(options: TextFitOptions, size: number) {
		return {
			width: options.width,
			lines: Math.floor(options.height / (size * options.lineHeight))
		};
	}

	/**
	 * `text` on at most `room.lines` lines of `room.width`: whole words per line, a new line after each newline. With `cut`,
	 * what does not fit is cut short - the rest of the text on the last line, or a word wider than any line - with an
	 * ellipsis; without it, a text that does not fit comes to `undefined`, and so does one whose first line shows
	 * under `minLetters` letters.
	 */
	static wrap(
		text: string,
		room: { width: number; lines: number },
		cut: boolean,
		minLetters: number,
		measure: (text: string) => number
	): string[] | undefined {
		if (room.lines < 1) return undefined;
		const all: string[] = [];
		let overlong = false;
		for (const paragraph of text.split('\n')) {
			let line = '';
			for (const word of paragraph.split(/ +/).filter(Boolean)) {
				const next = line ? `${line} ${word}` : word;
				if (measure(next) <= room.width) {
					line = next;
					continue;
				}
				if (line) all.push(line);
				// A word wider than a line goes on one of its own.
				if (measure(word) > room.width) {
					overlong = true;
					all.push(word);
					line = '';
				} else {
					line = word;
				}
			}
			if (line) all.push(line);
		}
		if (!cut) return !overlong && all.length <= room.lines ? all : undefined;
		const lines = all.slice(0, room.lines);
		// The rest of the text goes on the last line, to be cut short there.
		if (all.length > room.lines) lines[room.lines - 1] = all.slice(room.lines - 1).join(' ');
		const written = lines.map((line) => TextFit.cut(line, room.width, measure));
		const first = written[0]?.replace(ELLIPSIS, '').replace(/\s/g, '') ?? '';
		return first.length >= minLetters ? written : undefined;
	}

	/** `text` as it fits `width`: as it is, or cut short with an ellipsis. */
	static cut(text: string, width: number, measure: (text: string) => number): string {
		if (measure(text) <= width) return text;
		let end = text.length;
		while (end > 0 && measure(`${text.slice(0, end).trimEnd()}${ELLIPSIS}`) > width) end--;
		return end > 0 ? `${text.slice(0, end).trimEnd()}${ELLIPSIS}` : '';
	}
}
