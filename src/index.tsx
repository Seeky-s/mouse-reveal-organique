"use client";

import { forwardRef, useEffect, useRef, type HTMLAttributes } from "react";
import { mountReveal } from "./renderer.js";

export interface BoxMouseOrganiqueProps extends HTMLAttributes<HTMLDivElement> {
  /** Image visible before interaction. Relative URLs resolve against the page URL. */
  img_cover: string;
  /** Image revealed by the liquid mask. */
  img_background: string;
  /** Radius multiplier, 0.25–3. Default: 1. */
  size_mouse?: number;
  /** Approximate trail decay time in seconds, 0.2–6. Default: 2.2. */
  trail_duration?: number;
  /** Boundary irregularity, 0–2. Default: 1. */
  organic?: number;
  disabled?: boolean;
  /** Optional accessible description for the cover image. Default: decorative. */
  image_alt?: string;
  onImageError?: (error: Error) => void;
}

const bounded = (value: number, low: number, high: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(low, Math.min(high, value)) : fallback;

const BoxMouseOrganique = forwardRef<HTMLDivElement, BoxMouseOrganiqueProps>(
  function BoxMouseOrganique({
    img_cover, img_background, size_mouse = 1, trail_duration = 2.2,
    organic = 1, disabled = false, image_alt = "", onImageError,
    children, style, ...attributes
  }, forwardedRef) {
    const root = useRef<HTMLDivElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const errorHandler = useRef(onImageError);
    useEffect(() => { errorHandler.current = onImageError; }, [onImageError]);
    const size = bounded(size_mouse, 0.25, 3, 1);
    const trail = bounded(trail_duration, 0.2, 6, 2.2);
    const texture = bounded(organic, 0, 2, 1);
    useEffect(() => {
      if (disabled || !root.current || !canvas.current) return;
      return mountReveal(root.current, canvas.current, img_background, {
        size, trail, organic: texture, onError: error => errorHandler.current?.(error),
      });
    }, [img_background, disabled, size, trail, texture]);
    return (
      <div {...attributes} ref={node => {
        root.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }} style={{ ...style, position: style?.position === "static" ? "relative" : style?.position ?? "relative", isolation: "isolate", overflow: "hidden" }}>
        <img src={img_cover} alt={image_alt} draggable={false}
          onError={() => errorHandler.current?.(new Error("Unable to load the cover image: " + img_cover))}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", zIndex: -2 }} />
        <canvas ref={canvas} aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }} />
        {children}
      </div>
    );
  },
);

export { BoxMouseOrganique };
export default BoxMouseOrganique;
