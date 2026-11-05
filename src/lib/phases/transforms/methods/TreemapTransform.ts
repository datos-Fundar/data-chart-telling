import {
	hierarchy,
	treemap,
	treemapBinary,
	treemapDice,
	treemapSlice,
	treemapSliceDice,
	treemapSquarify
} from 'd3-hierarchy';
import { resolveAccessor } from '$lib/utils/accessors';
import { TREEMAP_CHANNEL_KEYS, type TreemapTile } from '$lib/types/transforms/treemap';
import type { Row, TransformAdapter } from '$lib/types/phases/transforms/adapter';

const TILES = {
	squarify: treemapSquarify,
	binary: treemapBinary,
	slice: treemapSlice,
	dice: treemapDice,
	sliceDice: treemapSliceDice
} as const;

/** What a treemap leaves on each row it produces, and the channels it reads them back by. */
export const TREEMAP_ROW = {
	/** The tile's name: the value at its last level. */
	name: Symbol('treemap.name'),
	/** The value at every level of the tile, outermost first. */
	path: Symbol('treemap.path'),
	/** The tile's summed `value`. */
	value: Symbol('treemap.value'),
	/** The tile's part of the whole, from `0` to `1`. */
	share: Symbol('treemap.share'),
	x1: Symbol('treemap.x1'),
	x2: Symbol('treemap.x2'),
	y1: Symbol('treemap.y1'),
	y2: Symbol('treemap.y2'),
	x: Symbol('treemap.x'),
	y: Symbol('treemap.y')
} as const;

type Node = { name: string; path: string[]; rows: Row[]; value?: number; children?: Node[] };
type Placed = { x0: number; x1: number; y0: number; y1: number };

const read = (channel: unknown): ((row: Row) => unknown) =>
	typeof channel === 'function'
		? (channel as (row: Row) => unknown)
		: (row) => row[channel as string];

/** A treemap as a transform: the layout of d3-hierarchy, in the shape every other transform returns. */
export class TreemapTransform {
	static readonly adapter: TransformAdapter = {
		channelKeys: TREEMAP_CHANNEL_KEYS,
		run: (channels, options) => TreemapTransform.layout(channels, options)
	};

	/**
	 * A row per tile of `channels.data`, biggest first within its group, placed in the unit square. A row whose
	 * value is not a positive number has no area, so it makes no tile. The layout is `aspect` wide while it is
	 * computed and scaled back after, so its tiles are shaped after the box they fill.
	 */
	static layout(channels: Row, options: Row): Row {
		const { data, value, ...rest } = channels as { data?: Row[]; value?: unknown } & Row;
		if (!data) throw new Error('treemap: missing data');
		if (value === undefined) throw new Error('treemap: missing value channel');
		const size = read(value);
		const levels = ((options.levels as unknown[] | undefined) ?? []).map(
			(level) => resolveAccessor(level as never) as (row: Row) => unknown
		);
		const tile = (options.tile as TreemapTile | undefined) ?? 'squarify';
		const aspect = Number(options.aspect);
		const width = aspect > 0 && Number.isFinite(aspect) ? aspect : 1;

		const root: Node = { name: '', path: [], rows: [], children: [] };
		const nodes = new Map<string, Node>();
		const nodeOf = (path: string[]): Node => {
			let parent = root;
			for (let depth = 1; depth <= path.length; depth++) {
				const key = JSON.stringify(path.slice(0, depth));
				let node = nodes.get(key);
				if (!node) {
					node = { name: path[depth - 1], path: path.slice(0, depth), rows: [], children: [] };
					nodes.set(key, node);
					parent.children!.push(node);
				}
				parent = node;
			}
			return parent;
		};
		for (const row of data) {
			const area = Number(size(row));
			if (!(Number.isFinite(area) && area > 0)) continue;
			const leaf = nodeOf(levels.map((level) => String(level(row))));
			leaf.rows.push(row);
			leaf.value = (leaf.value ?? 0) + area;
		}

		const tiles: Row[] = [];
		if (root.children!.length > 0 || root.value !== undefined) {
			const tree = hierarchy(root, (node) => (node.children?.length ? node.children : null))
				.sum((node) => node.value ?? 0)
				.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
			const total = tree.value ?? 0;
			treemap<Node>().size([width, 1]).tile(TILES[tile]).round(false)(tree);
			for (const leaf of tree.leaves()) {
				const at = leaf as typeof leaf & Placed;
				const { rows, path, name } = leaf.data;
				const sum = leaf.value ?? 0;
				const first = rows[0];
				const x1 = at.x0 / width;
				const x2 = at.x1 / width;
				tiles.push({
					...first,
					// A string `value` names the field the tile's sum reads back from.
					...(typeof value === 'string' ? { [value]: sum } : {}),
					[TREEMAP_ROW.name]: name,
					[TREEMAP_ROW.path]: path,
					[TREEMAP_ROW.value]: sum,
					[TREEMAP_ROW.share]: total > 0 ? sum / total : 0,
					[TREEMAP_ROW.x1]: x1,
					[TREEMAP_ROW.x2]: x2,
					[TREEMAP_ROW.y1]: at.y0,
					[TREEMAP_ROW.y2]: at.y1,
					[TREEMAP_ROW.x]: (x1 + x2) / 2,
					[TREEMAP_ROW.y]: (at.y0 + at.y1) / 2
				});
			}
		}
		return {
			...rest,
			data: tiles,
			x: TREEMAP_ROW.x,
			x1: TREEMAP_ROW.x1,
			x2: TREEMAP_ROW.x2,
			y: TREEMAP_ROW.y,
			y1: TREEMAP_ROW.y1,
			y2: TREEMAP_ROW.y2
		};
	}
}
