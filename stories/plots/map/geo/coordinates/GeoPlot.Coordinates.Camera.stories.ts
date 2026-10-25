import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
import { WORLD_COUNTRIES } from '$datasets/world-countries';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `coordinates.camera` is GeoPlot's declarative "current viewpoint": a
// `target` (`features`, `center`, or `bounds`) it frames/zooms/anchors to.
// Animated transitions live in `Coordinates/CameraTransition`.

const meta = {
	title: 'Plots/Map/GeoPlot/Coordinates/Camera',
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

/** Frame + fit a set of features by id - same id space as `segments`/`featureId`. */
export const FitToFeatures: Story = {
	args: {
		coordinates: {
			camera: {
				target: { features: ['Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Bolivia'] },
				padding: 32
			}
		} satisfies CoordinatesConfig
	}
};

/** `zoom` as a multiplier on the auto-fit scale. */
export const FitWithZoom: Story = {
	args: {
		coordinates: {
			camera: {
				target: { features: ['Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Bolivia'] },
				zoom: 2,
				padding: 32
			}
		} satisfies CoordinatesConfig
	}
};

/** `anchor: 'bottom-right'` pushes the framed target toward that corner instead of centering it. */
export const AnchorBottomRight: Story = {
	args: {
		coordinates: {
			camera: {
				target: { features: ['Argentina', 'Chile', 'Uruguay', 'Paraguay', 'Bolivia'] },
				anchor: 'bottom-right',
				padding: 32
			}
		} satisfies CoordinatesConfig
	}
};

/** An explicit `center` point instead of `features`/`bounds` - no extent to fit, so `zoom` is used directly as the pixel scale. */
export const ExplicitCenter: Story = {
	args: {
		coordinates: {
			camera: {
				target: { center: [-58.4, -34.6] }, // Buenos Aires
				zoom: 6
			}
		} satisfies CoordinatesConfig
	}
};

/** The same `features` target on an `orthographic` globe - centering rotates the sphere instead of panning pixels. */
export const OrthographicFit: Story = {
	args: {
		coordinates: {
			projection: 'orthographic',
			camera: {
				target: { features: ['Japan'] },
				zoom: 1
			}
		} satisfies CoordinatesConfig
	}
};
