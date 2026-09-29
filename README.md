# mouse-reveal-organique

A liquid image-reveal container for React 18/19, written in TypeScript. Move the pointer to reveal a second image through an evolving organic mask. Each instance owns its simulation; children remain ordinary, interactive React content.

```sh
npm install mouse-reveal-organique
```

```tsx
import BoxMouseOrganique from "mouse-reveal-organique";

export default function Hero() {
  return (
    <BoxMouseOrganique
      img_cover="/images/cover.jpg"
      img_background="/images/reveal.jpg"
      size_mouse={1}
      style={{ minHeight: 500, padding: 40, color: "white" }}
    >
      <h1>Your content, your CSS</h1>
      <a href="/about">Explore</a>
    </BoxMouseOrganique>
  );
}
```

No stylesheet or animation dependency is required. The default export and named `BoxMouseOrganique` export are equivalent. `BoxMouseOrganiqueProps` is exported as a TypeScript type.

## API

| Property                                                 | Default  | Description                                                                  |
| -------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `img_cover`                                              | required | Cover image URL.                                                             |
| `img_background`                                         | required | Revealed image URL.                                                          |
| `size_mouse`                                             | `1`      | Radius multiplier, clamped to `0.25–3`. Pass a number (`{1}`), not a string. |
| `trail_duration`                                         | `2.2`    | Approximate decay time in seconds, clamped to `0.2–6`.                       |
| `organic`                                                | `1`      | Boundary variation, clamped to `0–2`.                                        |
| `disabled`                                               | `false`  | Stop the effect and display only the cover.                                  |
| `image_alt`                                              | `""`     | Accessible description of the cover. Decorative by default.                  |
| `onImageError`                                           | —        | Callback receiving image-loading errors.                                     |
| `children`, `className`, `style`, `ref`, HTML attributes | —        | Forwarded to the containing div.                                             |

Give the box a height/min-height or content with sufficient height. Both images use centered `cover` sizing. URLs resolve against the page URL; in Next.js, use `/image.jpg` for a file in `public/image.jpg`. Imported image objects should be passed using their `.src` string.

The component reserves `position` (relative unless another non-static position is supplied inline), `isolation: isolate`, and `overflow: hidden`. Content is not wrapped in another element, so flex/grid layouts still work. Avoid negative z-index on children. The effect is decorative: do not place essential information only in the revealed image.

## Next.js

The distributed entry preserves `"use client"` and does not access browser globals during import or server rendering. It can be imported into an App Router page. If you pass event handlers such as `onImageError`, use a client component for that wrapper. No `ssr: false` workaround is required. This release includes an SSR smoke test, but has not yet been tested in a complete Next.js application.

## Accessibility and lifecycle

- Touch/coarse-pointer devices display the cover without the effect.
- Reduced-motion preference disables time-varying noise and velocity injection, and shortens the trail. Pointer-following reveal remains available; set `disabled` to remove it entirely.
- The canvas ignores pointer events and is hidden from assistive technology.
- Animation pauses offscreen and in hidden tabs. Observers, events and animation frames are cleaned up on unmount.
- No animation-driven React state updates. Canvas resolution is capped at device pixel ratio 2, simulation grid at 280 cells on its longest side. The mask is traced into interpolated, quadratic-smoothed contours and rasterized at canvas resolution, rather than enlarging a low-resolution alpha mask.

Modern browsers with Canvas 2D, ResizeObserver, IntersectionObserver and Pointer Events are required. Performance depends on box dimensions and the number of simultaneously active instances. External image display is supported, but an external image can taint the canvas; pixel export is not part of this API. Check your Content Security Policy allows your image URLs.

## Local development

```sh
npm install
npm run dev          # http://127.0.0.1:3001
npm run typecheck
npm run build
npm test
npm run demo:build
npm pack --dry-run
```

To test installation before publication, run `npm pack`, then install the resulting `.tgz` in a separate React project. Only the built library, documentation, provenance and license are included. React and React DOM are peer dependencies; Vite is demo-only.

Before publishing: review ownership/licensing, select your GitHub repository, add its repository URL to package.json, confirm the npm name is still available, test target browsers and a real Next.js app, and run the commands above. Creating this project does not publish anything automatically.

## Implementation and license

MIT. See [LICENSE](./LICENSE). This is a separately authored implementation, not the Framer component or a port of its shaders. It is not a pixel-identical reproduction of the reference.
