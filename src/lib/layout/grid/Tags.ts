import type { ComposerTags } from '$lib/types/layout/composer';

const ROMAN: [number, string][] = [
	[10, 'X'],
	[9, 'IX'],
	[5, 'V'],
	[4, 'IV'],
	[1, 'I']
];

/** A sequence of tags - one per composer cell, in the order the cells register. */
export class Tags {
	readonly #tags: ComposerTags;

	constructor(tags: ComposerTags) {
		this.#tags = tags;
	}

	/** The `index`-th tag. */
	at(index: number): string | undefined {
		const tags = this.#tags;
		if (Array.isArray(tags)) return tags[index];
		if (tags === 'A') return String.fromCharCode(65 + (index % 26));
		if (tags === 'a') return String.fromCharCode(97 + (index % 26));
		if (tags === 'I') return Tags.#roman(index + 1);
		if (tags === 'i') return Tags.#roman(index + 1).toLowerCase();
		return String(index + 1);
	}

	static #roman(n: number): string {
		let out = '';
		for (const [value, numeral] of ROMAN) {
			while (n >= value) {
				out += numeral;
				n -= value;
			}
		}
		return out;
	}
}
