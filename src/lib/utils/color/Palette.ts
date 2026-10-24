import * as d3Chromatic from 'd3-scale-chromatic';
import { ColorRamp } from './ColorRamp';
import type { PaletteInput } from '$lib/types/configuration/styling';

/** `{dark2: [...], tableau10: [...], ...}`, from every flat `scheme*` color list d3-scale-chromatic exports. */
const DISCRETE_SCHEMES: Record<string, readonly string[]> = Object.fromEntries(
	Object.entries(d3Chromatic)
		.filter(
			(entry): entry is [string, readonly string[]] =>
				entry[0].startsWith('scheme') &&
				Array.isArray(entry[1]) &&
				entry[1].every((color) => typeof color === 'string')
		)
		.map(([name, colors]) => [name.slice('scheme'.length).toLowerCase(), colors])
);

/** The categorical palette of a configuration, as a list of colors. */
export class Palette {
	/** How many colors a palette named after a continuous ramp takes, unless it says. */
	static readonly COUNT = 8;

	/** The color at `index` of `palette`, cycling when the index runs past its end: the default color for an unstyled series. */
	static at(index: number, palette: string[]): string {
		if (palette.length === 0) return 'currentColor';
		return palette[index % palette.length];
	}

	/**
	 * `input` as a list of colors: a list as it is; a name as the d3-scale-chromatic color list of
	 * that name (`'dark2'`, `'tableau10'`...) or, for a ramp (`'viridis'`, `'blues'`...), colors spread
	 * evenly along it; `{ scheme, count, schemeRange }` the same with its own count and part of the ramp.
	 * `undefined` when the name is not one of those.
	 */
	static resolve(input: PaletteInput): string[] | undefined {
		if (Array.isArray(input)) return [...input];
		const { scheme, count, schemeRange } = typeof input === 'string' ? { scheme: input } : input;
		const name = scheme.toLowerCase();
		const list = DISCRETE_SCHEMES[name];
		if (list) return count === undefined ? [...list] : list.slice(0, count);
		const ramp = ColorRamp.NAMED[name];
		if (!ramp) return undefined;
		const [from, to] = schemeRange ?? [0, 1];
		const total = Math.max(1, count ?? Palette.COUNT);
		return Array.from({ length: total }, (_, index) =>
			ramp(from + (total > 1 ? index / (total - 1) : 0.5) * (to - from))
		);
	}

	/** `patch` with its `palette` resolved to a list of colors, or left out (with a warning) when it names no scheme. */
	static resolveIn<T extends { palette?: PaletteInput } & Record<string, unknown>>(
		patch: T
	): Omit<T, 'palette'> & { palette?: string[] } {
		const { palette, ...rest } = patch;
		if (palette === undefined) return rest;
		const colors = Palette.resolve(palette);
		if (!colors) {
			console.warn(
				`setConfiguration: palette ${JSON.stringify(palette)} is not a list of colors or a d3-scale-chromatic scheme name; the palette is left as it was.`
			);
			return rest;
		}
		return { ...rest, palette: colors };
	}
}
