/** What a `tickFormat` returns for one tick, as the lines it is written on. */
export class TickLines {
	/** The lines of `label`: a list as it is, a text split at its line breaks. */
	static of(label: string | string[]): string[] {
		return Array.isArray(label) ? label : String(label).split('\n');
	}

	/** The lines of every tick of `ticks` under `format`. */
	static ofTicks(
		ticks: unknown[],
		format: (d: unknown, index: number, ticks: unknown[]) => string | string[]
	): string[][] {
		return ticks.map((tick, i) => TickLines.of(format(tick, i, ticks)));
	}

	/**
	 * `label` on up to `lines` lines, split at its spaces so that the longest line is as short as it can be
	 * (ties go to the earlier break). A label of one word, or `lines` below 2, stays on one line.
	 */
	static split(label: string, lines: number): string[] {
		const words = label.split(' ').filter((word) => word !== '');
		const count = Math.min(Math.floor(lines), words.length);
		if (count < 2) return [label];
		const width = (from: number, to: number) =>
			words.slice(from, to).reduce((sum, word) => sum + word.length, 0) + (to - from - 1);
		// best[k][i]: the shortest the longest line can be when the first i words take k lines, and where the last begins.
		const best: { cost: number; from: number }[][] = Array.from({ length: count + 1 }, () => []);
		for (let i = 1; i <= words.length; i++) best[1][i] = { cost: width(0, i), from: 0 };
		for (let k = 2; k <= count; k++) {
			for (let i = k; i <= words.length; i++) {
				let choice = { cost: Infinity, from: k - 1 };
				for (let from = k - 1; from < i; from++) {
					const cost = Math.max(best[k - 1][from].cost, width(from, i));
					if (cost < choice.cost) choice = { cost, from };
				}
				best[k][i] = choice;
			}
		}
		const out: string[] = [];
		for (let k = count, end = words.length; k >= 1; k--) {
			const { from } = best[k][end];
			out.unshift(words.slice(from, end).join(' '));
			end = from;
		}
		return out;
	}

	/**
	 * A `tickFormat` that gives the lines of its tick: `format`'s text (or the tick as it is, with none) split in
	 * `lines`, and a list `format` gives as it is.
	 */
	static wrapped(
		format: ((d: unknown, index: number, ticks: unknown[]) => string | string[]) | undefined,
		lines: number
	): (d: unknown, index: number, ticks: unknown[]) => string[] {
		return (d, index, ticks) => {
			const text = format ? format(d, index, ticks) : String(d);
			return Array.isArray(text) ? text : TickLines.split(text, lines);
		};
	}

	/** Whether some tick needs more than one line. */
	static isMultiline(lines: string[][]): boolean {
		return lines.some((tick) => tick.length > 1);
	}
}
