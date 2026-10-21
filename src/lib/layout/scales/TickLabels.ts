import { Box } from '$lib/layout/margins/Box';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';

/** How a category axis lays its tick labels out: the angle they stand at, and which of them are written. */
export type TickLayout = {
	/** `0`, `-45` or `-90` degrees. */
	rotate: 0 | -45 | -90;
	/** Every how-manieth label is written: `1` writes them all. */
	every: number;
	/** The widest label, in px, as it is written - not wrapped, when it is rotated. */
	width: number;
};

/**
 * Where the tick labels of a category axis fit. Written flat they wrap at their
 * spaces to the width of their band - a word is never split - and stand side by
 * side as long as the widest line is narrower than the step between categories.
 * Otherwise they turn: at 45 degrees a label needs a step of about one and a
 * half lines of text, at 90 degrees of one; past that, only every few labels
 * are written.
 */
export class TickLabels {
	/** The gap, in px, kept between neighbouring labels. */
	static readonly GAP = 6;

	/**
	 * The layout of `labels` along an axis `span` px long - the categories
	 * `bandPadding` (0-1) apart - written at `fontSize`.
	 */
	static layout(
		labels: readonly string[],
		span: number,
		bandPadding: number,
		fontSize: number,
		cfg: Pick<PlotStylesConfig, 'font'>
	): TickLayout {
		const count = labels.length;
		const measure = (text: string) => Box.ofText(text, fontSize, cfg).width;
		const lineHeight = fontSize * 1.2;
		const whole = Math.max(0, ...labels.map(measure));
		const flat: TickLayout = { rotate: 0, every: 1, width: whole };
		if (count < 2 || span <= 0 || whole === 0) return flat;

		const step = span / count;
		const room = step - TickLabels.GAP;
		// What a flat label measures once wrapped to its band, as the axis does.
		const maxLine = step * (1 - bandPadding) * 0.9;
		const wrapped = Math.max(
			0,
			...labels.map((label) => {
				const text = measure(label);
				if (text <= maxLine) return text;
				const words = Math.max(0, ...label.split(/\s+/).map(measure));
				return Math.max(words, maxLine);
			})
		);
		if (wrapped <= room) return { ...flat, width: wrapped };
		// Turned, a label stands as wide as a line of text across its step.
		if (room >= lineHeight / Math.sin(Math.PI / 4)) return { rotate: -45, every: 1, width: whole };
		if (room >= lineHeight) return { rotate: -90, every: 1, width: whole };
		return { rotate: -90, every: Math.ceil(lineHeight / Math.max(1, room)), width: whole };
	}

	/**
	 * The layout of a category axis running down the plot, whose labels stand
	 * flat in a row each: only how many can be written.
	 */
	static rows(count: number, span: number, fontSize: number): number {
		if (count < 2 || span <= 0) return 1;
		const row = span / count;
		return Math.max(1, Math.ceil((fontSize * 1.2 + 2) / row));
	}
}
