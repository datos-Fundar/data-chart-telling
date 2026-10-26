/** The box drawn over another distribution's marks: its width and which of its parts show. */
export type InnerBoxStyle = {
	/** Width in pixels. */
	width?: number;
	/** The box itself, from the first to the third quartile. Defaults to `true`. */
	quartiles?: boolean;
	/** The tick at the median. Defaults to `true`. */
	median?: boolean;
	/** The lines out to the whisker ends. Defaults to `true`. */
	whiskers?: boolean;
	/** The ticks closing each whisker. Defaults to `false`. */
	caps?: boolean;
	/** A dot per value past the whiskers. Defaults to `false`. */
	outliers?: boolean;
};

/** A plot's `styles.box`: `false` leaves the box out, a number sets its width in pixels, an object picks its parts. */
export type InnerBoxOption = boolean | number | InnerBoxStyle;
