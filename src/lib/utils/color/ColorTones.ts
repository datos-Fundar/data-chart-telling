import { interpolateLab, interpolateRgb } from 'd3-interpolate';
import { CssColor } from './CssColor';

/**
 * Tones of a color, and the colors of a hierarchy made of them: each outermost value keeps its categorical
 * color, and the values under it take tones of it, so the parts of one group read as one family. For any plot
 * whose rows nest (a treemap, an icicle, a sunburst, a map of the votes of several parties).
 */
export class ColorTones {
	/** How far the lightest tone goes from the color toward white. */
	static readonly LIGHTEST = 0.6;

	/** `count` tones of `color`: the color itself first, then lighter ones; a single one is the color itself. */
	static of(color: string, count: number): string[] {
		const base = CssColor.resolve(color);
		if (count <= 1) return count === 1 ? [base] : [];
		const ramp = interpolateLab(base, interpolateRgb(base, '#fff')(ColorTones.LIGHTEST));
		return Array.from({ length: count }, (_, i) => (i === 0 ? base : ramp(i / (count - 1))));
	}

	/**
	 * The color of every path of a hierarchy, its levels outermost first, colored down to level `depth`: the
	 * outermost value takes the color `colorOf` gives it, and each distinct path down to `depth` under it a
	 * tone of that color - the first of them the color itself - siblings next to each other in the order they
	 * first appear. `depth` 1 is the
	 * outermost color alone; a path shorter than `depth` is colored by all of it.
	 */
	static hierarchy(
		paths: readonly (readonly string[])[],
		depth: number,
		colorOf: (outermost: string) => string
	): (path: readonly string[]) => string {
		const keyOf = (path: readonly string[]) =>
			JSON.stringify(path.slice(0, Math.max(1, Math.floor(depth))));
		if (depth <= 1) return (path) => colorOf(path[0]);

		// Where each partial path first appears, so siblings sort together and in the data's own order.
		const first = new Map<string, number>();
		const prefixes = new Map<string, readonly string[]>();
		for (const path of paths) {
			const own = JSON.parse(keyOf(path)) as string[];
			own.forEach((_, i) => {
				const partial = JSON.stringify(own.slice(0, i + 1));
				if (!first.has(partial)) first.set(partial, first.size);
			});
			prefixes.set(keyOf(path), own);
		}
		const rank = (path: readonly string[]) =>
			path.map((_, i) => first.get(JSON.stringify(path.slice(0, i + 1))) ?? 0);
		const byOutermost = new Map<string, (readonly string[])[]>();
		for (const prefix of prefixes.values()) {
			const group = byOutermost.get(prefix[0]) ?? [];
			group.push(prefix);
			byOutermost.set(prefix[0], group);
		}
		const colors = new Map<string, string>();
		for (const [outermost, group] of byOutermost) {
			group.sort((a, b) => {
				const [ra, rb] = [rank(a), rank(b)];
				for (let i = 0; i < Math.max(ra.length, rb.length); i++) {
					if ((ra[i] ?? -1) !== (rb[i] ?? -1)) return (ra[i] ?? -1) - (rb[i] ?? -1);
				}
				return 0;
			});
			const tones = ColorTones.of(colorOf(outermost), group.length);
			group.forEach((prefix, i) => colors.set(JSON.stringify(prefix), tones[i]));
		}
		return (path) => colors.get(keyOf(path)) ?? colorOf(path[0]);
	}
}
