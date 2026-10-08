import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

// Values spanning hundreds of billions to over a trillion, so every test
// below renders compact regardless of locale - only the wording differs.
const HIGH_VALUE_SERIES = [
  {
    name: 'amount',
    x: 'region' as const,
    y: 'value' as const,
    data: [
      { region: 'A', value: 200_000_000_000 },
      { region: 'B', value: 800_000_000_000 },
      { region: 'C', value: 1_400_000_000_000 },
    ],
  },
];

async function renderYTicks(): Promise<string[]> {
  const { container } = await render(BarPlot, { width: 400, height: 300, series: HIGH_VALUE_SERIES });
  const svg = await waitForSvg(container);
  return Array.from(svg.querySelectorAll('g.axis-y text'))
    .map((t) => t.textContent ?? '')
    .filter((t) => t.length > 0);
}

describe('BasePlotLayout - axis.locale / axis.compactDisplay (configuration)', () => {
  afterEach(() => resetConfiguration());

  test('defaults to es-AR without any setConfiguration call', async () => {
    const ticks = await renderYTicks();
    expect(ticks.some((t) => /[A-Za-zÀ-ÿ]/.test(t))).toBe(true);
  });

  test('setConfiguration({ axis: { locale } }) changes every subsequently rendered chart', async () => {
    setConfiguration({ axis: { locale: 'en-US' } });
    const ticks = await renderYTicks();
    // en-US compact drops thousands grouping and ends in a bare letter (K/M/B/T).
    expect(ticks.some((t) => /[A-Za-z]$/.test(t))).toBe(true);
    expect(ticks.every((t) => !t.includes(','))).toBe(true);
  });

  test('es-AR and en-US render the same data differently', async () => {
    setConfiguration({ axis: { locale: 'en-US' } });
    const enTicks = await renderYTicks();
    resetConfiguration();

    setConfiguration({ axis: { locale: 'es-AR' } });
    const arTicks = await renderYTicks();

    expect(arTicks).not.toEqual(enTicks);
  });

  test('defaults to compactDisplay: long, spelling the unit out', async () => {
    const ticks = await renderYTicks();
    expect(ticks.some((t) => /[a-zA-ZÀ-ÿ]{4,}/.test(t))).toBe(true);
  });

  test('setConfiguration({ axis: { compactDisplay: "short" } }) switches to a single-letter unit', async () => {
    setConfiguration({ axis: { compactDisplay: 'short' } });
    const ticks = await renderYTicks();
    expect(ticks.every((t) => !/[a-zA-ZÀ-ÿ]{4,}/.test(t))).toBe(true);
  });
});
