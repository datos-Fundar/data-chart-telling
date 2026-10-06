import type { Row, TransformAdapter } from './types';

/** The field a {@link perGroup} output row carries its group under, when `z` is a function. */
const GROUP_KEY = '__group_z';

/**
 * Runs a transform that ignores `z` once per `z` group, then joins the groups'
 * output rows back together. Each output row is tagged with its group — under
 * `z`'s own field, or {@link GROUP_KEY} for a function — since such a transform
 * may build its rows from scratch, without the source row's fields.
 */
export function perGroup(run: TransformAdapter['run']): TransformAdapter['run'] {
	return (channels, options) => {
		const { z, data, ...rest } = channels;
		const rows = (data as Row[] | undefined) ?? [];
		if (z == null || !rows.length) return run(channels, options);
		const read = typeof z === 'function' ? (z as (d: Row) => unknown) : (d: Row) => d[z as string];
		const key = typeof z === 'function' ? GROUP_KEY : (z as string);
		const groups = new Map<unknown, Row[]>();
		for (const row of rows) {
			const value = read(row);
			const group = groups.get(value);
			if (group) group.push(row);
			else groups.set(value, [row]);
		}
		const outputs = [...groups].map(([value, groupRows]) => {
			const out = run({ ...rest, data: groupRows }, options);
			return { out, value };
		});
		return {
			...outputs[0].out,
			data: outputs.flatMap(({ out, value }) =>
				((out.data as Row[]) ?? []).map((row) => ({ ...row, [key]: value }))
			),
			z: key
		};
	};
}
