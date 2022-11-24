import { Animator, AtlasMeta } from '@/atlas-pack';
import { assertNonNull, U16Box, UnumberMillis } from '@/oidlib';
import atlasJSON from './atlas.json' assert { type: 'json' };
import { FilmID } from './FilmID.ts';

interface Demo {
  readonly window: Window;
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  readonly animator: Animator;
  readonly atlas: HTMLImageElement;
  readonly atlasMeta: AtlasMeta<FilmID>;
}

async function main(window: Window): Promise<void> {
  console.log(
    `
atlas-pack ┌>°┐
        by │  │idoid
           └──┘
    `.trim(),
  );

  const canvas = window.document.getElementsByTagName('canvas').item(0);
  assertNonNull(canvas, 'Canvas missing.');

  const context = canvas.getContext('2d');
  assertNonNull(context, 'Context missing.');

  // Use nearest neighbor scaling.
  context.imageSmoothingEnabled = false;

  const atlas = await loadImage('atlas.png');
  const atlasMeta = atlasJSON as unknown as AtlasMeta<FilmID>;
  const film = atlasMeta.filmByID.BackpackerWalkRight;
  const demo = {
    window,
    canvas,
    context,
    animator: Animator(film),
    atlas,
    atlasMeta,
  };
  window.requestAnimationFrame((now) =>
    loop(demo, UnumberMillis(now), UnumberMillis(now))
  );
}

function loop(demo: Demo, then: UnumberMillis, now: UnumberMillis): void {
  const millis = UnumberMillis(now - then);

  demo.context.clearRect(0, 0, demo.canvas.width, demo.canvas.height);
  Animator.play(demo.animator, millis);

  const scale = 16;
  const { bounds } = Animator.cel(demo.animator);
  const atlasSource = [
    bounds.start.x,
    bounds.start.y,
    U16Box.width(bounds),
    U16Box.height(bounds),
  ] as const;
  const canvasDestination = [
    0,
    0,
    U16Box.width(bounds) * scale,
    U16Box.height(bounds) * scale,
  ] as const;
  demo.context.drawImage(demo.atlas, ...atlasSource, ...canvasDestination);

  demo.window.requestAnimationFrame((then) =>
    loop(demo, now, UnumberMillis(then))
  );
}

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(image);
    image.src = uri;
  });
}

await main(window);
