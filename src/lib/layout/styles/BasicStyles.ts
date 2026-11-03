import type { BasicStylesConfig, BasicStylesShape, PerSeries } from '$lib/types/layout/styles';

/**
 * The style a plot draws every series with, out of its `styles.stroke`,
 * `styles.dot` and `styles.area`: the ones its kind's segment style is made of
 * (`shape`), each as it is or as a function of the series' name. The segments
 * of a series restyle a stretch of it over this.
 */
export class BasicStyles {
	/** The style of the series named `name`, or `undefined` when there is none to give. */
	static of<TStyle>(
		styles: BasicStylesConfig | undefined,
		shape: BasicStylesShape | undefined
	): ((seriesName: string) => TStyle | undefined) | undefined {
		if (!styles || !shape) return undefined;
		const keys = 'flat' in shape ? [shape.flat] : shape.nested;
		if (keys.every((key) => styles[key] === undefined)) return undefined;
		return (name) => {
			const picked = Object.fromEntries(
				keys.flatMap((key) => {
					const style = BasicStyles.read(styles[key] as PerSeries<object> | undefined, name);
					return style ? [[key, style]] : [];
				})
			);
			if (Object.keys(picked).length === 0) return undefined;
			return ('flat' in shape ? picked[shape.flat] : picked) as TStyle;
		};
	}

	/** A style as it is, or what its function says of the series named `name`; a function has nothing to say without a name. */
	static read<TStyle extends object>(
		style: PerSeries<TStyle> | undefined,
		name: string | undefined
	): TStyle | undefined {
		if (typeof style !== 'function') return style;
		return name === undefined ? undefined : style(name);
	}
}
