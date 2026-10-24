import type { RowOffset as RowOffsetConfig } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';

type Offsets = { dx?: RowOffsetConfig; dy?: RowOffsetConfig };
type Pixels = { dx: number; dy: number };

/**
 * A marker's `dx`/`dy`: numbers move the whole marker (drawn once by
 * `MarkerOffset`), functions move each row (drawn by the marker itself, with
 * `RowOffsetMarks`), so no part is applied twice.
 */
export class RowOffset {
	/** The numeric part, for the whole marker; a part left unset takes `fallback`, a function counts as none. */
	static whole(marker: Offsets, fallback: Pixels = { dx: 0, dy: 0 }): Pixels {
		const part = (own: RowOffsetConfig | undefined, otherwise: number) =>
			typeof own === 'function' ? 0 : (own ?? otherwise);
		return { dx: part(marker.dx, fallback.dx), dy: part(marker.dy, fallback.dy) };
	}

	/** Whether any part of the offset is a function of the row. */
	static isPerRow(marker: Offsets): boolean {
		return typeof marker.dx === 'function' || typeof marker.dy === 'function';
	}

	/** The functional part, for one row. */
	static ofRow(marker: Offsets, row: unknown): Pixels {
		return {
			dx: typeof marker.dx === 'function' ? (marker.dx(row) ?? 0) : 0,
			dy: typeof marker.dy === 'function' ? (marker.dy(row) ?? 0) : 0
		};
	}
}
