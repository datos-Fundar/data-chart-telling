import {
	normalizeX,
	normalizeY,
	normalizeParallelX,
	normalizeParallelY,
	mapX,
	mapY
} from 'svelteplot';
import { POSITION_CHANNEL_KEYS } from '$lib/types/transforms/common';
import type { Row, TransformAdapter } from '$lib/types/phases/transforms/adapter';

/** Normalize and map transforms, by axis. */
export class NormalizeTransform {
	/**
	 * `run` over each of `axis`'s channels on its own, the rows of each run merged by their place: svelteplot's map
	 * adds every row once per channel it maps, so a marker with `y1` and `y2` would draw each of its rows twice.
	 */
	static #perChannel(axis: 'x' | 'y', run: (channels: Row, options: Row) => Row) {
		const keys = [axis, `${axis}1`, `${axis}2`];
		return (channels: Row, options: Row): Row => {
			const own = keys.filter((key) => channels[key] !== undefined);
			if (own.length <= 1) return run(channels, options);
			const rest = Object.fromEntries(
				Object.entries(channels).filter(([key]) => !keys.includes(key))
			);
			const runs = own.map((key) => ({
				key,
				out: run({ ...rest, [key]: channels[key] }, options)
			}));
			const [first] = runs;
			const rows = (first.out.data as Row[]).map((row, i) =>
				Object.assign(
					{ ...row },
					...runs.slice(1).map(({ key, out }) => {
						const other = (out.data as Row[])[i];
						return { [out[key] as string]: other[out[key] as string] };
					})
				)
			);
			return {
				...first.out,
				data: rows,
				...Object.fromEntries(runs.map(({ key, out }) => [key, out[key]]))
			};
		};
	}

	static readonly x: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: NormalizeTransform.#perChannel('x', normalizeX as never)
	};

	static readonly y: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		rowwise: 'y',
		run: NormalizeTransform.#perChannel('y', normalizeY as never)
	};

	static readonly parallelX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: normalizeParallelX as never
	};

	static readonly parallelY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: normalizeParallelY as never
	};

	// svelteplot takes the mapping itself as the second argument, not an options object.
	static readonly mapX: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		run: NormalizeTransform.#perChannel('x', (channels, options) =>
			mapX(channels as never, options.map as never)
		)
	};

	static readonly mapY: TransformAdapter = {
		channelKeys: POSITION_CHANNEL_KEYS,
		rowwise: 'y',
		run: NormalizeTransform.#perChannel('y', (channels, options) =>
			mapY(channels as never, options.map as never)
		)
	};
}
