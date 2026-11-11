import { ValueSelection } from '$lib/phases/transforms/ValueSelection';
import type { TextMarkerConfig } from '$lib/types/markers/basic/text';
import type { BoxScales } from '$lib/types/markers/labels/box';
import type { PointGeometryOf, PointLabelConfig, PointSide } from '$lib/types/markers/labels/point';
import type { LineAnchor, TextAnchor } from '$lib/types/plots/constants';
import type { ProcessedRow } from '$lib/types/phases';

const read =
	(channel: unknown) =>
	(row: unknown): unknown =>
		typeof channel === 'function'
			? (channel as (row: unknown) => unknown)(row)
			: typeof channel === 'string' || typeof channel === 'symbol'
				? (row as Record<string | symbol, unknown>)?.[channel]
				: channel;

const placed = (value: unknown) =>
	value !== null && value !== undefined && !(typeof value === 'number' && Number.isNaN(value));

/** The `text` marker that writes a `'point'` label beside the points it selects. */
export class PointLayout {
	static build(
		label: PointLabelConfig,
		point: PointGeometryOf,
		rows: unknown[],
		plot: { grouping?: unknown; valueAxis?: 'x' | 'y'; gap?: number } = {}
	): TextMarkerConfig | undefined {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { layout, select, anchor, side, gap, ...text } = label;
		const [x, y] = [read(point.x), read(point.y)];
		const placeable = rows.filter((row) => placed(x(row)) && placed(y(row)));
		const data =
			select === undefined
				? placeable
				: typeof select === 'function'
					? placeable.filter(select)
					: ValueSelection.pick(
							placeable as ProcessedRow[],
							ValueSelection.transforms(select, undefined, plot.valueAxis ?? 'y'),
							{ x, y, group: plot.grouping ?? (() => 0) }
						);
		if (data.length === 0) return undefined;
		const onBox =
			point.size && anchor && anchor !== 'middle'
				? PointLayout.#onBox(text, point.size, anchor, gap ?? plot.gap ?? 4)
				: side
					? { styles: { ...PointLayout.sideOf(side, gap), ...PointLayout.#defined(text.styles) } }
					: {};
		// A label on its own point is read in its shape: one drawn over it hides it.
		const { size, round } = point;
		const onPoint =
			!(size && anchor && anchor !== 'middle') && (side === undefined || side === 'on');
		const covers =
			onPoint && size
				? (row: unknown, scales: BoxScales) => {
						const shape = size(row, scales);
						return shape && { ...shape, round };
					}
				: undefined;
		// A point shifted off its `x`/`y` (a series' slot of its band) carries its label, and its anchor's offset, along.
		const anchored = (onBox as { origin?: TextMarkerConfig['origin'] }).origin;
		const origin =
			point.shift &&
			((row: unknown, scales: BoxScales) => {
				const shift = point.shift!(row, scales) ?? { dx: 0, dy: 0 };
				const own = anchored?.(row, scales) ?? { dx: 0, dy: 0 };
				return { dx: shift.dx + own.dx, dy: shift.dy + own.dy };
			});
		return {
			...text,
			...onBox,
			...(origin ? { origin } : {}),
			...(covers ? { covers } : {}),
			type: 'text',
			data,
			x: point.x,
			y: point.y
		} as TextMarkerConfig;
	}

	static #defined(styles: object | undefined): object {
		return Object.fromEntries(
			Object.entries(styles ?? {}).filter(([, value]) => value !== undefined)
		);
	}

	/** The offset and anchors that write a label on `side` of its point, `gap` from it. */
	static sideOf(
		side: PointSide,
		gap?: number
	): { dx: number; dy: number; textAnchor: TextAnchor; lineAnchor: LineAnchor } {
		const across = gap ?? 6;
		const along = gap ?? 8;
		switch (side) {
			case 'after':
				return { dx: across, dy: 0, textAnchor: 'start', lineAnchor: 'middle' };
			case 'before':
				return { dx: -across, dy: 0, textAnchor: 'end', lineAnchor: 'middle' };
			case 'above':
				return { dx: 0, dy: -along, textAnchor: 'middle', lineAnchor: 'bottom' };
			case 'below':
				return { dx: 0, dy: along, textAnchor: 'middle', lineAnchor: 'top' };
			default:
				return { dx: 0, dy: 0, textAnchor: 'middle', lineAnchor: 'middle' };
		}
	}

	/** Starts each label at `anchor` on its box, written away from it. */
	static #onBox(
		text: Partial<TextMarkerConfig>,
		size: NonNullable<PointGeometryOf['size']>,
		anchor: NonNullable<PointLabelConfig['anchor']>,
		gap: number
	): Partial<TextMarkerConfig> {
		const horizontal = anchor.endsWith('left') ? -1 : anchor.endsWith('right') ? 1 : 0;
		const vertical = anchor.startsWith('top') ? -1 : anchor.startsWith('bottom') ? 1 : 0;
		const styles = text.styles ?? {};
		return {
			origin: (row: unknown, scales: BoxScales) => {
				const box = size(row, scales);
				return box && { dx: (horizontal * box.width) / 2, dy: (vertical * box.height) / 2 };
			},
			styles: {
				...styles,
				dx: styles.dx ?? horizontal * gap,
				dy: styles.dy ?? vertical * gap,
				textAnchor: styles.textAnchor ?? (['end', 'middle', 'start'] as const)[horizontal + 1],
				lineAnchor: styles.lineAnchor ?? (['bottom', 'middle', 'top'] as const)[vertical + 1]
			}
		};
	}
}
