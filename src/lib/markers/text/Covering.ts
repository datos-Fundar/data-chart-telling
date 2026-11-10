import type { Box } from '$lib/layout/margins/Box';

/** A row's shape in pixels: its box, or the circle in it. */
type Shape = { box: Box; round?: boolean };

/** Which labels the shapes drawn after their own row cover, as a dot drawn over another hides that one's label. */
export class Covering {
	/** The indices of `labels` some shape of a later row meets; shapes and labels are in draw order, one per row. */
	static hidden(labels: Box[], shapes: (Shape | undefined)[]): Set<number> {
		const hidden = new Set<number>();
		labels.forEach((label, i) => {
			for (let j = i + 1; j < shapes.length; j++) {
				const shape = shapes[j];
				if (shape && Covering.#meets(shape, label)) {
					hidden.add(i);
					return;
				}
			}
		});
		return hidden;
	}

	static #meets({ box, round }: Shape, label: Box): boolean {
		if (!label.intersects(box)) return false;
		if (!round) return true;
		// The circle meets the label where the label's nearest point to its center is within its radius.
		const r = Math.min(box.width, box.height) / 2;
		const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
		const nx = Math.min(Math.max(cx, label.left), label.right);
		const ny = Math.min(Math.max(cy, label.top), label.bottom);
		return (nx - cx) ** 2 + (ny - cy) ** 2 < r * r;
	}
}
