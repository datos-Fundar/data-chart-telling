import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { ARGENTINA_PROVINCES } from '$datasets/argentina-provinces';
import { USA_COUNTRY } from '$datasets/usa-country';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `coordinates.projection` picks the map projection. One story per supported
// projection - real world country boundaries (Natural Earth, 110m) render
// very differently depending on which one is active, which only reads
// clearly with genuinely global data.

const meta = {
	title: 'Plots/Map/GeoPlot/Coordinates/Projection',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		coordinates: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** No `coordinates.projection` - defaults to `'equal-earth'`, a good general-purpose choice with balanced area distortion. */
export const Default: Story = {
	args: {}
};

/** `'mercator'` - the classic web-map projection. Conformal (preserves shape/angles locally) but area grows sharply near the poles. */
export const Mercator: Story = {
	args: {
		coordinates: { projection: 'mercator' } satisfies CoordinatesConfig
	}
};

/** `'transverse-mercator'` - Mercator rotated 90°; conformal along a chosen meridian instead of the equator. */
export const TransverseMercator: Story = {
	args: {
		coordinates: { projection: 'transverse-mercator' } satisfies CoordinatesConfig
	}
};

/** `'equal-earth'` - equal-area, designed to look more natural than older equal-area projections (e.g. Gall-Peters). */
export const EqualEarth: Story = {
	args: {
		coordinates: { projection: 'equal-earth' } satisfies CoordinatesConfig
	}
};

/** `'equirectangular'` - simplest possible projection: longitude/latitude mapped directly to x/y. Heavily distorted away from the equator. */
export const Equirectangular: Story = {
	args: {
		coordinates: { projection: 'equirectangular' } satisfies CoordinatesConfig
	}
};

/** `'orthographic'` - a view of the globe as if seen from space; pairs well with a `sphere` marker (see Markers/Graticule) for the outer globe outline. */
export const Orthographic: Story = {
	args: {
		coordinates: { projection: 'orthographic' } satisfies CoordinatesConfig
	}
};

/** `'orthographic'` rotated to center on South America via `rotate` - `[λ, φ, γ]` in degrees (negative longitude rotates eastward). */
export const OrthographicRotated: Story = {
	args: {
		coordinates: {
			projection: { type: 'orthographic', rotate: [60, 20] }
		} satisfies CoordinatesConfig
	}
};

/** `'stereographic'` - conformal azimuthal projection, commonly used for polar maps. */
export const Stereographic: Story = {
	args: {
		coordinates: { projection: 'stereographic' } satisfies CoordinatesConfig
	}
};

/** `'gnomonic'` - every great circle appears as a straight line; used for radio/navigation charts. Cannot show a full hemisphere. */
export const Gnomonic: Story = {
	args: {
		coordinates: { projection: 'gnomonic' } satisfies CoordinatesConfig
	}
};

/** `'azimuthal-equal-area'` - equal-area azimuthal projection, useful for polar or regional equal-area maps. */
export const AzimuthalEqualArea: Story = {
	args: {
		coordinates: { projection: 'azimuthal-equal-area' } satisfies CoordinatesConfig
	}
};

/** `'azimuthal-equidistant'` - distances from the center point are shown at true scale; a polar view of it is the basis of the United Nations emblem (see `AzimuthalEquidistantUnitedNationsEmblem`). */
export const AzimuthalEquidistant: Story = {
	args: {
		coordinates: {
			projection: { type: 'azimuthal-equidistant', rotate: [0, -90] }
		} satisfies CoordinatesConfig
	}
};

/**
 * The same `'azimuthal-equidistant'` projection, set up to approximate the
 * United Nations emblem: `rotate: [0, -90]` moves the North Pole to the
 * projection's center (the emblem is a polar view), and `clip` trims it
 * short of Antarctica.
 */
export const AzimuthalEquidistantUnitedNationsEmblem: Story = {
	args: {
		coordinates: {
			projection: { type: 'azimuthal-equidistant', rotate: [0, -90], clip: 148 }
		} satisfies CoordinatesConfig,
		markers: [
			{ type: 'graticule', styles: { stroke: '#94a3b8', strokeOpacity: 0.6 } }
		] satisfies GeoMarkersConfig[]
	}
};

/** `'conic-conformal'` - a conic projection that preserves local angles; good for regions spanning a wide east-west extent at similar latitudes. */
export const ConicConformal: Story = {
	args: {
		coordinates: { projection: 'conic-conformal' } satisfies CoordinatesConfig
	}
};

/** `'conic-equal-area'` - the conic family's equal-area member; a common choice for national/continental thematic maps. */
export const ConicEqualArea: Story = {
	args: {
		coordinates: { projection: 'conic-equal-area' } satisfies CoordinatesConfig
	}
};

/** `'conic-equidistant'` - meridians are equally spaced along parallels; a middle ground between the conformal and equal-area conic variants. */
export const ConicEquidistant: Story = {
	args: {
		coordinates: { projection: 'conic-equidistant' } satisfies CoordinatesConfig
	}
};

/**
 * `'albers-usa'` - a composite projection built specifically for the United
 * States (mainland + insets for Alaska/Hawaii). It assigns Alaska/Hawaii to
 * their inset boxes using a coordinate-range heuristic rather than real
 * country identity, so it only renders correctly when fed USA-only geometry
 * - mixing in other countries (e.g. Mexico, from the `WORLD_COUNTRIES`
 * fixture used elsewhere on this page) can fall into that same heuristic and
 * render in the wrong place. `USA_COUNTRY` is scoped to just the US for
 * exactly that reason.
 */
export const AlbersUsa: Story = {
	args: {
		data: USA_COUNTRY,
		coordinates: { projection: 'albers-usa' } satisfies CoordinatesConfig
	}
};

/** `'albers'` - the (non-composite) conic equal-area projection `albers-usa` is built on top of; usable for any mid-latitude region, not just the US. */
export const Albers: Story = {
	args: {
		coordinates: { projection: 'albers' } satisfies CoordinatesConfig
	}
};

/**
 * A custom projection (not one of svelteplot's built-ins) - `coordinates.projection.type`
 * also accepts a factory function, see `$lib/layout/coordinates/projections/argentina.ts`.
 * `argentinaBicontinental` is an azimuthal-equidistant projection rotated and
 * self-fit to Argentina's full territorial claim (mainland + the Antarctic
 * sector + South Atlantic islands) via a handful of hand-picked extremity
 * points, so it needs no `domain`/`rotate` from the story itself - pass any
 * data that fits within that extent and it's already framed.
 */
export const ArgentinaBicontinental: Story = {
	args: {
		data: ARGENTINA_PROVINCES,
		coordinates: {
			projection: { type: argentinaBicontinental }
		} satisfies CoordinatesConfig
	}
};

/**
 * `'identity'` - no projection at all; longitude/latitude pass straight
 * through as plot x/y, so unlike every other projection here it has no
 * scale/translate of its own to size itself to the frame. `domain: 'data'`
 * fits it to whatever was already passed to `data` (see `ReflectY` for the
 * same mechanism) - without it, the map renders at a literal 1 pixel per
 * degree, tiny and stuck in a corner of the frame.
 */
export const Identity: Story = {
	args: {
		coordinates: {
			projection: { type: 'identity', domain: 'data' }
		} satisfies CoordinatesConfig
	}
};

/**
 * `'reflect-y'` - like `identity`, but flips the y axis; handy for planar
 * data whose source uses screen-style (y-down) coordinates. Also needs
 * `domain: 'data'` to size itself to the frame, for the same reason as
 * `identity`.
 */
export const ReflectY: Story = {
	args: {
		coordinates: {
			projection: { type: 'reflect-y', domain: 'data' }
		} satisfies CoordinatesConfig
	}
};
