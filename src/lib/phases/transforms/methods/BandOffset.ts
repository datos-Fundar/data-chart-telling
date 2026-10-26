import { resolveAccessor } from '$lib/utils/accessors';
import type { Row } from '$lib/types/phases/transforms/adapter';

/** The field a row carries its spot across its band under, in bands: what jitter and shift write on a category axis. */
export const BAND_OFFSET_FIELD = { x: '__bandOffsetX', y: '__bandOffsetY' } as const;

/**
 * Jitter and shift on a category axis. A category has no values in between, so
 * instead of moving it, each row gets a spot across its band, as a fraction of
 * the band from its middle, and the marks that read `bandOffsetX`/`bandOffsetY`
 * draw it there.
 */
export class BandOffset {
	/** Whether `channel` reads categories from `rows`: a value that is neither a number nor a date. */
	static isCategorical(rows: Row[] | undefined, channel: unknown): boolean {
		if (!rows?.length || channel == null || typeof channel === 'number') return false;
		const read = resolveAccessor(channel as never) as (row: Row) => unknown;
		const first = rows.map(read).find((v) => v != null);
		return first !== undefined && typeof first !== 'number' && !(first instanceof Date);
	}

	/**
	 * `channels` with `delta(row)` added to every row's spot along `axis`, on top
	 * of any spot an earlier transform gave it, and the prop that reads it.
	 */
	static add(channels: Row, axis: 'x' | 'y', delta: () => number): Row {
		const field = BAND_OFFSET_FIELD[axis];
		const data = (channels.data as Row[]).map((row) => ({
			...row,
			[field]: Number(row[field] ?? 0) + delta()
		}));
		return { ...channels, data, [axis === 'x' ? 'bandOffsetX' : 'bandOffsetY']: field };
	}

	/** Uniform noise of half-width `width`, or normal noise of deviation `std`, drawn from `source`. */
	static noise(
		options: { distribution?: unknown; width?: unknown; std?: unknown },
		source: () => number
	): () => number {
		if (options.distribution === 'normal') {
			const std = Number(options.std ?? 0.15);
			return () => std * Math.sqrt(-2 * Math.log(1 - source())) * Math.cos(2 * Math.PI * source());
		}
		const width = Number(options.width ?? 0.35);
		return () => (source() * 2 - 1) * width;
	}
}
