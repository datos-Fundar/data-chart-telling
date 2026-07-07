import { vi } from 'vitest';

/** Waits until at least one <svg> is present in the container. */
export async function waitForSvg(container: Element): Promise<SVGElement> {
  let svg: SVGElement | null = null;
  await vi.waitFor(
    () => {
      svg = container.querySelector('svg');
      if (!svg) throw new Error('SVG not yet rendered');
    },
    { timeout: 3000, interval: 50 },
  );
  return svg!;
}

// svelteplot wraps each mark kind in its own <g class="…">; scoping by that
// class (rather than guessing tag names) is what actually distinguishes a
// line from a dot — both render as <path>, since Dot draws a d3.symbol path
// rather than an <svg:circle>.
export function countLinePaths(svg: SVGElement): number {
  return svg.querySelectorAll('g.lines path').length;
}

export function countDotMarks(svg: SVGElement): number {
  return svg.querySelectorAll('g.dot path').length;
}

export function countTextLabels(svg: SVGElement): number {
  return svg.querySelectorAll('g.text text').length;
}
