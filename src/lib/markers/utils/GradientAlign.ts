const SVG_NS = 'http://www.w3.org/2000/svg';
const REF = /url\(\s*["']?#([^"')]+)["']?\s*\)/;
const CLONE = '--at-';
const PAINTS = ['fill', 'stroke'] as const;

/**
 * Keeps gradients that span the plot lined up with it on every shape that paints with them. A gradient in the
 * plot's units is read in the coordinates of the shape it paints, so a shape a mark moves into place with a
 * `transform` (svelteplot's bars, dots, ticks...) would see it moved along: each such shape is pointed at a copy
 * of the gradient that undoes its transform. Shapes are found again whenever the plot redraws.
 */
export class GradientAlign {
	/** An attachment for the `<defs>` that holds the gradients named `ids`. */
	static of(ids: readonly string[]) {
		return (defs: SVGDefsElement) => {
			const svg = defs.ownerSVGElement;
			const home = defs.parentNode as SVGGraphicsElement | null;
			if (!svg || !home || !ids.length) return;
			const own = new Set(ids);
			const copies = document.createElementNS(SVG_NS, 'defs');
			svg.appendChild(copies);

			let frame = 0;
			const align = () => {
				frame = 0;
				const base = home.getScreenCTM?.();
				if (!base) return;
				const toHome = base.inverse();
				const shapes = svg.querySelectorAll<SVGGraphicsElement>(
					'[style*="url("], [fill^="url("], [stroke^="url("]'
				);
				for (const shape of shapes) {
					for (const paint of PAINTS) {
						const fromStyle = shape.style.getPropertyValue(paint);
						const value = fromStyle || shape.getAttribute(paint) || '';
						const ref = REF.exec(value)?.[1];
						const id = ref?.split(CLONE)[0];
						if (!id || !own.has(id)) continue;
						const ctm = shape.getScreenCTM?.();
						if (!ctm) continue;
						const target = GradientAlign.#copyFor(defs, copies, id, toHome.multiply(ctm));
						if (target === ref) continue;
						if (fromStyle) shape.style.setProperty(paint, `url(#${target})`);
						else shape.setAttribute(paint, `url(#${target})`);
					}
				}
			};
			const schedule = () => {
				if (!frame) frame = requestAnimationFrame(align);
			};
			const observer = new MutationObserver(schedule);
			observer.observe(svg, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: ['style', 'fill', 'stroke', 'transform']
			});
			schedule();
			return () => {
				observer.disconnect();
				if (frame) cancelAnimationFrame(frame);
				copies.remove();
			};
		};
	}

	/** The gradient a shape moved by `moved` paints with: `id` itself when it is not moved, else a copy that undoes it. */
	static #copyFor(defs: Element, copies: Element, id: string, moved: DOMMatrix): string {
		const values = [moved.a, moved.b, moved.c, moved.d, moved.e, moved.f].map(
			(value) => Math.round(value * 100) / 100
		);
		const [a, b, c, d, e, f] = values;
		if (a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0) return id;
		const copyId = `${id}${CLONE}${values.join('_').replace(/-/g, 'm').replace(/\./g, 'p')}`;
		if (copies.querySelector(`[id="${copyId}"]`)) return copyId;
		const original = defs.querySelector(`[id="${id}"]`);
		if (!original) return id;
		const copy = original.cloneNode(true) as Element;
		copy.id = copyId;
		const undo = moved.inverse();
		copy.setAttribute(
			'gradientTransform',
			`matrix(${undo.a} ${undo.b} ${undo.c} ${undo.d} ${undo.e} ${undo.f})`
		);
		copies.appendChild(copy);
		return copyId;
	}
}
